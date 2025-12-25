import Game from '@/Game.js'
import State from '@/State/State.js'

export default class Progression
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        
        // Player stats
        this.level = 1
        this.xp = 0
        this.xpToNextLevel = 100
        this.totalCoins = 0
        
        // Player attributes
        this.health = 100
        this.maxHealth = 100
        this.stamina = 100
        this.maxStamina = 100
        this.speed = 1.0
        
        // Load saved data
        this.load()
        
        this.setupUI()
        this.setupStaminaSystem()
    }

    setupUI()
    {
        // Stats panel
        this.statsPanel = document.createElement('div')
        this.statsPanel.classList.add('stats-panel')
        this.statsPanel.innerHTML = `
            <div class="stat-row level-row">
                <span class="stat-label">LEVEL</span>
                <span class="stat-value level-value">${this.level}</span>
            </div>
            <div class="stat-row xp-row">
                <div class="xp-bar">
                    <div class="xp-fill"></div>
                </div>
                <span class="xp-text">${this.xp}/${this.xpToNextLevel} XP</span>
            </div>
            <div class="stat-row health-row">
                <span class="stat-icon">❤️</span>
                <div class="bar-container">
                    <div class="bar health-bar"></div>
                </div>
                <span class="stat-text health-text">${this.health}</span>
            </div>
            <div class="stat-row stamina-row">
                <span class="stat-icon">⚡</span>
                <div class="bar-container">
                    <div class="bar stamina-bar"></div>
                </div>
                <span class="stat-text stamina-text">${Math.floor(this.stamina)}</span>
            </div>
        `
        document.querySelector('.ui').appendChild(this.statsPanel)
        
        // Level up popup
        this.levelUpPopup = document.createElement('div')
        this.levelUpPopup.classList.add('level-up-popup')
        this.levelUpPopup.style.display = 'none'
        document.querySelector('.ui').appendChild(this.levelUpPopup)
        
        // Add styles
        const style = document.createElement('style')
        style.textContent = `
            .stats-panel {
                position: fixed;
                bottom: 20px;
                left: 20px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(8px);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                color: #fff;
                font-family: 'Segoe UI', sans-serif;
                min-width: 200px;
                z-index: 1000;
            }
            
            .stat-row {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .stat-row:last-child {
                margin-bottom: 0;
            }
            
            .level-row {
                justify-content: space-between;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                margin-bottom: 10px;
            }
            
            .stat-label {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                letter-spacing: 2px;
            }
            
            .level-value {
                font-size: 24px;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            }
            
            .xp-row {
                flex-direction: column;
                align-items: stretch;
                margin-bottom: 12px;
            }
            
            .xp-bar {
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 4px;
            }
            
            .xp-fill {
                height: 100%;
                background: linear-gradient(90deg, #9C27B0, #E91E63);
                border-radius: 3px;
                transition: width 0.3s ease;
            }
            
            .xp-text {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.6);
                text-align: right;
            }
            
            .stat-icon {
                font-size: 14px;
                margin-right: 8px;
            }
            
            .bar-container {
                flex: 1;
                height: 8px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .bar {
                height: 100%;
                border-radius: 4px;
                transition: width 0.2s ease;
            }
            
            .health-bar {
                background: linear-gradient(90deg, #f44336, #ff5722);
            }
            
            .stamina-bar {
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
            }
            
            .stat-text {
                font-size: 12px;
                min-width: 30px;
                text-align: right;
                margin-left: 8px;
            }
            
            .level-up-popup {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 40px 60px;
                background: linear-gradient(135deg, rgba(156, 39, 176, 0.95), rgba(233, 30, 99, 0.95));
                border: 3px solid #FFD700;
                border-radius: 16px;
                color: #fff;
                font-family: 'Segoe UI', sans-serif;
                text-align: center;
                z-index: 2000;
                animation: levelUp 0.6s ease;
            }
            
            @keyframes levelUp {
                0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
                100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
            }
            
            .level-up-popup .title {
                font-size: 28px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .level-up-popup .new-level {
                font-size: 48px;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 0 0 20px rgba(255,215,0,0.8);
                margin: 10px 0;
            }
            
            .level-up-popup .bonuses {
                font-size: 14px;
                opacity: 0.9;
            }
        `
        document.head.appendChild(style)
        
        this.updateUI()
    }

    setupStaminaSystem()
    {
        // Stamina depletes when sprinting, regenerates when not
        this.staminaDrainRate = 20 // per second when sprinting
        this.staminaRegenRate = 15 // per second when not sprinting
    }

    addXP(amount)
    {
        this.xp += amount
        
        // Check for level up
        while(this.xp >= this.xpToNextLevel)
        {
            this.xp -= this.xpToNextLevel
            this.levelUp()
        }
        
        this.save()
        this.updateUI()
    }

    addCoins(amount)
    {
        this.totalCoins += amount
        this.save()
    }

    levelUp()
    {
        this.level++
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5)
        
        // Increase stats
        this.maxHealth += 10
        this.health = this.maxHealth
        this.maxStamina += 5
        this.stamina = this.maxStamina
        this.speed += 0.05
        
        // Show level up popup
        this.showLevelUpPopup()
        
        this.save()
    }

    showLevelUpPopup()
    {
        this.levelUpPopup.innerHTML = `
            <div class="title">⬆️ LEVEL UP! ⬆️</div>
            <div class="new-level">${this.level}</div>
            <div class="bonuses">+10 Max Health | +5 Max Stamina | +5% Speed</div>
        `
        this.levelUpPopup.style.display = 'block'
        
        setTimeout(() => {
            this.levelUpPopup.style.display = 'none'
        }, 2500)
    }

    updateUI()
    {
        if(!this.statsPanel) return
        
        this.statsPanel.querySelector('.level-value').textContent = this.level
        
        const xpPercent = (this.xp / this.xpToNextLevel) * 100
        this.statsPanel.querySelector('.xp-fill').style.width = `${xpPercent}%`
        this.statsPanel.querySelector('.xp-text').textContent = `${this.xp}/${this.xpToNextLevel} XP`
        
        const healthPercent = (this.health / this.maxHealth) * 100
        this.statsPanel.querySelector('.health-bar').style.width = `${healthPercent}%`
        this.statsPanel.querySelector('.health-text').textContent = Math.floor(this.health)
        
        const staminaPercent = (this.stamina / this.maxStamina) * 100
        this.statsPanel.querySelector('.stamina-bar').style.width = `${staminaPercent}%`
        this.statsPanel.querySelector('.stamina-text').textContent = Math.floor(this.stamina)
    }

    update()
    {
        if(!this.state.controls || !this.state.time) return
        
        const dt = this.state.time.delta
        const isSprinting = this.state.controls.keys.down.boost
        
        if(isSprinting && this.stamina > 0)
        {
            this.stamina -= this.staminaDrainRate * dt
            if(this.stamina < 0) this.stamina = 0
        }
        else if(!isSprinting && this.stamina < this.maxStamina)
        {
            this.stamina += this.staminaRegenRate * dt
            if(this.stamina > this.maxStamina) this.stamina = this.maxStamina
        }
        
        this.updateUI()
    }

    save()
    {
        const data = {
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            totalCoins: this.totalCoins,
            maxHealth: this.maxHealth,
            maxStamina: this.maxStamina,
            speed: this.speed
        }
        localStorage.setItem('terrain-trek-progression', JSON.stringify(data))
    }

    load()
    {
        const saved = localStorage.getItem('terrain-trek-progression')
        if(saved)
        {
            try {
                const data = JSON.parse(saved)
                this.level = data.level || 1
                this.xp = data.xp || 0
                this.xpToNextLevel = data.xpToNextLevel || 100
                this.totalCoins = data.totalCoins || 0
                this.maxHealth = data.maxHealth || 100
                this.maxStamina = data.maxStamina || 100
                this.speed = data.speed || 1.0
                this.health = this.maxHealth
                this.stamina = this.maxStamina
            } catch(e) {
                console.warn('Failed to load progression:', e)
            }
        }
    }

    destroy()
    {
        if(this.statsPanel && this.statsPanel.parentElement)
        {
            this.statsPanel.parentElement.removeChild(this.statsPanel)
        }
        if(this.levelUpPopup && this.levelUpPopup.parentElement)
        {
            this.levelUpPopup.parentElement.removeChild(this.levelUpPopup)
        }
    }
}
