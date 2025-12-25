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
        // Unified HUD panel: level, speed, coins (compact single element)
        this.statsPanel = document.createElement('div')
        this.statsPanel.classList.add('stats-panel')
        this.statsPanel.innerHTML = `
            <div class="hud-row level-row">
                <span class="hud-label">LEVEL</span>
                <span class="hud-value level-value">${this.level}</span>
            </div>
            <div class="hud-row speed-row">
                <span class="hud-label">SPEED</span>
                <span class="hud-value speed-value">${this.speed.toFixed(2)}x</span>
            </div>
            <div class="hud-row coins-row">
                <span class="hud-label">COINS</span>
                <span class="hud-value coins-value">${this.totalCoins}</span>
            </div>
        `
        const target = document.querySelector('.ui') || document.body
        target.appendChild(this.statsPanel)
        
        // Level up popup
        this.levelUpPopup = document.createElement('div')
        this.levelUpPopup.classList.add('level-up-popup')
        this.levelUpPopup.style.display = 'none'
        document.querySelector('.ui').appendChild(this.levelUpPopup)
        
        // Add styles (compact HUD)
        const style = document.createElement('style')
        style.textContent = `
            .stats-panel {
                position: fixed;
                top: 14px;
                left: 14px;
                right: auto !important;
                padding: 6px 8px !important;
                background: rgba(0, 0, 0, 0.6) !important;
                backdrop-filter: none !important;
                border: 1px solid rgba(255, 255, 255, 0.06) !important;
                border-radius: 10px !important;
                color: #fff !important;
                font-family: 'Segoe UI', sans-serif !important;
                min-width: 110px !important;
                max-width: 260px !important;
                width: auto !important;
                z-index: 1000 !important;
                display: inline-flex !important;
                flex-direction: column !important;
                gap: 4px !important;
                align-items: flex-start !important;
                pointer-events: auto !important;
                box-shadow: 0 6px 18px rgba(0,0,0,0.35) !important;
                height: auto !important;
                max-height: 180px !important;
                overflow: visible !important;
                box-sizing: border-box !important;
            }

            .hud-row {
                display: flex !important;
                justify-content: space-between !important;
                width: 100% !important;
                align-items: center !important;
                gap: 6px !important;
                direction: ltr !important;
                padding: 2px 0 !important;
                margin: 0 !important;
            }

            .hud-label {
                font-size: 10px;
                color: rgba(255,255,255,0.7);
                letter-spacing: 1px;
            }

            .hud-value {
                font-size: 16px;
                font-weight: 700;
                color: #fff;
            }

            .level-value { color: #FFD700; }
            .speed-value { color: #9EEBA0; }
            .coins-value { color: #FFD700; }

            .level-up-popup {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 30px 40px;
                background: linear-gradient(135deg, rgba(156, 39, 176, 0.95), rgba(233, 30, 99, 0.95));
                border: 3px solid #FFD700;
                border-radius: 12px;
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

    updateCoins(count)
    {
        this.totalCoins = count
        if(this.statsPanel) {
            const el = this.statsPanel.querySelector('.coins-value')
            if(el) el.textContent = String(this.totalCoins)
        }
    }

    updateSpeed(speed)
    {
        this.speed = speed
        if(this.statsPanel) {
            const el = this.statsPanel.querySelector('.speed-value')
            if(el) el.textContent = `${this.speed.toFixed(2)}x`
        }
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

        const lvl = this.statsPanel.querySelector('.level-value')
        if(lvl) lvl.textContent = String(this.level)

        const sp = this.statsPanel.querySelector('.speed-value')
        if(sp) sp.textContent = `${this.speed.toFixed(2)}x`

        const coinsEl = this.statsPanel.querySelector('.coins-value')
        if(coinsEl) coinsEl.textContent = String(this.totalCoins)
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
