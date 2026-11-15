import type { SensorySession } from './session.js';

export interface TableStageSensoryCallbacks {
  readonly onShake: (intensity: number) => void;
  readonly onFaceDown: (down: boolean) => void;
  readonly celebrate: (kind?: string) => void;
}

export interface TableStageSensoryOptions {
  readonly onShake?: (intensity: number) => void;
  readonly onFaceDown?: (down: boolean) => void;
  readonly onCelebrate?: (kind: string) => void;
}

/**
 * Adaptador para los hooks de TableStage (`onShake`, `onFaceDown`, `celebrate`).
 * La escena sigue siendo dueña de partículas y cámara; aquí solo hay sonido.
 */
export function createTableSensoryHooks(
  session: SensorySession,
  options: TableStageSensoryOptions = {},
): TableStageSensoryCallbacks {
  return {
    onShake: (intensity) => {
      session.onShake(intensity);
      options.onShake?.(intensity);
    },
    onFaceDown: (down) => {
      session.onFaceDown(down);
      options.onFaceDown?.(down);
    },
    celebrate: (kind = 'victoria') => {
      session.celebrate(kind === 'derrota' ? 'derrota' : 'victoria');
      options.onCelebrate?.(kind);
    },
  };
}
