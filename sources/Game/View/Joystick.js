export default class Joystick
{
    constructor(controls, options = {})
    {
        this.controls = controls
        this.keysDown = this.controls.keys.down
        this.options = options
        // side: 'left' or 'right'
        this.side = options.side || 'left'
        this.active = false
        this.touchId = null
        this.maxDistance = options.size ? Math.round(options.size * 0.35) : 50
        this.size = options.size || 140

        this.createUI()
    }

    createUI()
    {
        // Container
        this.container = document.createElement('div')
        this.container.classList.add('joystick-container')
        this.container.style.position = 'fixed'
        // Position on left or right based on option
        if(this.side === 'right'){
            this.container.style.right = '20px'
            this.container.style.left = 'auto'
        } else {
            this.container.style.left = '20px'
            this.container.style.right = 'auto'
        }
        this.container.style.bottom = '20px'
        this.container.style.width = this.size + 'px'
        this.container.style.height = this.size + 'px'
        this.container.style.zIndex = 1500
        this.container.style.touchAction = 'none'

        // Base
        this.base = document.createElement('div')
        this.base.classList.add('joystick-base')
        this.base.style.width = '100%'
        this.base.style.height = '100%'
        this.base.style.borderRadius = '50%'
        this.base.style.background = 'rgba(0,0,0,0.25)'
        this.base.style.display = 'flex'
        this.base.style.alignItems = 'center'
        this.base.style.justifyContent = 'center'
        this.base.style.backdropFilter = 'blur(6px)'

        // Knob
        this.knob = document.createElement('div')
        this.knob.classList.add('joystick-knob')
        const knobSize = Math.round(this.size * 0.36)
        this.knob.style.width = knobSize + 'px'
        this.knob.style.height = knobSize + 'px'
        this.knob.style.borderRadius = '50%'
        this.knob.style.background = 'linear-gradient(180deg,#9bf1a8,#2bd07a)'
        this.knob.style.boxShadow = '0 6px 18px rgba(0,0,0,0.45)'
        this.knob.style.transform = 'translate(0px, 0px)'
        this.knob.style.transition = 'transform 0.05s linear'
        this.knob.style.touchAction = 'none'

        this.base.appendChild(this.knob)
        this.container.appendChild(this.base)
        document.querySelector('.ui').appendChild(this.container)

        // Styles (minimal)
        const style = document.createElement('style')
        style.textContent = `
            .joystick-container { user-select:none }
        `
        document.head.appendChild(style)

        // Events
        // Bind handlers so we can remove them later
        this._onTouchStart = this.onTouchStart.bind(this)
        this._onTouchMove = this.onTouchMove.bind(this)
        this._onTouchEnd = this.onTouchEnd.bind(this)

        this.base.addEventListener('touchstart', this._onTouchStart, { passive: false })
        window.addEventListener('touchmove', this._onTouchMove, { passive: false })
        window.addEventListener('touchend', this._onTouchEnd, { passive: false })
        window.addEventListener('touchcancel', this._onTouchEnd, { passive: false })

        // Pointer events fallback (mouse / stylus) so joystick works in emulation and desktop testing
        this._onPointerDown = (e) => {
            // Only handle primary button
            if(e.pointerType === 'mouse' && e.button !== 0) return
            e.preventDefault && e.preventDefault()
            this.pointerActive = true
            // mimic a touch event structure for reuse
            const fake = { changedTouches: [ { identifier: 'mouse', clientX: e.clientX, clientY: e.clientY } ], preventDefault: () => {} }
            this.onTouchStart(fake)
        }
        this._onPointerMove = (e) => {
            if(!this.pointerActive) return
            e.preventDefault && e.preventDefault()
            const fake = { changedTouches: [ { identifier: 'mouse', clientX: e.clientX, clientY: e.clientY } ], preventDefault: () => {} }
            this.onTouchMove(fake)
        }
        this._onPointerUp = (e) => {
            if(!this.pointerActive) return
            e.preventDefault && e.preventDefault()
            this.pointerActive = false
            const fake = { changedTouches: [ { identifier: 'mouse', clientX: e.clientX, clientY: e.clientY } ], preventDefault: () => {} }
            this.onTouchEnd(fake)
        }

        this.base.addEventListener('pointerdown', this._onPointerDown)
        window.addEventListener('pointermove', this._onPointerMove)
        window.addEventListener('pointerup', this._onPointerUp)
    }

    onTouchStart(e)
    {
        e.preventDefault()
        const t = e.changedTouches[0]
        this.touchId = t.identifier
        this.active = true
        const rect = this.base.getBoundingClientRect()
        this.centerX = rect.left + rect.width / 2
        this.centerY = rect.top + rect.height / 2
        this.updateFromPoint(t.clientX, t.clientY)
    }

    onTouchMove(e)
    {
        if(!this.active) return
        for(const t of e.changedTouches)
        {
            if(t.identifier === this.touchId)
            {
                e.preventDefault()
                this.updateFromPoint(t.clientX, t.clientY)
                break
            }
        }
    }

    onTouchEnd(e)
    {
        if(!this.active) return
        for(const t of e.changedTouches)
        {
            if(t.identifier === this.touchId)
            {
                e.preventDefault()
                this.touchId = null
                this.active = false
                this.reset()
                break
            }
        }
    }

    updateFromPoint(clientX, clientY)
    {
        const dx = clientX - this.centerX
        const dy = clientY - this.centerY
        // Y axis inverted for screen coords -> forward should be negative dy
        const distance = Math.sqrt(dx*dx + dy*dy)
        const max = this.maxDistance
        const clamped = Math.min(distance, max)
        const nx = dx / max
        const ny = dy / max

        const tx = (dx / distance) * clamped || 0
        const ty = (dy / distance) * clamped || 0

        this.knob.style.transform = `translate(${tx}px, ${ty}px)`

        // Determine directions
        const angle = Math.atan2(dy, dx) // radians, right = 0, down = PI/2
        const mag = Math.min(1, distance / max)

        // Reset
        this.keysDown.forward = false
        this.keysDown.backward = false
        this.keysDown.strafeLeft = false
        this.keysDown.strafeRight = false

        const threshold = 0.25
        if(mag > threshold)
        {
            // Use 8-directional mapping
            const deg = angle * 180 / Math.PI
            // Forward (up on screen) corresponds to negative dy -> angle approx -90deg
            if(deg > -135 && deg < -45) this.keysDown.forward = true
            if(deg > 45 && deg < 135) this.keysDown.backward = true
            if(deg > -45 && deg < 45) this.keysDown.strafeRight = true
            if(deg > 135 || deg < -135) this.keysDown.strafeLeft = true
        }
    }

    onResize()
    {
        // Recalculate sizes based on current container size
        if(!this.container) return
        const rect = this.container.getBoundingClientRect()
        // If a responsive size was provided via options, recompute
        if(this.options.size && this.options.responsive)
        {
            this.size = Math.round(Math.min(rect.width, rect.height))
            this.container.style.width = this.size + 'px'
            this.container.style.height = this.size + 'px'
        }

        // Recompute knob and maxDistance
        const knobSize = Math.round(this.size * 0.36)
        this.knob.style.width = knobSize + 'px'
        this.knob.style.height = knobSize + 'px'
        this.maxDistance = Math.round(this.size * 0.35)
    }

    reset()
    {
        this.knob.style.transform = 'translate(0px, 0px)'
        this.keysDown.forward = false
        this.keysDown.backward = false
        this.keysDown.strafeLeft = false
        this.keysDown.strafeRight = false
    }

    destroy()
    {
        if(this.container && this.container.parentElement) this.container.parentElement.removeChild(this.container)
        if(this._onTouchStart) this.base.removeEventListener('touchstart', this._onTouchStart)
        if(this._onTouchMove) window.removeEventListener('touchmove', this._onTouchMove)
        if(this._onTouchEnd) {
            window.removeEventListener('touchend', this._onTouchEnd)
            window.removeEventListener('touchcancel', this._onTouchEnd)
        }

        // Remove pointer listeners if present
        if(this._onPointerDown) this.base.removeEventListener('pointerdown', this._onPointerDown)
        if(this._onPointerMove) window.removeEventListener('pointermove', this._onPointerMove)
        if(this._onPointerUp) window.removeEventListener('pointerup', this._onPointerUp)
    }
}
