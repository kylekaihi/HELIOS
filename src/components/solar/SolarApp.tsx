import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { Hud } from "@/components/solar/Hud";
import { Scene } from "@/components/solar/Scene";
import { OVERVIEW_CAMERA } from "@/lib/solar/bodies";

export function SolarApp() {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <Canvas
        className="absolute inset-0 touch-none"
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{
          position: [...OVERVIEW_CAMERA.position],
          fov: 42,
          near: 0.15,
          far: 420,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#05060a");
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
        }}
      >
        <Scene />
      </Canvas>
      <Hud />
    </div>
  );
}
