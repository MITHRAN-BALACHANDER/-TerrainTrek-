import Game from '@/Game.js'
import State from '@/State/State.js'

export default class Minimap
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        
        // Map settings (initialized responsively)
        this.mapScale = 2 // Scale factor for the map (higher = more zoomed out)

        // compute size responsively then create canvas and styles
        this.computeSize()

        this.setupCanvas()
        this.setupStyles()

        // Update canvas on window resize / orientation change
        this._onResize = () => {
            // debounce to avoid spamming during resize drag
            if(this._resizeTimeout) clearTimeout(this._resizeTimeout)
            this._resizeTimeout = setTimeout(() => {
                this.onResize()
            }, 120)
        }
        window.addEventListener('resize', this._onResize)
        window.addEventListener('orientationchange', this._onResize)
    }

    computeSize()
    {
        // Map size adapts to viewport width but stays within sensible bounds
        const vw = Math.max(360, window.innerWidth)
        // Use up to 12% of viewport width, clamped between 100 and 180px (smaller map)
        this.mapSize = Math.max(100, Math.min(180, Math.round(vw * 0.12)))

        // Scale dot sizes relative to mapSize (slightly smaller)
        this.playerDotSize = Math.max(3, Math.round(this.mapSize * 0.035))
        this.coinDotSize = Math.max(2, Math.round(this.mapSize * 0.025))
    }

    onResize()
    {
        // Recompute sizes and update canvas element
        this.computeSize()

        if(this.canvas)
        {
            this.canvas.width = this.mapSize
            this.canvas.height = this.mapSize
            this.canvas.style.width = this.mapSize + 'px'
            this.canvas.style.height = this.mapSize + 'px'
        }
        else
        {
            this.setupCanvas()
        }
    }

    setupCanvas()
    {
        // Create a fixed-size wrapper to avoid canvas being affected by global CSS
        if(!this.wrapper)
        {
            this.wrapper = document.createElement('div')
            this.wrapper.classList.add('minimap-wrap')
            // Create canvas inside wrapper
            this.canvas = document.createElement('canvas')
            this.canvas.classList.add('minimap')
            this.wrapper.appendChild(this.canvas)
            // Camera toggle button (will be positioned near the minimap)
            this._cameraBtn = document.createElement('button')
            this._cameraBtn.classList.add('minimap-camera-btn')
            this._cameraBtn.type = 'button'
            this._cameraBtn.title = 'Change camera view'
            this.wrapper.appendChild(this._cameraBtn)

            // Camera modes sequence: 3rd-person (default), 2nd-person (close over-the-shoulder), 1st-person (FPV / fly)
            this._cameraModes = ['3pv', '2pv', 'fpv']
            this._cameraModeIndex = 0
            this._updateCameraBtn = () => {
                const mode = this._cameraModes[this._cameraModeIndex]
                // simple visual indicator
                this._cameraBtn.textContent = mode.toUpperCase()
                this._cameraBtn.setAttribute('aria-label', `Camera mode ${mode}`)
            }

            this._onCameraBtnClick = () => {
                try {
                    const playerCam = this.state && this.state.player && this.state.player.camera
                    if(!playerCam) return

                    // advance
                    this._cameraModeIndex = (this._cameraModeIndex + 1) % this._cameraModes.length
                    const mode = this._cameraModes[this._cameraModeIndex]

                    if(mode === '3pv')
                    {
                        playerCam.mode = playerCam.constructor.MODE_THIRDPERSON || playerCam.MODE_THIRDPERSON
                        // restore default distance
                        if(playerCam.thirdPerson) playerCam.thirdPerson.distance = 15
                        if(playerCam.thirdPerson) playerCam.thirdPerson.activate()
                        if(playerCam.fly) playerCam.fly.deactivate()
                    }
                    else if(mode === '2pv')
                    {
                        playerCam.mode = playerCam.constructor.MODE_THIRDPERSON || playerCam.MODE_THIRDPERSON
                        if(playerCam.thirdPerson) playerCam.thirdPerson.distance = 6
                        if(playerCam.thirdPerson) playerCam.thirdPerson.activate()
                        if(playerCam.fly) playerCam.fly.deactivate()
                    }
                    else if(mode === 'fpv')
                    {
                        // Use fly as a FPV proxy: activate fly at player's current camera position/orientation
                        playerCam.mode = playerCam.constructor.MODE_FLY || playerCam.MODE_FLY
                        if(playerCam.fly) playerCam.fly.activate(playerCam.position, playerCam.quaternion)
                        if(playerCam.thirdPerson) playerCam.thirdPerson.deactivate()
                    }

                    this._updateCameraBtn()
                } catch(e) { console.warn('Failed to change camera preset', e) }
            }

            this._cameraBtn.addEventListener('click', this._onCameraBtnClick)
            this._updateCameraBtn()
            const target = document.querySelector('.ui') || document.body
            target.appendChild(this.wrapper)
            this.ctx = this.canvas.getContext('2d')
        }

        // Ensure canvas uses current computed size and device pixel ratio
        const dpr = Math.max(1, window.devicePixelRatio || 1)
        this._dpr = dpr
        // Wrapper uses CSS px size; canvas actual pixel size uses DPR
        this.wrapper.style.width = this.mapSize + 'px'
        this.wrapper.style.height = this.mapSize + 'px'
        this.canvas.width = Math.round(this.mapSize * dpr)
        this.canvas.height = Math.round(this.mapSize * dpr)
        this.canvas.style.width = '100%'
        this.canvas.style.height = '100%'
        this.canvas.style.display = 'block'
        // Reset transform and scale for crisp rendering
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    setupStyles()
    {
        const style = document.createElement('style')
        style.textContent = `
            .minimap-wrap {
                position: fixed;
                top: 20px;
                right: 20px;
                border: 3px solid rgba(255, 255, 255, 0.8);
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.6);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                z-index: 1002;
                overflow: hidden;
            }

            .minimap {
                width: 100%;
                height: 100%;
                display: block;
            }

            .minimap-camera-btn {
                position: absolute;
                bottom: 6px;
                left: 6px;
                width: 28px;
                height: 28px;
                border-radius: 6px;
                border: none;
                background: linear-gradient(180deg,#1f2937,#111827);
                color: #fff;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 8px rgba(0,0,0,0.4);
                opacity: 0.95;
                z-index: 1003;
            }

            .minimap-camera-btn:after {
                content: '';
                width: 12px;
                height: 8px;
                background-image: radial-gradient(circle at 50% 35%, #9EEBA0 0%, #9EEBA0 40%, transparent 41%);
                display: block;
                transform: translateY(-2px);
            }

            .coin-counter {
                position: fixed;
                top: 20px;
                left: 20px;
                padding: 12px 18px;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                border: 2px solid rgba(255, 215, 0, 0.8);
                border-radius: 8px;
                color: #ffd700;
                font-family: 'Courier New', monospace;
                font-size: 18px;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                z-index: 1000;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            }
        `
        document.head.appendChild(style)
    }

    update()
    {
        if(!this.state.player || !this.state.coins) return

        const ctx = this.ctx
        const centerX = this.mapSize / 2
        const centerY = this.mapSize / 2
            const dpr = Math.max(1, window.devicePixelRatio || 1)
            this._dpr = dpr
            this.canvas.width = Math.round(this.mapSize * dpr)
            this.canvas.height = Math.round(this.mapSize * dpr)
            this.canvas.style.width = this.mapSize + 'px'
            this.canvas.style.height = this.mapSize + 'px'
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        // Draw background with gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.mapSize / 2)
        gradient.addColorStop(0, 'rgba(20, 30, 40, 0.9)')
        gradient.addColorStop(1, 'rgba(10, 15, 20, 0.9)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, this.mapSize, this.mapSize)
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 1
        const gridSize = 20
        for(let i = 0; i < this.mapSize; i += gridSize)
        {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i, this.mapSize)
            ctx.stroke()
            
            ctx.beginPath()
            ctx.moveTo(0, i)
            ctx.lineTo(this.mapSize, i)
            ctx.stroke()
        }
        
        const playerPos = this.state.player.position.current
        
        // Draw all coins (not just nearby ones)
        if(this.state.coins.coins)
        {
            this.state.coins.coins.forEach(coin => {
                if(!coin.collected)
                {
                    const relX = (coin.position[0] - playerPos[0]) * this.mapScale
                    const relZ = (coin.position[2] - playerPos[2]) * this.mapScale
                    
                    const screenX = centerX + relX
                    const screenY = centerY + relZ
                    
                    // Draw ALL coins on map
                    const distFromCenter = Math.sqrt(relX * relX + relZ * relZ)
                    const maxDist = this.mapSize / 2 - 10
                    
                    // Clamp to minimap bounds but still show direction
                    let finalX = screenX
                    let finalY = screenY
                    
                    if(distFromCenter > maxDist)
                    {
                        // Draw at edge pointing in direction
                        const angle = Math.atan2(relZ, relX)
                        finalX = centerX + Math.cos(angle) * maxDist
                        finalY = centerY + Math.sin(angle) * maxDist
                    }
                    
                    // Coin glow
                    ctx.shadowBlur = 8
                    ctx.shadowColor = '#ffd700'
                    
                    // Use different opacity for coins outside view
                    if(distFromCenter > maxDist)
                    {
                        ctx.fillStyle = 'rgba(255, 215, 0, 0.5)' // Faded for off-screen
                    }
                    else
                    {
                        ctx.fillStyle = '#ffd700' // Bright for on-screen
                    }
                    
                    ctx.beginPath()
                    ctx.arc(finalX, finalY, this.coinDotSize, 0, Math.PI * 2)
                    ctx.fill()
                    
                    // Draw arrow for off-screen coins
                    if(distFromCenter > maxDist)
                    {
                        const angle = Math.atan2(relZ, relX)
                        ctx.save()
                        ctx.translate(finalX, finalY)
                        ctx.rotate(angle)
                        
                        ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)'
                        ctx.lineWidth = 2
                        ctx.beginPath()
                        ctx.moveTo(3, 0)
                        ctx.lineTo(0, -2)
                        ctx.lineTo(0, 2)
                        ctx.closePath()
                        ctx.stroke()
                        
                        ctx.restore()
                    }
                    
                    // Reset shadow
                    ctx.shadowBlur = 0
                }
            })
        }
        
        // Draw player arrow (pointing in movement direction)
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(-this.state.player.rotation)
        
        // Player arrow with glow
        ctx.shadowBlur = 10
        ctx.shadowColor = '#00ff00'
        ctx.fillStyle = '#00ff00'
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        
        ctx.beginPath()
        ctx.moveTo(0, -this.playerDotSize * 2)
        ctx.lineTo(-this.playerDotSize, this.playerDotSize)
        ctx.lineTo(0, 0)
        ctx.lineTo(this.playerDotSize, this.playerDotSize)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        
        ctx.restore()
        
        // Draw north indicator
        ctx.font = '12px Arial'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.textAlign = 'center'
        ctx.fillText('N', centerX, 12)
    }

    destroy()
    {
        if(this._cameraBtn) {
            this._cameraBtn.removeEventListener('click', this._onCameraBtnClick)
            this._onCameraBtnClick = null
        }
        if(this.wrapper && this.wrapper.parentElement)
        {
            this.wrapper.parentElement.removeChild(this.wrapper)
        }

        if(this._onResize) {
            window.removeEventListener('resize', this._onResize)
            window.removeEventListener('orientationchange', this._onResize)
        }
    }
}
