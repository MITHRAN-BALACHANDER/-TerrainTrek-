uniform float uTime;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main()
{
    vPosition = position;
    vNormal = normal;
    vUv = uv;

    // Add rotation animation
    float angle = uTime * 2.0;
    mat3 rotY = mat3(
        cos(angle), 0.0, sin(angle),
        0.0, 1.0, 0.0,
        -sin(angle), 0.0, cos(angle)
    );

    vec3 rotatedPosition = rotY * position;
    
    // Add floating animation
    float floatOffset = sin(uTime * 2.0) * 0.3;
    rotatedPosition.y += floatOffset;

    vec4 modelPosition = modelMatrix * vec4(rotatedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}
