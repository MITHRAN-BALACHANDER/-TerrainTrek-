import Time from './Time.js'
import Controls from './Controls.js'
import Viewport from './Viewport.js'
import DayCycle from './DayCycle.js'
import Sun from './Sun.js'
import Player from './Player.js'
import Terrains from './Terrains.js'
import Chunks from './Chunks.js'
import Coins from './Coins.js'
import Audio from './Audio.js'
import Progression from './Progression.js'
import Missions from './Missions.js'

export default class State
{
    static instance

    static getInstance()
    {
        return State.instance
    }

    constructor()
    {
        if(State.instance)
            return State.instance

        State.instance = this

        this.time = new Time()
        this.controls = new Controls()
        this.viewport = new Viewport()
        this.day = new DayCycle()
        this.sun = new Sun()
        this.player = new Player()
        this.terrains = new Terrains()
        this.chunks = new Chunks()
        this.coins = new Coins()
        this.audio = new Audio()
        this.progression = new Progression()
        this.missions = new Missions()
    }

    resize()
    {
        this.viewport.resize()
    }

    update()
    {
        this.time.update()
        this.controls.update()
        this.day.update()
        this.sun.update()
        this.player.update()
        this.chunks.update()
        this.coins.update()
        this.audio.update()
        this.progression.update()
        this.missions.update()
    }
}