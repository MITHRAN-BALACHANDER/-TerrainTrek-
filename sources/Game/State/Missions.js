import Game from '@/Game.js'
import State from '@/State/State.js'
import { vec3 } from 'gl-matrix'

export default class Missions
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        
        this.missions = []
        this.currentMission = null
        this.completedMissions = 0
        
        this.setupUI()
        this.generateMissions()
        this.startNextMission()
    }

    setupUI()
    {
        // Mission panel
        this.missionPanel = document.createElement('div')
        this.missionPanel.classList.add('mission-panel')
        this.missionPanel.innerHTML = `
            <div class="mission-title">No Active Mission</div>
            <div class="mission-objective"></div>
            <div class="mission-progress"></div>
        `
        document.querySelector('.ui').appendChild(this.missionPanel)
        
        // Add styles
        const style = document.createElement('style')
        style.textContent = `
            .mission-panel {
                position: fixed;
                top: 20px;
                left: 20px;
                padding: 15px 20px;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(8px);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-left: 4px solid #4CAF50;
                border-radius: 8px;
                color: #fff;
                font-family: 'Segoe UI', sans-serif;
                min-width: 250px;
                z-index: 1000;
                transition: all 0.3s ease;
            }
            
            .mission-panel.completed {
                border-left-color: #FFD700;
                animation: missionComplete 0.5s ease;
            }
            
            @keyframes missionComplete {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .mission-title {
                font-size: 14px;
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .mission-objective {
                font-size: 16px;
                margin-bottom: 10px;
                line-height: 1.4;
            }
            
            .mission-progress {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .mission-progress-bar {
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                margin-top: 8px;
                overflow: hidden;
            }
            
            .mission-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                border-radius: 2px;
                transition: width 0.3s ease;
            }
            
            .mission-complete-popup {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 30px 50px;
                background: rgba(0, 0, 0, 0.9);
                border: 3px solid #FFD700;
                border-radius: 12px;
                color: #FFD700;
                font-family: 'Segoe UI', sans-serif;
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                z-index: 2000;
                animation: popupIn 0.5s ease;
            }
            
            @keyframes popupIn {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
            
            .mission-complete-popup .reward {
                font-size: 16px;
                color: #fff;
                margin-top: 10px;
            }
        `
        document.head.appendChild(style)
    }

    generateMissions()
    {
        // Mission types: collect, reach, time-trial
        this.missions = [
            {
                id: 1,
                type: 'collect',
                title: 'Coin Collector',
                objective: 'Collect 5 coins',
                target: 5,
                progress: 0,
                reward: { xp: 100, coins: 10 },
                completed: false
            },
            {
                id: 2,
                type: 'collect',
                title: 'Treasure Hunter',
                objective: 'Collect 10 coins',
                target: 10,
                progress: 0,
                reward: { xp: 250, coins: 25 },
                completed: false
            },
            {
                id: 3,
                type: 'reach',
                title: 'Explorer',
                objective: 'Travel 100 meters from spawn',
                target: 100,
                progress: 0,
                reward: { xp: 150, coins: 15 },
                completed: false,
                startPos: null
            },
            {
                id: 4,
                type: 'collect',
                title: 'Gold Rush',
                objective: 'Collect all 20 coins',
                target: 20,
                progress: 0,
                reward: { xp: 500, coins: 100 },
                completed: false
            },
            {
                id: 5,
                type: 'speed',
                title: 'Speed Demon',
                objective: 'Collect 5 coins in 30 seconds',
                target: 5,
                timeLimit: 30,
                progress: 0,
                startTime: null,
                reward: { xp: 300, coins: 50 },
                completed: false
            }
        ]
    }

    startNextMission()
    {
        // Find first incomplete mission
        const nextMission = this.missions.find(m => !m.completed)
        
        if(nextMission)
        {
            this.currentMission = nextMission
            
            // Initialize mission-specific data
            if(nextMission.type === 'reach' && this.state.player)
            {
                nextMission.startPos = vec3.clone(this.state.player.position.current)
            }
            if(nextMission.type === 'speed')
            {
                nextMission.startTime = this.state.time.elapsed
                nextMission.progress = 0
            }
            
            this.updateUI()
        }
        else
        {
            this.currentMission = null
            this.showAllComplete()
        }
    }

    updateUI()
    {
        if(!this.currentMission)
        {
            this.missionPanel.querySelector('.mission-title').textContent = 'All Missions Complete!'
            this.missionPanel.querySelector('.mission-objective').textContent = 'You are a true explorer!'
            this.missionPanel.querySelector('.mission-progress').innerHTML = ''
            return
        }
        
        const m = this.currentMission
        this.missionPanel.querySelector('.mission-title').textContent = m.title
        this.missionPanel.querySelector('.mission-objective').textContent = m.objective
        
        let progressText = `${Math.floor(m.progress)} / ${m.target}`
        if(m.type === 'speed' && m.startTime !== null)
        {
            const remaining = Math.max(0, m.timeLimit - (this.state.time.elapsed - m.startTime))
            progressText += ` | ⏱️ ${remaining.toFixed(1)}s`
        }
        
        const progressPercent = Math.min(100, (m.progress / m.target) * 100)
        this.missionPanel.querySelector('.mission-progress').innerHTML = `
            ${progressText}
            <div class="mission-progress-bar">
                <div class="mission-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
        `
    }

    completeMission(mission)
    {
        mission.completed = true
        this.completedMissions++
        
        // Award rewards
        if(this.state.progression)
        {
            this.state.progression.addXP(mission.reward.xp)
            this.state.progression.addCoins(mission.reward.coins)
        }
        
        // Show completion popup
        this.showCompletionPopup(mission)
        
        // Flash mission panel
        this.missionPanel.classList.add('completed')
        setTimeout(() => this.missionPanel.classList.remove('completed'), 500)
        
        // Start next mission after delay
        setTimeout(() => this.startNextMission(), 2000)
    }

    showCompletionPopup(mission)
    {
        const popup = document.createElement('div')
        popup.classList.add('mission-complete-popup')
        popup.innerHTML = `
            🏆 MISSION COMPLETE! 🏆
            <div class="reward">+${mission.reward.xp} XP | +${mission.reward.coins} 💰</div>
        `
        document.querySelector('.ui').appendChild(popup)
        
        setTimeout(() => popup.remove(), 2000)
    }

    showAllComplete()
    {
        const popup = document.createElement('div')
        popup.classList.add('mission-complete-popup')
        popup.innerHTML = `
            🎉 ALL MISSIONS COMPLETE! 🎉
            <div class="reward">Congratulations, Explorer!</div>
        `
        document.querySelector('.ui').appendChild(popup)
        
        setTimeout(() => popup.remove(), 3000)
    }

    update()
    {
        if(!this.currentMission || this.currentMission.completed) return
        
        const m = this.currentMission
        
        switch(m.type)
        {
            case 'collect':
                if(this.state.coins)
                {
                    m.progress = this.state.coins.collectedCount
                }
                break
                
            case 'reach':
                if(this.state.player && m.startPos)
                {
                    const pos = this.state.player.position.current
                    const dist = vec3.distance(pos, m.startPos)
                    m.progress = dist
                }
                break
                
            case 'speed':
                if(this.state.coins)
                {
                    // Count coins collected since mission started
                    m.progress = this.state.coins.collectedCount
                    
                    // Check time limit
                    const elapsed = this.state.time.elapsed - m.startTime
                    if(elapsed > m.timeLimit && m.progress < m.target)
                    {
                        // Failed - restart mission
                        m.startTime = this.state.time.elapsed
                        m.progress = 0
                    }
                }
                break
        }
        
        // Check completion
        if(m.progress >= m.target)
        {
            this.completeMission(m)
        }
        
        this.updateUI()
    }

    destroy()
    {
        if(this.missionPanel && this.missionPanel.parentElement)
        {
            this.missionPanel.parentElement.removeChild(this.missionPanel)
        }
    }
}
