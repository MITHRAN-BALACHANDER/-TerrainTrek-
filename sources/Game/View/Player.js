import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import Game from '@/Game.js'
import View from '@/View/View.js'
import Debug from '@/Debug/Debug.js'
import State from '@/State/State.js'
import PlayerMaterial from './Materials/PlayerMaterial.js'

export default class Player
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.view = View.getInstance()
        this.debug = Debug.getInstance()

        this.scene = this.view.scene
        this.loader = new GLTFLoader()

        // Custom model state
        this.custom = {
            enabled: false,
            url: '',
            scale: 1,
        }

        this.setGroup()
        this.setHelper()
        this.setDebug()
    }

    setGroup()
    {
        this.group = new THREE.Group()
        this.scene.add(this.group)
    }
    
    setHelper()
    {
    // 3D stick human composed of simple primitives
    this.helper = new THREE.Group()
    this.material = new PlayerMaterial()
    this.material.uniforms.uColor.value = new THREE.Color('violet')
    this.material.uniforms.uSunPosition.value = new THREE.Vector3(- 0.5, - 0.5, - 0.5)

    const parts = []

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 18), this.material)
    head.position.y = 1.62
    parts.push(head)

    // Neck
    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.15, 6, 12), this.material)
    neck.position.y = 1.38
    parts.push(neck)

    // Torso
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.75, 6, 18), this.material)
    torso.position.y = 1.0
    parts.push(torso)

    // Arms (capsules for smooth ends) with shoulder pivot
    const armGeom = new THREE.CapsuleGeometry(0.09, 0.6, 6, 12)
    const shoulderY = 1.45
    const shoulderX = 0.34
    const armOffsetDown = - (0.6 * 0.5 -0.4) // place top of capsule at shoulder
    const armLGroup = new THREE.Group()
    armLGroup.position.set(-shoulderX, shoulderY, 0)
    const armL = new THREE.Mesh(armGeom, this.material)
    armL.position.y = armOffsetDown
    armLGroup.add(armL)
    armLGroup.rotation.z = 0.2
    parts.push(armLGroup)

    const armRGroup = new THREE.Group()
    armRGroup.position.set(shoulderX, shoulderY, 0)
    const armR = new THREE.Mesh(armGeom, this.material)
    armR.position.y = armOffsetDown
    armRGroup.add(armR)
    armRGroup.rotation.z = -0.2
    parts.push(armRGroup)

    // Legs (capsules for smooth ends)
    const legGeom = new THREE.CapsuleGeometry(0.12, 0.85, 6, 14)
    const legL = new THREE.Mesh(legGeom, this.material)
    legL.position.set(-0.18, 0.5, 0)
    parts.push(legL)
    const legR = new THREE.Mesh(legGeom, this.material)
    legR.position.set(0.18, 0.5, 0)
    parts.push(legR)

    for(const p of parts) this.helper.add(p)
    this.group.add(this.helper)

    // Container for custom model
    this.model = null

        // const arrow = new THREE.Mesh(
        //     new THREE.ConeGeometry(0.2, 0.2, 4),
        //     new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false })
        // )
        // arrow.rotation.x = - Math.PI * 0.5
        // arrow.position.y = 1.5
        // arrow.position.z = - 0.5
        // this.helper.add(arrow)
        
        // // Axis helper
        // this.axisHelper = new THREE.AxesHelper(3)
        // this.group.add(this.axisHelper)
    }

    setDebug()
    {
        if(!this.debug.active)
            return

        // Sphere
        const playerFolder = this.debug.ui.getFolder('view/player')

    playerFolder.addColor(this.material.uniforms.uColor, 'value')

        const customFolder = this.debug.ui.getFolder('view/player/custom')
        customFolder
            .add(this.custom, 'enabled')
            .name('Use custom model')
            .onChange((v) =>
            {
                if(this.model)
                    this.model.visible = !!v
                this.helper.visible = !v
            })

        const actions = {
            loadFile: () => this.#promptModelFile(),
            loadUrl: () => this.#loadModelFromUrl(this.custom.url)
        }

        customFolder.add(actions, 'loadFile').name('Load .glb/.gltf file')
        customFolder.add(this.custom, 'url').name('Model URL')
        customFolder.add(actions, 'loadUrl').name('Load from URL')
        customFolder.add(this.custom, 'scale').min(0.1).max(10).step(0.1).onChange(() => this.#applyModelScale())
    }

    update()
    {
        const playerState = this.state.player
        const sunState = this.state.sun

        this.group.position.set(
            playerState.position.current[0],
            playerState.position.current[1],
            playerState.position.current[2]
        )
        
    // Rotate visuals (billboarded stick can still face move dir)
    this.helper.rotation.y = playerState.rotation
        if(this.model)
            this.model.rotation.y = playerState.rotation
    this.material.uniforms.uSunPosition.value.set(sunState.position.x, sunState.position.y, sunState.position.z)
    }

    // Private: file input flow
    #promptModelFile()
    {
        if(this._fileInput)
        {
            this._fileInput.value = ''
        }
        else
        {
            this._fileInput = document.createElement('input')
            this._fileInput.type = 'file'
            this._fileInput.accept = '.glb,.gltf,model/gltf+json,model/gltf-binary'
            this._fileInput.style.display = 'none'
            document.body.appendChild(this._fileInput)

            this._fileInput.addEventListener('change', (e) =>
            {
                const file = e.target.files && e.target.files[0]
                if(!file) return
                const objectUrl = URL.createObjectURL(file)
                this.#loadModelFromUrl(objectUrl, () => URL.revokeObjectURL(objectUrl))
            })
        }
        this._fileInput.click()
    }

    #loadModelFromUrl(url, onDone)
    {
        if(!url) return
        this.loader.load(
            url,
            (gltf) =>
            {
                this.#setModel(gltf.scene)
                if(onDone) onDone()
                // Auto-enable custom model when loaded
                this.custom.enabled = true
                if(this.model) this.model.visible = true
                this.helper.visible = false
            },
            undefined,
            (err) =>
            {
                console.error('Failed to load model', err)
                if(onDone) onDone()
            }
        )
    }

    #setModel(scene)
    {
        // Remove existing
        if(this.model)
        {
            this.group.remove(this.model)
        }

        // Normalize position so feet sit at y=0
        const box = new THREE.Box3().setFromObject(scene)
        if(box.isEmpty() === false)
        {
            const minY = box.min.y
            scene.position.y -= minY
        }

        this.model = scene
        this.model.visible = this.custom.enabled
        this.#applyModelScale()
        this.group.add(this.model)
    }

    #applyModelScale()
    {
        if(this.model)
            this.model.scale.setScalar(this.custom.scale)
    }
}
