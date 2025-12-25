uniform float uTime;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform float uShatterProgress;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

// Gold color palette
vec3 goldBase = vec3(1.0, 0.843, 0.0);
vec3 goldHighlight = vec3(1.0, 0.95, 0.7);
vec3 goldShadow = vec3(0.722, 0.525, 0.043);

void main()
{
    // Base gold color with UV gradient
    vec3 color = goldBase;
    
    // Add metallic effect
    float metallic = smoothstep(0.3, 0.7, vUv.x);
    color = mix(goldShadow, goldHighlight, metallic);
    
    // Add circular pattern (coin ridges)
    float radius = length(vUv - 0.5);
    float ridges = sin(radius * 50.0) * 0.1 + 0.9;
    color *= ridges;
    
    // Add embossed effect
    float emboss = smoothstep(0.3, 0.4, radius) * smoothstep(0.5, 0.4, radius);
    color += emboss * 0.3;
    
    // Sun lighting
    vec3 normal = normalize(vNormal);
    float sunDot = max(dot(normal, normalize(uSunDirection)), 0.0);
    vec3 sunLight = uSunColor * sunDot;
    color *= 0.6 + sunLight * 0.4;
    
    // Add rim lighting
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float rimPower = 1.0 - max(dot(viewDirection, normal), 0.0);
    rimPower = pow(rimPower, 3.0);
    color += rimPower * goldHighlight * 0.5;
    
    // Add sparkle effect
    float sparkle = sin(uTime * 10.0 + vPosition.x * 10.0) * 0.5 + 0.5;
    sparkle *= sin(uTime * 8.0 + vPosition.z * 10.0) * 0.5 + 0.5;
    sparkle = pow(sparkle, 10.0);
    color += sparkle * vec3(1.0, 1.0, 0.8) * 0.5;
    
    // Shatter fade effect
    float alpha = 1.0 - uShatterProgress;
    
    // Add glow when not shattered
    if(uShatterProgress < 0.1)
    {
        color += goldHighlight * (sin(uTime * 3.0) * 0.2 + 0.3);
    }

    gl_FragColor = vec4(color, alpha);
}
