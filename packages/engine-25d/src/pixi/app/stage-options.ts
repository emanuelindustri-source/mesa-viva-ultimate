import type { Theme, ViewportInfo } from '@mesa-viva/design-system';
import type { MotionSensorEngine } from '../../motion/sensor-engine.js';
import type { QualityTier } from '../../perf/quality.js';
import type { RenderPlan } from '../../render/mode.js';
import type { TextureProvider } from '../entities/texture-provider.js';

export interface TableStageOptions {
  readonly container: HTMLElement;
  readonly theme: Theme;
  readonly viewport?: ViewportInfo;
  readonly textures?: TextureProvider | null;
  readonly renderPlan?: RenderPlan;
  readonly reducedMotion?: boolean;
  readonly quality?: QualityTier;
  readonly motion?: MotionSensorEngine;
  readonly autoStartMotion?: boolean;
  readonly onShake?: (intensity: number) => void;
  readonly onFaceDown?: (down: boolean) => void;
  readonly onStatus?: (reason: string) => void;
}
