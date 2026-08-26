export const timeUniform = { value: 0 };

const NOISE = /* glsl */ `
float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}
`;

export const PLANET_VERT = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vWorldPos;
varying vec3 vLocalPos;
varying vec2 vUv;

void main() {
  vUv = uv;
  vLocalPos = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const PLANET_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSeed;
uniform float uKind;
uniform float uTime;
uniform float uPolarIce;
uniform vec3 uLightColor;
varying vec3 vNormalW;
varying vec3 vWorldPos;
varying vec3 vLocalPos;
varying vec2 vUv;

${NOISE}

void main() {
  vec3 p = normalize(vLocalPos);
  float lat = p.y;
  float n = fbm(p * 4.0 + vec3(uSeed, uSeed * 0.7, 1.3));
  vec3 albedo = uColorA;

  if (uKind < 0.5) {
    albedo = mix(uColorA, uColorB, n);
    albedo = mix(albedo, uColorC, smoothstep(0.62, 0.92, n));
    float ice = smoothstep(0.78, 0.94, abs(lat) + n * 0.08) * uPolarIce;
    albedo = mix(albedo, vec3(0.93, 0.95, 0.97), ice);
  } else if (uKind < 1.5) {
    float land = smoothstep(0.44, 0.54, n);
    vec3 ocean = uColorA * (0.85 + 0.15 * fbm(p * 10.0));
    vec3 continent = mix(uColorB, uColorC, fbm(p * 7.0 + 2.0));
    albedo = mix(ocean, continent, land);
    float ice = smoothstep(0.70, 0.88, abs(lat) + n * 0.08);
    albedo = mix(albedo, vec3(0.93, 0.96, 0.98), ice);
  } else if (uKind < 2.5) {
    float bands = sin(lat * 20.0 + n * 3.4 + uSeed);
    albedo = mix(uColorA, uColorB, 0.5 + 0.5 * bands);
    albedo = mix(albedo, uColorC, smoothstep(0.55, 1.0, n) * 0.35);
    vec2 spot = vec2(p.x - 0.42, p.y + 0.18);
    float s = exp(-dot(spot * vec2(1.6, 2.4), spot * vec2(1.6, 2.4)) * 28.0);
    albedo = mix(albedo, uColorC, s);
  } else {
    albedo = mix(uColorA, uColorB, 0.35 + 0.65 * n);
    float bands = sin(lat * 14.0 + n * 2.0);
    albedo = mix(albedo, uColorC, 0.15 + 0.15 * bands);
  }

  vec3 N = normalize(vNormalW);
  vec3 L = normalize(-vWorldPos);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float ndl = max(dot(N, L), 0.0);
  float wrap = max(dot(N, L) * 0.55 + 0.45, 0.0);
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), uKind > 0.5 && uKind < 1.5 ? 48.0 : 24.0);
  float specMask = uKind > 0.5 && uKind < 1.5 ? (1.0 - smoothstep(0.44, 0.54, n)) : 0.12;
  vec3 lit = albedo * (0.028 + wrap * 0.95) * uLightColor;
  lit += uLightColor * spec * specMask * ndl * 0.35;

  if (uKind > 0.5 && uKind < 1.5) {
    float night = pow(1.0 - ndl, 3.0);
    float cities = smoothstep(0.52, 0.7, fbm(p * 18.0 + 8.0)) * night;
    lit += vec3(1.0, 0.82, 0.55) * cities * 0.35;
  }

  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  lit += albedo * fres * 0.08;

  gl_FragColor = vec4(lit, 1.0);
}
`;

export const SUN_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uTime;
varying vec3 vLocalPos;
varying vec3 vNormalW;
varying vec3 vWorldPos;

${NOISE}

void main() {
  vec3 p = normalize(vLocalPos);
  float n = fbm(p * 3.2 + vec3(uTime * 0.06, 0.0, uTime * 0.04));
  float n2 = fbm(p * 7.0 - vec3(uTime * 0.08, uTime * 0.03, 0.0));
  vec3 col = mix(uColorA, uColorB, n);
  col = mix(col, uColorC, pow(n2, 2.0) * 0.65);
  col *= 1.35 + n * 0.35;
  vec3 V = normalize(cameraPosition - vWorldPos);
  float fres = pow(1.0 - max(dot(normalize(vNormalW), V), 0.0), 2.0);
  col += uColorA * fres * 0.4;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const ATMOS_VERT = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vWorldPos;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const ATMOS_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec3 vNormalW;
varying vec3 vWorldPos;
void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float fres = pow(1.0 - abs(dot(N, V)), 2.6);
  gl_FragColor = vec4(uColor, fres * uIntensity);
}
`;

export const CLOUD_FRAG = /* glsl */ `
uniform float uTime;
uniform float uSeed;
uniform float uOpacity;
varying vec3 vLocalPos;
varying vec3 vNormalW;
varying vec3 vWorldPos;

${NOISE}

void main() {
  vec3 p = normalize(vLocalPos);
  float n = fbm(p * 5.0 + vec3(uTime * 0.015, uSeed, 0.0));
  float alpha = smoothstep(0.46, 0.72, n) * uOpacity;
  vec3 N = normalize(vNormalW);
  vec3 L = normalize(-vWorldPos);
  float wrap = max(dot(N, L) * 0.5 + 0.5, 0.0);
  vec3 col = vec3(0.95, 0.96, 0.98) * (0.2 + 0.8 * wrap);
  gl_FragColor = vec4(col, alpha);
}
`;

export const RING_VERT = /* glsl */ `
varying vec3 vLocalPos;
varying vec3 vWorldPos;
varying vec3 vNormalW;
void main() {
  vLocalPos = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const RING_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uInner;
uniform float uOuter;
varying vec3 vLocalPos;
varying vec3 vWorldPos;
varying vec3 vNormalW;

${NOISE}

void main() {
  float radial = length(vLocalPos.xy);
  float r = clamp((radial - uInner) / max(uOuter - uInner, 0.0001), 0.0, 1.0);
  float bands = 0.55 + 0.45 * sin(r * 70.0 + noise(vec3(r * 40.0, 0.2, 1.1)) * 4.0);
  float alpha = bands * 0.7;
  if (r < 0.04 || r > 0.98) alpha = 0.0;
  if (r > 0.44 && r < 0.54) alpha *= 0.06;
  if (r > 0.18 && r < 0.22) alpha *= 0.35;
  vec3 N = normalize(vNormalW);
  vec3 L = normalize(-vWorldPos);
  float lit = 0.25 + 0.75 * max(abs(dot(N, L)), 0.0);
  vec3 col = uColor * lit * (0.75 + 0.25 * bands);
  gl_FragColor = vec4(col, alpha);
}
`;

export const SUN_HALO_FRAG = /* glsl */ `
uniform vec3 uColor;
varying vec3 vNormalW;
varying vec3 vWorldPos;
void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float fres = pow(1.0 - abs(dot(N, V)), 1.8);
  gl_FragColor = vec4(uColor, fres * 0.55);
}
`;
