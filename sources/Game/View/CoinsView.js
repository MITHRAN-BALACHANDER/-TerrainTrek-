import * as THREE from 'three'
import View from './View.js'
import State from '@/State/State.js'
import CoinMaterial from './Materials/CoinMaterial.js'

export default class CoinsView
{
    constructor()
    {
        this.view = View.getInstance()
        this.state = State.getInstance()
        this.time = this.state.time
        
        this.group = new THREE.Group()
        this.view.scene.add(this.group)
        
        // Shared geometry for performance
        this.coinGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32)
        this.coinGeometry.rotateX(Math.PI * 0.5)
        
        this.particleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.02)
        
        this.coinMeshes = new Map() // Map<coinId, {mesh, material, coin, shattered}>
        this.shatterParticles = []
        
        // Default sun values
        this.defaultSunDir = new THREE.Vector3(0, 1, 0)
        this.defaultSunCol = new THREE.Color(1, 1, 1)
        
        this.createCoinMeshes()
    }

    createCoinMeshes()
    {
        if(!this.state.coins) return
        
        this.state.coins.coins.forEach(coin => {
            this.addCoinMesh(coin)
        })
    }

    addCoinMesh(coin)
    {
        const material = new CoinMaterial()
        const mesh = new THREE.Mesh(this.coinGeometry, material)
        
        mesh.position.set(coin.position[0], coin.position[1], coin.position[2])
        mesh.userData.coinId = coin.id
        
        this.group.add(mesh)
        this.coinMeshes.set(coin.id, {
            mesh: mesh,
            material: material,
            coin: coin,
            shattered: false
        })
    }

    createShatterParticles(coinMesh, coin)
    {
        const particleCount = 15
        const particles = []
        
        for(let i = 0; i < particleCount; i++)
        {
            const material = new CoinMaterial()
            const particle = new THREE.Mesh(this.particleGeometry, material)
            
            particle.position.copy(coinMesh.mesh.position)
            
            // Random velocity for explosion effect
            const angle = (i / particleCount) * Math.PI * 2
            const speed = 3 + Math.random() * 4
            const velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * 5 + 3,
                Math.sin(angle) * speed
            )
            
            const rotation = new THREE.Vector3(
                Math.random() * 10 - 5,
                Math.random() * 10 - 5,
                Math.random() * 10 - 5
            )
            
            this.group.add(particle)
            
            particles.push({
                mesh: particle,
                material: material,
                velocity: velocity,
                rotation: rotation,
                startTime: this.time.elapsed,
                lifetime: 0.8
            })
        }
        
        this.shatterParticles.push({
            coinId: coin.id,
            particles: particles
        })
    }

    removeCoinMesh(coinId)
    {
        const coinMesh = this.coinMeshes.get(coinId)
        if(coinMesh)
        {
            this.group.remove(coinMesh.mesh)
            coinMesh.material.dispose()
            this.coinMeshes.delete(coinId)
        }
    }

    update()
    {
        if(!this.state.coins) return
        
        const sun = this.state.sun
        const sunDir = (sun && sun.direction) ? sun.direction : this.defaultSunDir
        const sunCol = (sun && sun.color) ? sun.color : this.defaultSunCol
        
        // Update coin meshes
        const toRemove = []
        this.coinMeshes.forEach((coinMesh, coinId) => {
            const { mesh, material, coin } = coinMesh
            
            if(!coin.collected)
            {
                // Update shader uniforms
                material.uniforms.uTime.value = this.time.elapsed
                material.uniforms.uSunDirection.value.copy(sunDir)
                material.uniforms.uSunColor.value.copy(sunCol)
                mesh.visible = true
            }
            else
            {
                // Start shatter effect on first frame of collection
                if(!coinMesh.shattered)
                {
                    this.createShatterParticles(coinMesh, coin)
                    coinMesh.shattered = true
                    mesh.visible = false // Hide immediately
                }
                
                // Mark for removal after shatter completes
                if(coin.shatterProgress >= 1)
                {
                    toRemove.push(coinId)
                }
            }
        })
        
        // Remove completed coins
        toRemove.forEach(coinId => this.removeCoinMesh(coinId))
        
        // Update shatter particles
        for(let i = this.shatterParticles.length - 1; i >= 0; i--)
        {
            const shatterGroup = this.shatterParticles[i]
            const particles = shatterGroup.particles
            
            for(let j = particles.length - 1; j >= 0; j--)
            {
                const particle = particles[j]
                
                if(!particle || !particle.mesh || !particle.velocity)
                {
                    particles.splice(j, 1)
                    continue
                }
                
                const elapsed = this.time.elapsed - particle.startTime
                const progress = elapsed / particle.lifetime
                
                if(progress < 1)
                {
                    const dt = this.time.delta
                    
                    // Update position
                    particle.mesh.position.x += particle.velocity.x * dt
                    particle.mesh.position.y += particle.velocity.y * dt
                    particle.mesh.position.z += particle.velocity.z * dt
                    
                    // Apply gravity
                    particle.velocity.y -= 15 * dt
                    
                    // Update rotation
                    particle.mesh.rotation.x += particle.rotation.x * dt
                    particle.mesh.rotation.y += particle.rotation.y * dt
                    particle.mesh.rotation.z += particle.rotation.z * dt
                    
                    // Scale down as it fades
                    const scale = 1 - progress * 0.5
                    particle.mesh.scale.setScalar(scale)
                    
                    // Update material
                    particle.material.uniforms.uShatterProgress.value = progress
                    particle.material.uniforms.uTime.value = this.time.elapsed
                    particle.material.uniforms.uSunDirection.value.copy(sunDir)
                    particle.material.uniforms.uSunColor.value.copy(sunCol)
                }
                else
                {
                    // Remove particle
                    this.group.remove(particle.mesh)
                    particle.material.dispose()
                    particles.splice(j, 1)
                }
            }
            
            // Remove shatter group if all particles are gone
            if(particles.length === 0)
            {
                this.shatterParticles.splice(i, 1)
            }
        }
    }

    destroy()
    {
        this.coinMeshes.forEach((coinMesh) => {
            this.group.remove(coinMesh.mesh)
            coinMesh.material.dispose()
        })
        this.coinMeshes.clear()
        
        this.shatterParticles.forEach(shatterGroup => {
            shatterGroup.particles.forEach(particle => {
                this.group.remove(particle.mesh)
                particle.material.dispose()
            })
        })
        this.shatterParticles = []
        
        this.coinGeometry.dispose()
        this.particleGeometry.dispose()
        this.view.scene.remove(this.group)
    }
}
