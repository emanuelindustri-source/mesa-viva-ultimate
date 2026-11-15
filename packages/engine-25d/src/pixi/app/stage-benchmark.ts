import type { FrameMonitor, FrameSummary } from '../../perf/frame-monitor.js';
import type { TablePresenter } from '../presenter/table-presenter.js';

export interface StageBenchmarkInfo {
  readonly counts: TablePresenter['counts'] | undefined;
  readonly textures: number;
  readonly backend: string;
}

/** Informe de FPS, draw calls y memoria con ventana reproducible. */
export class StageBenchmark {
  private readonly monitor: FrameMonitor;
  private readonly info: () => StageBenchmarkInfo;

  constructor(monitor: FrameMonitor, info: () => StageBenchmarkInfo) {
    this.monitor = monitor;
    this.info = info;
  }

  report(): FrameSummary & { readonly entities: number; readonly textures: number; readonly backend: string } {
    const data = this.info();
    const counts = data.counts;
    const entities = counts === undefined
      ? 0
      : counts.cards + counts.tiles + counts.seats + counts.chips + counts.dice + counts.tokens;
    return { ...this.monitor.summary(), entities, textures: data.textures, backend: data.backend };
  }

  run(seconds = 3): Promise<FrameSummary> {
    this.monitor.reset();
    const started = typeof performance === 'undefined' ? Date.now() : performance.now();
    return new Promise((resolve) => {
      const check = (): void => {
        const now = typeof performance === 'undefined' ? Date.now() : performance.now();
        if (now - started >= Math.max(0.5, seconds) * 1000) {
          resolve(this.monitor.summary());
          return;
        }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });
  }
}
