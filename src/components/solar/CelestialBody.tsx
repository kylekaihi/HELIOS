import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Object3D,
  ShaderMaterial,
  SpriteMaterial,
} from "three";
import type { BodyDef } from "@/lib/solar/bodies";
import { registerBody } from "@/lib/solar/registry";
import {
  ATMOS_FRAG,
  ATMOS_VERT,
  CLOUD_FRAG,
  PLANET_FRAG,
  PLANET_VERT,
  RING_FRAG,
  RING_VERT,
  SUN_FRAG,
  SUN_HALO_FRAG,
  timeUniform,
} from "@/lib/solar/shaders";
import { useSolar } from "@/lib/solar/store";
import { cn } from "@/lib/utils";

const KIND: Record<BodyDef["kind"], number> = {
  sun: -1,
  rocky: 0,
  earth: 1,
  gas: 2,
  ice: 3,
};

const lightColor = new Color("#fff6e4");

function orbitPoints(radius: number, segs = 160): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
  }
  return pts;
}

let glowTexture: CanvasTexture | null = null;
function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255, 248, 220, 1)");
  g.addColorStop(0.18, "rgba(255, 210, 120, 0.7)");
  g.addColorStop(0.42, "rgba(255, 160, 60, 0.22)");
  g.addColorStop(1, "rgba(255, 120, 20, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  glowTexture = new CanvasTexture(canvas);
  glowTexture.needsUpdate = true;
  return glowTexture;
}

function skipRaycast() {}

function useDisposableMaterial(factory: () => ShaderMaterial) {
  const mat = useMemo(factory, []);
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

export function CelestialBody({
  def,
  simTime,
  children,
}: {
  def: BodyDef;
  simTime: MutableRefObject<number>;
  children?: ReactNode;
}) {
  const pos = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const selectedId = useSolar((s) => s.selectedId);
  const showTrails = useSolar((s) => s.showTrails);
  const showLabels = useSolar((s) => s.showLabels);
  const select = useSolar((s) => s.select);
  const selected = selectedId === def.id;
  const points = useMemo(() => orbitPoints(def.orbitRadius), [def.orbitRadius]);
  const startX = Math.cos(def.phase) * def.orbitRadius;
  const startZ = Math.sin(def.phase) * def.orbitRadius;

  useEffect(() => {
    if (!pos.current) return;
    return registerBody({ id: def.id, object: pos.current, radius: def.radius });
  }, [def.id, def.radius]);

  useFrame(() => {
    const t = simTime.current;
    if (def.orbitRadius > 0 && pos.current) {
      const angle = (t / def.period) * Math.PI * 2 + def.phase;
      pos.current.position.set(
        Math.cos(angle) * def.orbitRadius,
        0,
        Math.sin(angle) * def.orbitRadius,
      );
    }
    if (spin.current) {
      spin.current.rotation.y = t * def.spin;
    }
  });

  const onPick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    select(def.id);
  };

  return (
    <group rotation={[def.inclination, 0, 0]}>
      {def.orbitRadius > 0 && showTrails ? (
        <Line
          points={points}
          color={def.colors[0]}
          transparent
          opacity={selected ? 0.7 : 0.34}
          lineWidth={selected ? 1.6 : 1}
          depthWrite={false}
        />
      ) : null}
      <group ref={pos} position={[startX, 0, startZ]}>
        <group rotation={[def.tilt, 0, 0]}>
          <group ref={spin}>
            {def.kind === "sun" ? (
              <SunMesh def={def} onPick={onPick} />
            ) : (
              <PlanetMesh def={def} onPick={onPick} selected={selected} />
            )}
          </group>
        </group>
        {children}
        {showLabels ? (
          <Html
            center
            sprite
            position={[0, def.radius + 0.55, 0]}
            zIndexRange={[20, 0]}
            pointerEvents="auto"
          >
            <button
              type="button"
              onClick={() => select(def.id)}
              className={cn("planet-label", selected && "planet-label-active")}
            >
              {def.nameJa}
            </button>
          </Html>
        ) : null}
      </group>
    </group>
  );
}

function PlanetMesh({
  def,
  onPick,
  selected,
}: {
  def: BodyDef;
  onPick: (e: { stopPropagation: () => void }) => void;
  selected: boolean;
}) {
  const planetMat = useDisposableMaterial(
    () =>
      new ShaderMaterial({
        uniforms: {
          uColorA: { value: new Color(def.colors[0]) },
          uColorB: { value: new Color(def.colors[1]) },
          uColorC: { value: new Color(def.colors[2]) },
          uSeed: { value: def.phase * 3.1 + 1.7 },
          uKind: { value: KIND[def.kind] },
          uTime: timeUniform,
          uPolarIce: { value: def.polarIce },
          uLightColor: { value: lightColor },
        },
        vertexShader: PLANET_VERT,
        fragmentShader: PLANET_FRAG,
      }),
  );

  const atmosMat = useDisposableMaterial(
    () =>
      new ShaderMaterial({
        uniforms: {
          uColor: { value: new Color(def.atmosphere ?? "#88bbff") },
          uIntensity: { value: def.kind === "earth" ? 0.85 : 0.55 },
        },
        vertexShader: ATMOS_VERT,
        fragmentShader: ATMOS_FRAG,
        transparent: true,
        depthWrite: false,
        side: BackSide,
      }),
  );

  const cloudMat = useDisposableMaterial(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: timeUniform,
          uSeed: { value: def.phase },
          uOpacity: { value: def.clouds ?? 0.4 },
        },
        vertexShader: PLANET_VERT,
        fragmentShader: CLOUD_FRAG,
        transparent: true,
        depthWrite: false,
      }),
  );

  const ringMat = useDisposableMaterial(
    () =>
      new ShaderMaterial({
        uniforms: {
          uColor: { value: new Color(def.colors[1]) },
          uInner: { value: def.rings?.inner ?? 1.4 },
          uOuter: { value: def.rings?.outer ?? 2.3 },
        },
        vertexShader: RING_VERT,
        fragmentShader: RING_FRAG,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
  );

  return (
    <group>
      <mesh onClick={onPick} scale={def.radius}>
        <sphereGeometry args={[1, 64, 48]} />
        <primitive object={planetMat} attach="material" />
      </mesh>
      {def.atmosphere ? (
        <mesh scale={def.radius * 1.08} onClick={onPick}>
          <sphereGeometry args={[1, 32, 24]} />
          <primitive object={atmosMat} attach="material" />
        </mesh>
      ) : null}
      {def.clouds ? (
        <mesh scale={def.radius * 1.02} raycast={skipRaycast}>
          <sphereGeometry args={[1, 48, 32]} />
          <primitive object={cloudMat} attach="material" />
        </mesh>
      ) : null}
      {def.rings ? (
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={def.radius} onClick={onPick}>
          <ringGeometry args={[def.rings.inner, def.rings.outer, 96]} />
          <primitive object={ringMat} attach="material" />
        </mesh>
      ) : null}
      {selected ? (
        <mesh rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
          <torusGeometry args={[def.radius * 1.42, def.radius * 0.018, 8, 64]} />
          <meshBasicMaterial color="#e8edf5" transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function SunMesh({
  def,
  onPick,
}: {
  def: BodyDef;
  onPick: (e: { stopPropagation: () => void }) => void;
}) {
  const sunMat = useDisposableMaterial(
    () =>
      new ShaderMaterial({
        uniforms: {
          uColorA: { value: new Color(def.colors[0]) },
          uColorB: { value: new Color(def.colors[1]) },
          uColorC: { value: new Color(def.colors[2]) },
          uTime: timeUniform,
        },
        vertexShader: PLANET_VERT,
        fragmentShader: SUN_FRAG,
      }),
  );
  const haloMat = useDisposableMaterial(
    () =>
      new ShaderMaterial({
        uniforms: { uColor: { value: new Color("#ffd28a") } },
        vertexShader: ATMOS_VERT,
        fragmentShader: SUN_HALO_FRAG,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: BackSide,
      }),
  );
  const glowMat = useMemo(() => {
    const map = getGlowTexture();
    return new SpriteMaterial({
      map: map ?? undefined,
      color: "#ffd9a0",
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
  }, []);
  useEffect(() => () => glowMat.dispose(), [glowMat]);

  return (
    <group>
      <mesh onClick={onPick} scale={def.radius}>
        <sphereGeometry args={[1, 64, 48]} />
        <primitive object={sunMat} attach="material" />
      </mesh>
      <mesh scale={def.radius * 1.18} onClick={onPick}>
        <sphereGeometry args={[1, 32, 24]} />
        <primitive object={haloMat} attach="material" />
      </mesh>
      <sprite scale={[def.radius * 6.4, def.radius * 6.4, 1]} raycast={skipRaycast}>
        <primitive object={glowMat} attach="material" />
      </sprite>
    </group>
  );
}

export function AsteroidBelt({ simTime }: { simTime: MutableRefObject<number> }) {
  const mesh = useRef<InstancedMesh>(null);
  const group = useRef<Group>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const count = 420;
  const data = useMemo(() => {
    const rows: { a: number; r: number; y: number; s: number }[] = [];
    for (let i = 0; i < count; i++) {
      rows.push({
        a: Math.random() * Math.PI * 2,
        r: 29.2 + Math.random() * 5.4,
        y: (Math.random() - 0.5) * 0.7,
        s: 0.035 + Math.random() * 0.1,
      });
    }
    return rows;
  }, []);

  useEffect(() => {
    const inst = mesh.current;
    if (!inst) return;
    data.forEach((d, i) => {
      dummy.position.set(Math.cos(d.a) * d.r, d.y, Math.sin(d.a) * d.r);
      dummy.rotation.set(d.a, d.a * 0.4, d.s * 8);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
  }, [data, dummy]);

  useFrame(() => {
    if (group.current) group.current.rotation.y = simTime.current * 0.018;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#6a645c" roughness={0.96} metalness={0.04} />
      </instancedMesh>
    </group>
  );
}
