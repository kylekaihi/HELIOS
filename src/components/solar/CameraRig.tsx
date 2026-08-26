import { CameraControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, Vector3 } from "three";
import { OVERVIEW_CAMERA, getBodyDef } from "@/lib/solar/bodies";
import { getBody } from "@/lib/solar/registry";
import { useSolar } from "@/lib/solar/store";

const _body = new Vector3();
const _cam = new Vector3();
const _dir = new Vector3();
const _right = new Vector3();
const _up = new Vector3(0, 1, 0);

function focusCamera(
  cam: CameraControls,
  bodyPos: Vector3,
  radius: number,
  hasRings: boolean,
) {
  const dist = Math.max(radius * (hasRings ? 10.2 : 6.8), 3.4);
  if (bodyPos.lengthSq() < 0.05) {
    return cam.setLookAt(dist * 0.7, dist * 0.35, dist * 0.85, 0, 0, 0, true);
  }
  _dir.copy(bodyPos).normalize();
  _right.crossVectors(_up, _dir);
  if (_right.lengthSq() < 0.001) _right.set(1, 0, 0);
  else _right.normalize();
  const camX = bodyPos.x + _dir.x * dist * 0.2 + _up.x * dist * 0.42 + _right.x * dist * 0.78;
  const camY = bodyPos.y + _dir.y * dist * 0.2 + _up.y * dist * 0.42 + _right.y * dist * 0.78;
  const camZ = bodyPos.z + _dir.z * dist * 0.2 + _up.z * dist * 0.42 + _right.z * dist * 0.78;
  return cam.setLookAt(camX, camY, camZ, bodyPos.x, bodyPos.y, bodyPos.z, true);
}

export function CameraRig() {
  const controls = useRef<CameraControls>(null);
  const selectedId = useSolar((s) => s.selectedId);
  const animating = useRef(false);
  const lastTarget = useRef(new Vector3());
  const following = useRef(false);

  useEffect(() => {
    const cam = controls.current;
    if (!cam) return;

    if (!selectedId) {
      following.current = false;
      animating.current = true;
      void cam
        .setLookAt(
          OVERVIEW_CAMERA.position[0],
          OVERVIEW_CAMERA.position[1],
          OVERVIEW_CAMERA.position[2],
          OVERVIEW_CAMERA.target[0],
          OVERVIEW_CAMERA.target[1],
          OVERVIEW_CAMERA.target[2],
          true,
        )
        .then(() => {
          animating.current = false;
          lastTarget.current.set(0, 0, 0);
        });
      return;
    }

    const handle = getBody(selectedId);
    const def = getBodyDef(selectedId);
    if (!handle || !def) return;

    handle.object.getWorldPosition(_body);
    following.current = true;
    animating.current = true;
    lastTarget.current.copy(_body);
    void focusCamera(cam, _body, def.radius, Boolean(def.rings)).then(() => {
      animating.current = false;
      handle.object.getWorldPosition(lastTarget.current);
    });
  }, [selectedId]);

  useFrame(() => {
    const cam = controls.current;
    if (!cam || !following.current || animating.current || !selectedId) return;
    const handle = getBody(selectedId);
    if (!handle) return;
    handle.object.getWorldPosition(_body);
    const dx = _body.x - lastTarget.current.x;
    const dy = _body.y - lastTarget.current.y;
    const dz = _body.z - lastTarget.current.z;
    if (dx === 0 && dy === 0 && dz === 0) return;
    cam.getPosition(_cam);
    cam.setLookAt(
      _cam.x + dx,
      _cam.y + dy,
      _cam.z + dz,
      _body.x,
      _body.y,
      _body.z,
      false,
    );
    lastTarget.current.copy(_body);
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.7}
      draggingSmoothTime={0.12}
      minDistance={2.2}
      maxDistance={260}
      minPolarAngle={0.08}
      maxPolarAngle={MathUtils.degToRad(168)}
      onRest={() => {
        animating.current = false;
      }}
    />
  );
}
