import type { Object3D } from "three";

export type BodyHandle = {
  id: string;
  object: Object3D;
  radius: number;
};

const handles = new Map<string, BodyHandle>();

export function registerBody(handle: BodyHandle): () => void {
  handles.set(handle.id, handle);
  return () => {
    handles.delete(handle.id);
  };
}

export function getBody(id: string): BodyHandle | undefined {
  return handles.get(id);
}
