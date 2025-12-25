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
        
        this.coinMeshes = []
        this.shatterParticles = []
        
        this.createCoinMeshes()
    }

    createCoinMeshes()
    {
        if(!this.state.coins) return
        
        // Create coin geometry (cylinder for coin shape)
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32)
        geometry.rotateX(Math.PI * 0.5) // Rotate to stand upright
        
        this.state.coins.coins.forEach(coin => {
            const material = new CoinMaterial()
            const mesh = new THREE.Mesh(geometry, material)
            
            mesh.position.set(coin.position[0], coin.position[1], coin.position[2])
            mesh.userData.coinId = coin.id
            
            this.group.add(mesh)
            this.coinMeshes.push({
                mesh: mesh,
                material: material,
                coin: coin
            })
        })
    }

    createShatterParticles(coinMesh, coin)
    {
        const particleCount = 20
        const particles = []
        
        const particleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.02)
        
        for(let i = 0; i < particleCount; i++)
        {
            const material = new CoinMaterial()
            const particle = new THREE.Mesh(particleGeometry, material)
            
            particle.position.copy(coinMesh.mesh.position)
            
            // Random velocity for explosion effect
            const angle = (i / particleCount) * Math.PI * 2
            const speed = 2 + Math.random() * 3
            const velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * 4 + 2,
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
                lifetime: 1.0
            })
        }
        
        this.shatterParticles.push({
            coin: coin,
            particles: particles
        })
    }

    update()
    {
        if(!this.state.coins) return
        
        const sun = this.state.sun
        
        // Update coin meshes
        this.coinMeshes.forEach(coinMesh => {
            const { mesh, material, coin } = coinMesh
            
            if(!coin.collected)
            {
                // Update shader uniforms
                material.uniforms.uTime.value = this.time.elapsed
                if(sun && sun.direction && sun.color && material.uniforms && material.uniforms.uSunDirection && material.uniforms.uSunColor)
                {
                    // copy only when sun direction/color are defined
                    material.uniforms.uSunDirection.value.copy(sun.direction)
                    material.uniforms.uSunColor.value.copy(sun.color)
                }
                else if(material.uniforms)
                {
                    // fallback defaults to avoid calling copy with undefined
                    if(material.uniforms.uSunDirection && material.uniforms.uSunDirection.value && material.uniforms.uSunDirection.value.set) material.uniforms.uSunDirection.value.set(0, 1, 0)
                    if(material.uniforms.uSunColor && material.uniforms.uSunColor.value && material.uniforms.uSunColor.value.set) material.uniforms.uSunColor.value.set(1, 1, 1)
                }
                
                mesh.visible = true
            }
            else
            {
                // Start shatter effect
                if(coin.shatterProgress === 0 && !coinMesh.shattered)
                {
                    this.createShatterParticles(coinMesh, coin)
                    coinMesh.shattered = true
                }
                
                // Fade out original mesh
                material.uniforms.uShatterProgress.value = coin.shatterProgress
                material.uniforms.uTime.value = this.time.elapsed
                
                if(coin.shatterProgress >= 1)
                {
                    mesh.visible = false
                }
            }
        })
        
        // Update shatter particles
        for(let i = this.shatterParticles.length - 1; i >= 0; i--)
        {
            const shatterGroup = this.shatterParticles[i]
            const particles = shatterGroup.particles
            
            for(let j = particles.length - 1; j >= 0; j--)
            {
                const particle = particles[j]
                const elapsed = this.time.elapsed - particle.startTime
                const progress = elapsed / particle.lifetime
                
                if(progress < 1)
                {
                        // Defensive checks: if particle is malformed, remove it
                        if(!particle || !particle.mesh || !particle.mesh.position || !particle.velocity)
                        {
                            try {
                                if(particle && particle.mesh) this.group.remove(particle.mesh)
                                if(particle && particle.mesh && particle.mesh.geometry) particle.mesh.geometry.dispose()
                                if(particle && particle.material) particle.material.dispose()
                            } catch(e) {}
                            particles.splice(j, 1)
                            continue
                        }

                        // Update position
                        particle.mesh.position.x += particle.velocity.x * this.time.delta
                        particle.mesh.position.y += particle.velocity.y * this.time.delta
                        particle.mesh.position.z += particle.velocity.z * this.time.delta

                        // Apply gravity
                        particle.velocity.y -= 9.8 * this.time.delta

                        // Update rotation
                        if(particle.rotation)
                        {
                            particle.mesh.rotation.x += particle.rotation.x * this.time.delta
                            particle.mesh.rotation.y += particle.rotation.y * this.time.delta
                            particle.mesh.rotation.z += particle.rotation.z * this.time.delta
                        }

                        // Fade out (guard uniforms)
                        if(particle.material && particle.material.uniforms)
                        {
                            particle.material.uniforms.uShatterProgress.value = progress
                            particle.material.uniforms.uTime.value = this.time.elapsed

                            if(sun && sun.direction && sun.color && particle.material.uniforms.uSunDirection && particle.material.uniforms.uSunColor)
                            {
                                particle.material.uniforms.uSunDirection.value.copy(sun.direction)
                                particle.material.uniforms.uSunColor.value.copy(sun.color)
                            }
                        }
                }
                else
                {
                    // Remove particle
                    this.group.remove(particle.mesh)
                    particle.mesh.geometry.dispose()
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
        this.coinMeshes.forEach(coinMesh => {
            coinMesh.mesh.geometry.dispose()
            coinMesh.material.dispose()
        })
        
        this.shatterParticles.forEach(shatterGroup => {
            shatterGroup.particles.forEach(particle => {
                particle.mesh.geometry.dispose()
                particle.material.dispose()
            })
        })
        
        this.view.scene.remove(this.group)
    }
}
