import { planRender } from '../../render/mode.js';
import { browserCapabilities } from '../render/capabilities.js';
import { FallbackStage } from './fallback-stage.js';
import type { StageHandle } from './stage-handle.js';
import { TableStage, type TableStageOptions } from './table-stage.js';

/**
 * Punto de entrada seguro: intenta PixiJS y, si no hay WebGL o falla la
 * inicialización, devuelve una mesa DOM sin romper la partida.
 */
export async function createTableStage(options: TableStageOptions): Promise<StageHandle> {
  const plan = options.renderPlan ?? planRender(browserCapabilities());
  if (plan.backend === 'dom') {
    return new FallbackStage({
      container: options.container,
      theme: options.theme,
      reason: plan.reason,
      ...(options.viewport !== undefined ? { viewport: options.viewport } : {}),
    });
  }
  try {
    return await TableStage.create({
      ...options,
      renderPlan: plan,
      reducedMotion: options.reducedMotion ?? plan.motion !== 'full',
    });
  } catch {
    return new FallbackStage({
      container: options.container,
      theme: options.theme,
      reason: 'No se pudo iniciar WebGL; mesa estática activa',
      ...(options.viewport !== undefined ? { viewport: options.viewport } : {}),
    });
  }
}
