import Game from '@/Game.js'
import State from '@/State/State.js'

export default class Minimap
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        
        this.setupCanvas()
        this.setupStyles()
        
        this.mapScale = 0.5 // Scale factor for the map
        this.mapSize = 150 // Size of the minimap in pixels
        this.playerDotSize = 4
        this.coinDotSize = 3
    }

    setupCanvas()
    {
        this.canvas = document.createElement('canvas')
        this.canvas.width = this.mapSize
        this.canvas.height = this.mapSize
        this.canvas.classList.add('minimap')
        
        this.ctx = this.canvas.getContext('2d')
        
        document.querySelector('.ui').appendChild(this.canvas)
    }

    setupStyles()
    {
        const style = document.createElement('style')
        style.textContent = `
            .minimap {
                position: fixed;
                top: 20px;
                right: 20px;
                border: 3px solid rgba(255, 255, 255, 0.8);
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                z-index: 1000;
            }

            .coin-counter {
                position: fixed;
                top: 180px;
                right: 20px;
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
        
        // Clear canvas
        ctx.clearRect(0, 0, this.mapSize, this.mapSize)
        
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
        
        // Draw coins
        if(this.state.coins.coins)
        {
            this.state.coins.coins.forEach(coin => {
                if(!coin.collected)
                {
                    const relX = (coin.position[0] - playerPos[0]) * this.mapScale
                    const relZ = (coin.position[2] - playerPos[2]) * this.mapScale
                    
                    const screenX = centerX + relX
                    const screenY = centerY + relZ
                    
                    // Only draw if in range
                    if(Math.abs(relX) < this.mapSize / 2 && Math.abs(relZ) < this.mapSize / 2)
                    {
                        // Coin glow
                        ctx.shadowBlur = 8
                        ctx.shadowColor = '#ffd700'
                        
                        ctx.fillStyle = '#ffd700'
                        ctx.beginPath()
                        ctx.arc(screenX, screenY, this.coinDotSize, 0, Math.PI * 2)
                        ctx.fill()
                        
                        // Reset shadow
                        ctx.shadowBlur = 0
                    }
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
        if(this.canvas && this.canvas.parentElement)
        {
            this.canvas.parentElement.removeChild(this.canvas)
        }
    }
}
