import { create } from "zustand";

type SolarState = {
  paused: boolean;
  speed: number;
  selectedId: string | null;
  showLabels: boolean;
  showTrails: boolean;
  elapsedYears: number;
  hintVisible: boolean;
  setPaused: (paused: boolean) => void;
  togglePaused: () => void;
  setSpeed: (speed: number) => void;
  select: (id: string | null) => void;
  setShowLabels: (show: boolean) => void;
  setShowTrails: (show: boolean) => void;
  setElapsedYears: (years: number) => void;
  dismissHint: () => void;
};

export const useSolar = create<SolarState>((set) => ({
  paused: false,
  speed: 1,
  selectedId: null,
  showLabels: true,
  showTrails: true,
  elapsedYears: 0,
  hintVisible: true,
  setPaused: (paused) => set({ paused }),
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed }),
  select: (id) => set({ selectedId: id, hintVisible: false }),
  setShowLabels: (showLabels) => set({ showLabels }),
  setShowTrails: (showTrails) => set({ showTrails }),
  setElapsedYears: (elapsedYears) => set({ elapsedYears }),
  dismissHint: () => set({ hintVisible: false }),
}));
