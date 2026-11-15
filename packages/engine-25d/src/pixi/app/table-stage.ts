import type { ViewportInfo } from '@mesa-viva/design-system';
import { Application, Container } from 'pixi.js';
import { stageLayoutFor } from '../../layout/stage-layout.js';
import type { MotionSensorEngine } from '../../motion/sensor-engine.js';
import { FrameMonitor } from '../../perf/frame-monitor.js';
import { estimateDrawCalls } from '../../perf/memory.js';
import { type QualityTier, qualitySettings } from '../../perf/quality.js';
import { planRender, type RenderPlan } from '../../render/mode.js';
import type { TableSnapshot } from '../../state/snapshot.js';
import { ParticleSystem } from '../effects/particle-system.js';
import { FocusRing } from '../picking/focus-ring.js';
import { createStageLayers } from '../presenter/layers.js';
import { installCanvas } from './app-canvas.js';
import { StageBenchmark } from './stage-benchmark.js';
import type { StageHandle } from './stage-handle.js';
import { StageInteraction } from './stage-interaction.js';
import { StageMotionBinding } from './stage-motion.js';
import type { TableStageOptions } from './stage-options.js';
import { StageScene } from './stage-scene.js';
import { measureViewport } from './viewport.js';

export type { TableStageOptions } from './stage-options.js';
/** Escena principal 2.5D sobre PixiJS v8 con ticker, resize y ciclo de vida. */
export class TableStage implements StageHandle {
  readonly kind = 'pixi' as const;
  private readonly options: TableStageOptions;
  private readonly plan: RenderPlan;
  private readonly app = new Application();
  private readonly layers = createStageLayers();
  private readonly feltHolder = new Container();
  private readonly ui = new Container();
  private readonly monitor = new FrameMonitor(180);
  private readonly bench: StageBenchmark;
  private readonly quality: QualityTier;
  private readonly reducedMotion: boolean;
  private readonly focusRing: FocusRing;
  private scene: StageScene | null = null;
  private particles: ParticleSystem | null = null;
  private motionBinding: StageMotionBinding | null = null;
  private interaction: StageInteraction | null = null;
  private previousPhase = '';
  private disposed = false;
  private resizeObserver: ResizeObserver | null = null;

  private constructor(options: TableStageOptions, plan: RenderPlan) {
    this.options = options;
    this.plan = plan;
    this.quality = options.quality ?? plan.quality;
    this.reducedMotion = options.reducedMotion ?? plan.motion !== 'full';
    this.focusRing = new FocusRing(options.theme.scheme.primary);
    this.bench = new StageBenchmark(this.monitor, () => ({
      counts: this.scene?.counts,
      textures: this.options.textures !== null && this.options.textures !== undefined && 'textureCount' in this.options.textures
        ? Number(this.options.textures.textureCount)
        : 0,
      backend: this.plan.backend,
    }));
  }

  static async create(options: TableStageOptions): Promise<TableStage> {
    const plan = options.renderPlan ?? planRender({ webgl2: true, webgl1: true });
    const stage = new TableStage(options, plan);
    await stage.init();
    return stage;
  }

  private async init(): Promise<void> {
    const viewport = measureViewport(this.options.container, this.options.viewport);
    const initial = stageLayoutFor(viewport, { pixelRatio: qualitySettings(this.quality).maxPixelRatio });
    await this.app.init({
      width: initial.width,
      height: initial.height,
      antialias: this.quality === 'alta',
      resolution: Math.min(initial.pixelRatio, qualitySettings(this.quality).maxPixelRatio),
      autoDensity: true,
      backgroundAlpha: 0,
      preference: 'webgl',
      powerPreference: 'high-performance',
      hello: false,
    });
    this.app.ticker.maxFPS = 120;
    installCanvas(this.app, this.options.container);
    this.app.stage.addChild(this.feltHolder, this.layers.shadow, this.layers.board, this.layers.cards, this.layers.chips, this.layers.tokens, this.layers.seats, this.layers.effects, this.ui);
    this.ui.addChild(this.focusRing);
    this.scene = new StageScene({
      stage: this.app.stage,
      layers: this.layers,
      theme: this.options.theme,
      viewport,
      textures: this.options.textures ?? null,
      reducedMotion: this.reducedMotion,
      quality: this.quality,
      showSeats: this.options.showSeats !== false,
      onCardDrop: (result) => {
        this.particles?.emit('stars', result.at.x, result.at.y, this.options.theme, this.quality === 'alta' ? 14 : 8);
        this.options.onCardDrop?.(result);
      },
    }, this.feltHolder);
    this.interaction = new StageInteraction(() => this.scene, this.focusRing);
    this.particles = new ParticleSystem(this.quality);
    this.layers.effects.addChild(this.particles.container);
    this.app.ticker.add(this.tick);
    if (this.options.motion !== undefined) this.enableMotion(this.options.motion);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.options.container);
  }
  private readonly tick = (): void => {
    if (this.disposed || this.scene === null) return;
    const dt = this.app.ticker.deltaMS / 1000;
    this.scene.tick(dt);
    this.particles?.update(dt);
    this.monitor.record(this.app.ticker.deltaMS);
  };
  resize(viewport?: ViewportInfo): void {
    if (this.disposed || this.scene === null) return;
    this.scene.resize(viewport ?? measureViewport(this.options.container, this.options.viewport));
    this.app.renderer.resize(this.scene.layout.width, this.scene.layout.height);
    this.interaction?.reset();
  }
  render(snapshot: TableSnapshot): void {
    this.scene?.render(snapshot);
    const counts = this.scene?.counts;
    if (counts !== undefined) {
      this.monitor.note({ drawCalls: estimateDrawCalls({
        cards: counts.cards,
        tiles: counts.tiles,
        chips: counts.chips,
        seats: counts.seats,
        staticLayers: 7,
      }).estimated });
    }
    const over = snapshot.phase.includes('over') || snapshot.phase === 'result';
    if (over && this.previousPhase !== snapshot.phase) this.celebrate();
    this.previousPhase = snapshot.phase;
  }
  setHandHidden(hidden: boolean): void {
    this.scene?.presenter.setHandHidden(hidden);
  }
  async capture(): Promise<string | null> {
    if (this.scene === null) return null;
    return this.app.renderer.extract.base64(this.app.stage);
  }

  enableMotion(engine: MotionSensorEngine): void {
    if (this.scene === null) return;
    this.motionBinding?.destroy();
    this.motionBinding = new StageMotionBinding({
      engine,
      camera: this.scene.camera,
      canvas: this.app.canvas,
      reducedMotion: this.reducedMotion,
      autoStart: this.options.autoStartMotion ?? true,
      onShake: (intensity) => {
        this.celebrate(this.options.theme.festive?.particles ?? 'stars');
        this.options.onShake?.(intensity);
      },
      onFaceDown: (down) => {
        this.setHandHidden(down);
        this.options.onFaceDown?.(down);
      },
      ...(this.options.onStatus !== undefined ? { onStatus: (status) => this.options.onStatus?.(status.reason) } : {}),
    });
  }

  celebrate(kind = this.options.theme.festive?.particles ?? 'confetti'): void {
    if (this.scene === null) return;
    this.particles?.emit(kind, this.scene.layout.centerX, this.scene.layout.centerY, this.options.theme);
  }

  pickAt(screenX: number, screenY: number): string | null {
    return this.interaction?.pickAt(screenX, screenY) ?? null;
  }
  focusNext(direction: 'up' | 'down' | 'left' | 'right', wrap = true): string | null {
    return this.interaction?.focusNext(direction, wrap) ?? null;
  }
  get performance(): ReturnType<StageBenchmark['report']> {
    return this.bench.report();
  }
  benchmark(seconds = 3): ReturnType<StageBenchmark['run']> {
    return this.bench.run(seconds);
  }
  get viewportInfo(): ViewportInfo | null {
    return this.scene?.viewport ?? null;
  }
  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.app.ticker.remove(this.tick);
    this.motionBinding?.destroy();
    this.motionBinding = null;
    this.scene?.destroy();
    this.scene = null;
    this.particles?.destroy();
    this.particles = null;
    this.focusRing.destroy();
    this.app.destroy(true, { children: true, texture: false });
  }
}
