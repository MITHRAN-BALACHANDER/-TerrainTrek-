uniform vec3 uSunPosition;
uniform vec3 uColor;

varying vec3 vGameNormal;
varying vec2 vUv;

#include ../partials/getSunShade.glsl;
#include ../partials/getSunShadeColor.glsl;

// Signed distance helpers
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdCapsule(vec2 p, vec2 a, vec2 b, float r)
{
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

float smoothAlpha(float d, float feather)
{
    return 1.0 - smoothstep(0.0, feather, d);
}

void main()
{
    // Map UV to a -1..1 stick figure canvas
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= 0.6; // slender

    // Body layout (y up)
    // Head
    float dHead = sdCircle(p - vec2(0.0, 0.55), 0.18);
    
    // Torso
    float dTorso = sdCapsule(p, vec2(0.0, 0.45), vec2(0.0, -0.1), 0.07);

    // Arms
    float dArmL = sdCapsule(p, vec2(0.0, 0.25), vec2(-0.35, 0.0), 0.06);
    float dArmR = sdCapsule(p, vec2(0.0, 0.25), vec2( 0.35, 0.0), 0.06);

    // Legs
    float dLegL = sdCapsule(p, vec2(0.0, -0.1), vec2(-0.2, -0.6), 0.07);
    float dLegR = sdCapsule(p, vec2(0.0, -0.1), vec2( 0.2, -0.6), 0.07);

    float d = min(min(min(dHead, dTorso), min(dArmL, dArmR)), min(dLegL, dLegR));

    // Soft edge
    float alpha = smoothAlpha(d, 0.02);
    if(alpha <= 0.001) discard;

    // Lighting
    vec3 color = uColor;
    float sunShade = getSunShade(vGameNormal);
    color = getSunShadeColor(color, sunShade);

    gl_FragColor = vec4(color, alpha);
}