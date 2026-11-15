import type { Theme } from '@mesa-viva/design-system';
import { MotionSensorEngine, type TableSnapshot } from '@mesa-viva/engine-25d';
import type { StageHandle } from '@mesa-viva/engine-25d/pixi';
import { useEffect, useRef, useState } from 'preact/hooks';

interface TableStageViewProps {
  readonly theme: Theme;
  readonly snapshot: TableSnapshot;
  readonly rotation?: 0 | 180 | 360;
  readonly reducedMotion?: boolean;
  readonly onShake?: (intensity: number) => void;
  readonly onFaceDown?: (down: boolean) => void;
}

/** Mesa 2.5D real con PixiJS, sensores y fallback DOM si no hay WebGL. */
export function TableStageView({ theme, snapshot, rotation = 0, reducedMotion = false, onShake, onFaceDown }: TableStageViewProps) {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<StageHandle | null>(null);
  const motion = useRef<MotionSensorEngine | null>(null);
  const latest = useRef({ snapshot, onShake, onFaceDown });
  const [kind, setKind] = useState<'cargando' | 'pixi' | 'dom'>('cargando');
  latest.current = { snapshot, onShake, onFaceDown };

  useEffect(() => {
    const container = host.current;
    if (container === null) return;
    let cancelled = false;
    void import('@mesa-viva/engine-25d/pixi').then(async (pixi) => {
      if (cancelled) return;
      const motionEngine = new MotionSensorEngine(pixi.createDomMotionSource(typeof window === 'undefined' ? null : window));
      motion.current = motionEngine;
      const created = await pixi.createTableStage({
        container,
        theme,
        reducedMotion,
        motion: motionEngine,
        autoStartMotion: true,
        onShake: (intensity) => latest.current.onShake?.(intensity),
        onFaceDown: (down) => latest.current.onFaceDown?.(down),
      });
      if (cancelled) { created.destroy(); return; }
      stage.current = created;
      setKind(created.kind);
      created.render(latest.current.snapshot);
    }).catch(() => { if (!cancelled) setKind('dom'); });
    return () => {
      cancelled = true;
      stage.current?.destroy();
      stage.current = null;
      motion.current?.dispose();
      motion.current = null;
    };
  }, [theme, reducedMotion]);

  useEffect(() => {
    stage.current?.render(snapshot);
  }, [snapshot]);

  return (
    <div class={`mesa-25d mesa-25d--rot-${rotation}`} ref={host} role="img" aria-label="Mesa de juego 2.5D" data-kind={kind} />
  );
}
