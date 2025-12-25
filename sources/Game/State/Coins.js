import { vec3 } from 'gl-matrix'
import Game from '@/Game.js'
import State from '@/State/State.js'

export default class Coins
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        
        this.coins = []
        this.collectedCount = 0
        this.collectionRadius = 2.0
        
        this.setupUI()
        this.generateCoins()
    }

    setupUI()
    {
        this.coinCounter = document.createElement('div')
        this.coinCounter.classList.add('coin-counter')
        this.coinCounter.textContent = `💰 Coins: ${this.collectedCount}`
        document.querySelector('.ui').appendChild(this.coinCounter)
    }

    generateCoins()
    {
        // Generate coins in a pattern around the world
        const numCoins = 20
        const spread = 50
        
        for(let i = 0; i < numCoins; i++)
        {
            const angle = (i / numCoins) * Math.PI * 2
            const distance = 10 + Math.random() * spread
            
            const x = Math.cos(angle) * distance
            const z = Math.sin(angle) * distance
            
            // Get terrain height at this position
            const elevation = this.state.chunks.getElevationForPosition(x, z) || 0
            
            this.coins.push({
                id: i,
                position: vec3.fromValues(x, elevation + 2, z), // Float 2 units above terrain
                collected: false,
                shatterProgress: 0,
                shatterVelocities: []
            })
        }
    }

    checkCollisions()
    {
        if(!this.state.player) return

        const playerPos = this.state.player.position.current
        
        this.coins.forEach(coin => {
            if(!coin.collected)
            {
                const dx = coin.position[0] - playerPos[0]
                const dy = coin.position[1] - playerPos[1]
                const dz = coin.position[2] - playerPos[2]
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
                
                if(distance < this.collectionRadius)
                {
                    this.collectCoin(coin)
                }
            }
        })
    }

    collectCoin(coin)
    {
        coin.collected = true
        coin.collectionTime = this.state.time.elapsed
        this.collectedCount++
        
        // Update UI
        this.coinCounter.textContent = `💰 Coins: ${this.collectedCount}`
        
        // Add particle burst effect data
        coin.shatterProgress = 0
        
        // Play collection sound
        if(this.state.audio)
        {
            this.state.audio.playCoinCollect()
        }
        
        // Award XP for collecting
        if(this.state.progression)
        {
            this.state.progression.addXP(10)
        }
    }

    update()
    {
        this.checkCollisions()
        
        // Update collected coins for shatter animation
        this.coins.forEach(coin => {
            if(coin.collected && coin.shatterProgress < 1)
            {
                const elapsed = this.state.time.elapsed - coin.collectionTime
                coin.shatterProgress = Math.min(elapsed * 2, 1) // 0.5 second animation
            }
        })
    }

    destroy()
    {
        if(this.coinCounter && this.coinCounter.parentElement)
        {
            this.coinCounter.parentElement.removeChild(this.coinCounter)
        }
    }
}
