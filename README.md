# HELIOS

3D solar system simulator. Click a planet to close in, drag to orbit, and scrub simulation speed.

**太陽 / 水星 / 金星 / 地球・月 / 火星 / 木星 / 土星 / 天王星 / 海王星** — custom GLSL surfaces, atmospheres, rings, asteroid belt, orbital trails.

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

| Control | Action |
|---|---|
| Click planet / chip | Focus camera on that body |
| Drag | Orbit camera |
| Space | Pause / resume |
| Esc | Return to overview |
| `[` `]` or `-` `=` | Simulation speed |

## Stack

React 19 · Vite · Three.js · React Three Fiber · Drei · Zustand · Tailwind CSS v4

## Layout

```
src/
  main.tsx
  styles.css
  components/solar/   Scene, bodies, camera, HUD
  lib/solar/          planet data, shaders, store
```
