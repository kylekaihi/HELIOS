import * as Slider from "@radix-ui/react-slider";
import {
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
  Spline,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BODIES, getBodyDef } from "@/lib/solar/bodies";
import { useSolar } from "@/lib/solar/store";
import { cn } from "@/lib/utils";

const SPEED_MIN = 0.2;
const SPEED_MAX = 16;

export function Hud() {
  const paused = useSolar((s) => s.paused);
  const speed = useSolar((s) => s.speed);
  const selectedId = useSolar((s) => s.selectedId);
  const showLabels = useSolar((s) => s.showLabels);
  const showTrails = useSolar((s) => s.showTrails);
  const elapsedYears = useSolar((s) => s.elapsedYears);
  const hintVisible = useSolar((s) => s.hintVisible);
  const togglePaused = useSolar((s) => s.togglePaused);
  const setSpeed = useSolar((s) => s.setSpeed);
  const select = useSolar((s) => s.select);
  const setShowLabels = useSolar((s) => s.setShowLabels);
  const setShowTrails = useSolar((s) => s.setShowTrails);
  const dismissHint = useSolar((s) => s.dismissHint);

  const selected = selectedId ? getBodyDef(selectedId) : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePaused();
      } else if (e.code === "Escape") {
        select(null);
      } else if (e.key === "[" || e.key === "-") {
        setSpeed(Math.max(SPEED_MIN, Number((speed - 0.25).toFixed(2))));
      } else if (e.key === "]" || e.key === "=") {
        setSpeed(Math.min(SPEED_MAX, Number((speed + 0.25).toFixed(2))));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [select, setSpeed, speed, togglePaused]);

  useEffect(() => {
    const t = window.setTimeout(() => dismissHint(), 7000);
    return () => window.clearTimeout(t);
  }, [dismissHint]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col text-fg">
      <header className="pointer-events-auto flex items-start justify-between gap-4 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-5">
        <div>
          <p className="font-display text-3xl leading-tight tracking-display text-fg sm:text-4xl">
            HELIOS
          </p>
          <p className="mt-1 text-sm text-muted">太陽系シミュレーター</p>
        </div>
        <div className="rounded-lg border border-border bg-surface/92 px-3 py-2 text-right">
          <p className="text-xs tracking-wide text-faint">経過時間</p>
          <p className="font-medium tabular-nums text-fg">
            {elapsedYears.toFixed(2)}{" "}
            <span className="text-muted">年</span>
          </p>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        {hintVisible && !selected ? (
          <p className="pointer-events-none absolute top-2 left-1/2 w-[min(92vw,20rem)] -translate-x-1/2 text-center text-sm text-muted">
            惑星をクリックして接近
          </p>
        ) : null}

        {selected ? (
          <aside className="pointer-events-auto absolute inset-x-3 bottom-2 max-h-[38%] overflow-auto rounded-xl border border-border bg-surface/94 p-3 sm:inset-x-auto sm:top-0 sm:right-5 sm:bottom-auto sm:max-h-none sm:w-80 sm:p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl leading-tight tracking-display">
                  {selected.nameJa}
                </h2>
                <p className="mt-0.5 text-sm text-muted">{selected.nameEn}</p>
              </div>
              <span className="rounded-sm border border-border bg-subtle px-2 py-1 text-xs text-muted">
                {selected.typeJa}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-normal text-pretty text-muted sm:mt-3 sm:line-clamp-none">
              {selected.blurb}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:mt-4 sm:gap-y-3">
              <Stat label="距離" value={selected.distance} />
              <Stat label="公転周期" value={selected.periodLabel} />
              <Stat label="直径" value={selected.diameter} />
              <Stat label="質量" value={selected.mass} />
              <Stat label="衛星" value={selected.moonsLabel} />
            </dl>
          </aside>
        ) : null}
      </div>

      <footer className="pointer-events-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5">
        <div className="mx-auto flex max-w-5xl flex-col gap-3">
          <nav
            aria-label="天体を選ぶ"
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {BODIES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => select(b.id)}
                className={cn(
                  "h-11 shrink-0 rounded-md border px-3 text-sm transition-[color,background-color,border-color] duration-(--motion-quick) ease-(--ease-out)",
                  selectedId === b.id
                    ? "border-ring bg-subtle text-fg"
                    : "border-border bg-surface/90 text-muted hover:text-fg",
                )}
              >
                {b.nameJa}
              </button>
            ))}
          </nav>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/94 p-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="solid"
                size="icon"
                aria-label={paused ? "再生" : "一時停止"}
                onClick={togglePaused}
              >
                {paused ? <Play /> : <Pause />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="全体を見る"
                onClick={() => select(null)}
              >
                <RotateCcw />
              </Button>
              <Button
                type="button"
                variant={showLabels ? "ghost" : "quiet"}
                size="icon"
                aria-label="ラベル"
                aria-pressed={showLabels}
                onClick={() => setShowLabels(!showLabels)}
              >
                {showLabels ? <Eye /> : <EyeOff />}
              </Button>
              <Button
                type="button"
                variant={showTrails ? "ghost" : "quiet"}
                size="icon"
                aria-label="軌道"
                aria-pressed={showTrails}
                onClick={() => setShowTrails(!showTrails)}
              >
                <Spline />
              </Button>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="shrink-0 text-xs text-faint">速度</span>
              <Slider.Root
                className="relative flex h-11 w-full touch-none items-center"
                value={[speed]}
                min={SPEED_MIN}
                max={SPEED_MAX}
                step={0.1}
                onValueChange={(v) => setSpeed(v[0] ?? 1)}
                aria-label="シミュレーション速度"
              >
                <Slider.Track className="relative h-1 grow rounded-full bg-subtle">
                  <Slider.Range className="absolute h-full rounded-full bg-accent" />
                </Slider.Track>
                <Slider.Thumb className="block size-4 rounded-full bg-fg shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70" />
              </Slider.Root>
              <span className="w-12 shrink-0 text-right text-sm tabular-nums text-fg">
                {speed.toFixed(1)}×
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm text-fg">{value}</dd>
    </div>
  );
}

export function BootShell() {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-subtle)_0%,var(--color-bg)_62%)]" />
      <Hud />
    </div>
  );
}
