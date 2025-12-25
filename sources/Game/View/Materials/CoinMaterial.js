import * as THREE from 'three'

import vertexShader from './shaders/coin/vertex.glsl'
import fragmentShader from './shaders/coin/fragment.glsl'

export default class CoinMaterial extends THREE.ShaderMaterial
{
    constructor()
    {
        super({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: { value: 0 },
                uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
                uSunColor: { value: new THREE.Color(0xffffff) },
                uShatterProgress: { value: 0 }
            }
        })
    }
}
