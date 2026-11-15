import type { Theme, ViewportInfo } from '@mesa-viva/design-system';
import type { Container } from 'pixi.js';
import { CameraRig } from '../../camera/camera-rig.js';
import { Projector } from '../../camera/projector.js';
import type { DropResult } from '../../drag/drop-session.js';
import { type StageLayout, stageLayoutFor } from '../../layout/stage-layout.js';
import type { QualityTier } from '../../perf/quality.js';
import { qualitySettings } from '../../perf/quality.js';
import type { TableSnapshot } from '../../state/snapshot.js';
import type { TextureProvider } from '../entities/texture-provider.js';
import type { StageLayers } from '../presenter/layers.js';
import { TablePresenter } from '../presenter/table-presenter.js';
import { TableFelt } from './table-felt.js';

export interface StageSceneOptions {
  readonly stage: Container;
  readonly layers: StageLayers;
  readonly theme: Theme;
  readonly viewport: ViewportInfo;
  readonly textures: TextureProvider | null;
  readonly reducedMotion: boolean;
  readonly quality: QualityTier;
  readonly onCardDrop?: (result: DropResult) => void;
  readonly showSeats?: boolean;
}

/** Escena interna: layout, cámara, proyector, tapete y presentador. */
export class StageScene {
  readonly theme: Theme;
  readonly textures: TextureProvider | null;
  readonly reducedMotion: boolean;
  readonly quality: QualityTier;
  private readonly stageRoot: Container;
  private readonly layers: StageLayers;
  private readonly feltHolder: Container;
  private readonly onCardDrop: ((result: DropResult) => void) | undefined;
  private readonly showSeats: boolean;
  viewport: ViewportInfo;
  layout: StageLayout;
  camera: CameraRig;
  projector: Projector;
  presenter: TablePresenter;
  felt: TableFelt;
  private snapshot: TableSnapshot | null = null;

  constructor(options: StageSceneOptions, feltHolder: Container) {
    this.theme = options.theme;
    this.textures = options.textures;
    this.reducedMotion = options.reducedMotion;
    this.quality = options.quality;
    this.stageRoot = options.stage;
    this.layers = options.layers;
    this.feltHolder = feltHolder;
    this.onCardDrop = options.onCardDrop;
    this.showSeats = options.showSeats !== false;
    this.viewport = options.viewport;
    this.layout = stageLayoutFor(options.viewport, { pixelRatio: qualitySettings(options.quality).maxPixelRatio });
    this.camera = new CameraRig({
      preset: this.layout.camera,
      width: this.layout.width,
      height: this.layout.height,
      reducedMotion: options.reducedMotion,
    });
    this.projector = makeProjector(this.layout);
    this.felt = new TableFelt(this.layout, this.projector, this.theme, options.reducedMotion);
    this.feltHolder.addChild(this.felt.container);
    this.presenter = this.makePresenter();
  }

  private makePresenter(): TablePresenter {
    return new TablePresenter({
      layers: this.layers,
      layout: this.layout,
      theme: this.theme,
      textures: this.textures,
      stage: this.stageRoot,
      projector: () => this.projector,
      reducedMotion: this.reducedMotion,
      showSeats: this.showSeats,
      ...(this.onCardDrop !== undefined ? { onCardDrop: this.onCardDrop } : {}),
    });
  }

  resize(viewport: ViewportInfo): void {
    this.viewport = viewport;
    this.layout = stageLayoutFor(viewport, { pixelRatio: qualitySettings(this.quality).maxPixelRatio });
    this.camera.resize(this.layout.width, this.layout.height, this.layout.camera);
    this.projector = makeProjector(this.layout);
    this.felt.destroy();
    this.felt = new TableFelt(this.layout, this.projector, this.theme, this.reducedMotion);
    this.feltHolder.addChild(this.felt.container);
    this.presenter.destroy();
    this.presenter = this.makePresenter();
    if (this.snapshot !== null) this.presenter.render(this.snapshot);
  }

  render(snapshot: TableSnapshot): void {
    this.snapshot = snapshot;
    this.presenter.render(snapshot);
  }

  tick(dtSeconds: number): void {
    this.camera.update(dtSeconds);
    this.camera.applyTo(this.projector);
    this.presenter.sync(this.projector, this.layout);
    this.felt.updateLight(this.camera.parallaxOffsetX, this.camera.parallaxOffsetY);
    this.felt.update(dtSeconds, this.camera.parallaxOffsetX, this.camera.parallaxOffsetY);
  }

  get counts(): TablePresenter['counts'] {
    return this.presenter.counts;
  }

  destroy(): void {
    this.presenter.destroy();
    this.felt.destroy();
    this.feltHolder.removeChildren();
  }
}

export function makeProjector(layout: StageLayout): Projector {
  return new Projector({
    width: layout.width,
    height: layout.height,
    centerX: layout.centerX,
    centerY: layout.centerY,
    baseScale: layout.baseScale,
    preset: layout.camera,
  });
}
