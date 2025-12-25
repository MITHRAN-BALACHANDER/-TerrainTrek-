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
        // Mission panel (redesigned)
        this.missionPanel = document.createElement('div')
        this.missionPanel.classList.add('mission-panel')
        this.missionPanel.innerHTML = `
            <div class="mission-row">
                <div class="mission-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" fill="#0b1220" />
                        <circle cx="12" cy="12" r="6" fill="#3ddc84" />
                        <circle cx="12" cy="12" r="2" fill="#ffffff" />
                    </svg>
                </div>
                <div class="mission-body">
                    <div class="mission-title">No Active Mission</div>
                    <div class="mission-objective">—</div>
                </div>
                <button class="mission-close" title="Hide">
                    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M6 6 L18 18 M6 18 L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
            <div class="mission-progress">
                <div class="mission-progress-bar"><div class="mission-progress-fill" style="width:0%"></div></div>
                <div class="mission-progress-text">0 / 0</div>
            </div>
        `
        document.querySelector('.ui').appendChild(this.missionPanel)

        // Close/hide handler
        this.missionPanel.querySelector('.mission-close').addEventListener('click', () => {
            this.missionPanel.style.display = 'none'
        })

        // Add styles (modern compact card)
        const style = document.createElement('style')
        style.textContent = `
            .mission-panel {
                position: fixed;
                top: 18px;
                left: 18px;
                width: 260px;
                background: linear-gradient(180deg, rgba(18,20,23,0.95), rgba(10,12,15,0.85));
                border-radius: 12px;
                padding: 10px 12px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.5);
                color: #e6f2ff;
                font-family: Inter, 'Segoe UI', system-ui, -apple-system, sans-serif;
                z-index: 1200;
                border: 1px solid rgba(255,255,255,0.06);
                backdrop-filter: blur(6px) saturate(120%);
            }

            .mission-row { display:flex; align-items:center; gap:10px }
            .mission-icon { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg,#3ddc84,#1fa2ff); border-radius:8px; font-size:18px }
            .mission-body { flex:1; min-width:0 }
            .mission-title { font-weight:700; font-size:13px; color:#bfffbf; text-transform:uppercase; letter-spacing:0.6px }
            .mission-objective { font-size:14px; color:rgba(255,255,255,0.9); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }

            .mission-close { background:transparent; border:none; color:rgba(255,255,255,0.7); font-size:14px; cursor:pointer; padding:6px; border-radius:6px }
            .mission-close:hover { background:rgba(255,255,255,0.03); color:#fff }

            .mission-progress { margin-top:10px; display:flex; align-items:center; gap:8px }
            .mission-progress-bar { flex:1; height:8px; background:rgba(255,255,255,0.06); border-radius:6px; overflow:hidden }
            .mission-progress-fill { height:100%; background:linear-gradient(90deg,#ffd700,#ffb347); width:0%; transition:width 300ms ease }
            .mission-progress-text { font-size:12px; color:rgba(255,255,255,0.65); min-width:48px; text-align:right }

            .mission-panel.hidden { opacity:0; transform:translateY(-6px); pointer-events:none }

            .mission-complete-popup { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); padding:22px 28px; background:linear-gradient(135deg,#222,#111); border-radius:12px; color:#ffd700; z-index:2000; border:2px solid rgba(255,215,0,0.15) }
            .mission-complete-popup .reward { font-size:14px; color:#fff; margin-top:6px }
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
            <div style="display:flex;align-items:center;gap:10px;">
                <svg width="32" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M7 4v2a5 5 0 0 0 5 5v3H9v2h6v-2h-3v-3a5 5 0 0 0 5-5V4H7z" fill="#ffd700" />
                </svg>
                <div style="font-weight:700;color:#ffd700;">MISSION COMPLETE!</div>
            </div>
            <div class="reward">+${mission.reward.xp} XP | +${mission.reward.coins} <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="vertical-align:middle;margin-left:6px"><circle cx="12" cy="12" r="8" fill="#ffd700"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg></div>
        `
        document.querySelector('.ui').appendChild(popup)
        
        setTimeout(() => popup.remove(), 2000)
    }

    showAllComplete()
    {
        const popup = document.createElement('div')
        popup.classList.add('mission-complete-popup')
        popup.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
                <svg width="28" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 2l1.9 4.1L18 7l-3 2.6L15.8 14 12 11.6 8.2 14 9 9.6 6 7l4.1-.9L12 2z" fill="#ffd54a"/>
                </svg>
                <div style="font-weight:700;color:#ffd54a;">ALL MISSIONS COMPLETE!</div>
            </div>
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
