import { AdaptiveDpr, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { AsteroidBelt, CelestialBody } from "@/components/solar/CelestialBody";
import { CameraRig } from "@/components/solar/CameraRig";
import { BODIES, EARTH_PERIOD, PRIMARY_BODIES } from "@/lib/solar/bodies";
import { timeUniform } from "@/lib/solar/shaders";
import { useSolar } from "@/lib/solar/store";

export function Scene() {
  const simTime = useRef(0);
  const acc = useRef(0);

  useFrame((_, raw) => {
    const delta = Math.min(raw, 0.1);
    const { paused, speed, setElapsedYears } = useSolar.getState();
    if (!paused) {
      simTime.current += delta * speed;
      timeUniform.value = simTime.current;
    }
    acc.current += delta;
    if (acc.current >= 0.12) {
      acc.current = 0;
      setElapsedYears(simTime.current / EARTH_PERIOD);
    }
  });

  return (
    <>
      <color attach="background" args={["#05060a"]} />
      <fog attach="fog" args={["#05060a", 160, 300]} />
      <ambientLight intensity={0.035} color="#9bb0c8" />
      <pointLight
        position={[0, 0, 0]}
        intensity={140}
        distance={220}
        decay={1.55}
        color="#fff2d4"
      />
      <Stars
        radius={180}
        depth={70}
        count={5500}
        factor={3.2}
        saturation={0.15}
        fade
        speed={0.25}
      />
      <AsteroidBelt simTime={simTime} />
      {PRIMARY_BODIES.map((def) => (
        <CelestialBody key={def.id} def={def} simTime={simTime}>
          {BODIES.filter((moon) => moon.parent === def.id).map((moon) => (
            <CelestialBody key={moon.id} def={moon} simTime={simTime} />
          ))}
        </CelestialBody>
      ))}
      <CameraRig />
      <AdaptiveDpr />
    </>
  );
}
