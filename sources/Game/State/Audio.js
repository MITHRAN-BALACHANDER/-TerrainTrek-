import Game from '@/Game.js'
import State from '@/State/State.js'

export default class Audio
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        
        this.audioContext = null
        this.masterGain = null
        this.sounds = {}
        
        this.enabled = true
        this.musicVolume = 0.3
        this.sfxVolume = 0.5
        
        this.init()
    }

    async init()
    {
        // Create audio context on first user interaction
        const initAudio = () => {
            if(this.audioContext) return
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
            this.masterGain = this.audioContext.createGain()
            this.masterGain.connect(this.audioContext.destination)
            this.masterGain.gain.value = 1.0
            
            // Create sounds using oscillators (no external files needed)
            this.createSynthSounds()
            
            document.removeEventListener('click', initAudio)
            document.removeEventListener('keydown', initAudio)
        }
        
        document.addEventListener('click', initAudio)
        document.addEventListener('keydown', initAudio)
    }

    createSynthSounds()
    {
        // Pre-define sound parameters for different effects
        this.soundParams = {
            coinCollect: {
                type: 'sine',
                frequencies: [880, 1108.73, 1318.51], // A5, C#6, E6 (A major chord)
                duration: 0.15,
                decay: 0.1
            },
            levelUp: {
                type: 'sine',
                frequencies: [523.25, 659.25, 783.99, 1046.50], // C5-E5-G5-C6 (ascending)
                duration: 0.2,
                decay: 0.15,
                delay: 0.1
            },
            missionComplete: {
                type: 'square',
                frequencies: [440, 554.37, 659.25, 880], // A4-C#5-E5-A5
                duration: 0.25,
                decay: 0.2,
                delay: 0.12
            },
            footstep: {
                type: 'noise',
                duration: 0.08,
                decay: 0.05
            },
            ambient: {
                type: 'sine',
                frequencies: [110, 164.81, 220], // Low drone
                duration: 2.0,
                decay: 1.0
            }
        }
    }

    playSound(name, options = {})
    {
        if(!this.enabled || !this.audioContext) return
        
        const params = this.soundParams[name]
        if(!params) return
        
        const volume = (options.volume || 1) * this.sfxVolume
        const now = this.audioContext.currentTime
        
        if(params.type === 'noise')
        {
            // White noise for footsteps
            this.playNoise(volume, params.duration, params.decay)
        }
        else
        {
            // Tonal sounds
            params.frequencies.forEach((freq, i) => {
                const delay = params.delay ? i * params.delay : 0
                this.playTone(freq, params.type, volume / params.frequencies.length, params.duration, params.decay, delay)
            })
        }
    }

    playTone(frequency, type, volume, duration, decay, delay = 0)
    {
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()
        
        osc.type = type
        osc.frequency.value = frequency
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime + delay)
        gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + delay + 0.01)
        gain.gain.linearRampToValueAtTime(volume * 0.7, this.audioContext.currentTime + delay + duration)
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delay + duration + decay)
        
        osc.connect(gain)
        gain.connect(this.masterGain)
        
        osc.start(this.audioContext.currentTime + delay)
        osc.stop(this.audioContext.currentTime + delay + duration + decay + 0.1)
    }

    playNoise(volume, duration, decay)
    {
        const bufferSize = this.audioContext.sampleRate * (duration + decay)
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
        const data = buffer.getChannelData(0)
        
        for(let i = 0; i < bufferSize; i++)
        {
            data[i] = (Math.random() * 2 - 1) * 0.5
        }
        
        const noise = this.audioContext.createBufferSource()
        noise.buffer = buffer
        
        const gain = this.audioContext.createGain()
        gain.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration + decay)
        
        // Low pass filter for more realistic footstep
        const filter = this.audioContext.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 800
        
        noise.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain)
        
        noise.start()
        noise.stop(this.audioContext.currentTime + duration + decay + 0.1)
    }

    // Convenience methods
    playCoinCollect()
    {
        this.playSound('coinCollect')
    }

    playLevelUp()
    {
        this.playSound('levelUp')
    }

    playMissionComplete()
    {
        this.playSound('missionComplete')
    }

    playFootstep()
    {
        this.playSound('footstep', { volume: 0.3 })
    }

    setMasterVolume(value)
    {
        if(this.masterGain)
        {
            this.masterGain.gain.value = Math.max(0, Math.min(1, value))
        }
    }

    toggle()
    {
        this.enabled = !this.enabled
        return this.enabled
    }

    update()
    {
        // Play footstep sounds when moving
        if(this.state.player && this.state.player.speed > 0.01)
        {
            if(!this.lastFootstep || this.state.time.elapsed - this.lastFootstep > 0.4)
            {
                this.playFootstep()
                this.lastFootstep = this.state.time.elapsed
            }
        }
    }

    destroy()
    {
        if(this.audioContext)
        {
            this.audioContext.close()
        }
    }
}
