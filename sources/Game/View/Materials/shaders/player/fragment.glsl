uniform vec3 uSunPosition;
uniform vec3 uColor;

varying vec3 vGameNormal;

#include ../partials/getSunShade.glsl;
#include ../partials/getSunShadeColor.glsl;

void main()
{
    vec3 base = uColor;
    float sunShade = getSunShade(vGameNormal);
    vec3 lit = getSunShadeColor(base, sunShade);

    // Soft rim light for shape definition
    float rim = pow(clamp(1.0 - max(0.0, dot(normalize(vGameNormal), vec3(0.0, 0.0, 1.0))), 0.0, 1.0), 2.0);
    vec3 rimColor = vec3(1.0);
    vec3 color = mix(lit, lit * 1.15 + rimColor * 0.15, 0.25 * rim);
    gl_FragColor = vec4(color, 1.0);
}