import {
  createLayoutPlan,
  type HingeInfo,
  type LayoutPlan,
  type SafeArea,
  type ViewportInfo,
} from '@mesa-viva/design-system';
import { type CameraPreset, cameraForFormat } from '../camera/presets.js';
import { clamp } from '../math/vec3.js';

export interface StagePane {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface StageLayout {
  readonly viewport: ViewportInfo;
  readonly plan: LayoutPlan;
  readonly camera: CameraPreset;
  readonly width: number;
  readonly height: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly baseScale: number;
  readonly safe: SafeArea;
  readonly panes: readonly StagePane[];
  readonly hinge: HingeInfo | null;
  readonly tableHalfWidth: number;
  readonly tableHalfHeight: number;
  readonly cardWidth: number;
  readonly cardHeight: number;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly pixelRatio: number;
}

export interface StageLayoutOptions {
  readonly scale?: number;
  readonly pixelRatio?: number;
  readonly tableHalfWidth?: number;
  readonly tableHalfHeight?: number;
}

export const TABLE_HALF_WIDTH = 600;
export const TABLE_HALF_HEIGHT = 350;

function pixelRatioFor(viewport: ViewportInfo, requested: number | undefined): number {
  const value = requested ?? viewport.devicePixelRatio ?? 1;
  return clamp(value, 1, 3);
}

function panesFor(plan: LayoutPlan, width: number, height: number): readonly StagePane[] {
  const split = plan.splitView;
  if (!split.enabled) return [{ x: 0, y: 0, width, height }];
  const hingeSize = Math.max(0, split.hinge?.size ?? 24);
  if (split.hinge?.orientation === 'horizontal') {
    const paneHeight = Math.max(1, (height - hingeSize) / 2);
    return [
      { x: 0, y: 0, width, height: paneHeight },
      { x: 0, y: paneHeight + hingeSize, width, height: paneHeight },
    ];
  }
  const paneWidth = Math.max(1, (width - hingeSize) / 2);
  return [
    { x: 0, y: 0, width: paneWidth, height },
    { x: paneWidth + hingeSize, y: 0, width: paneWidth, height },
  ];
}

/**
 * Traduce el plan de layout universal a un encuadre de mesa 2.5D: área segura,
 * paneles del plegable, escala de cartas y proyección. Sin DOM ni GPU.
 */
export function stageLayoutFor(viewport: ViewportInfo, options: StageLayoutOptions = {}): StageLayout {
  const plan = createLayoutPlan(viewport, { scale: options.scale ?? 1 });
  const camera = cameraForFormat(plan.format);
  const width = Math.max(1, Math.round(viewport.width));
  const height = Math.max(1, Math.round(viewport.height));
  const safe = plan.safeArea;
  const usableWidth = Math.max(1, width - safe.left - safe.right);
  const usableHeight = Math.max(1, height - safe.top - safe.bottom);
  const tableHalfWidth = Math.max(100, options.tableHalfWidth ?? TABLE_HALF_WIDTH);
  const tableHalfHeight = Math.max(100, options.tableHalfHeight ?? TABLE_HALF_HEIGHT);
  const tiltRadians = (camera.tiltDeg * Math.PI) / 180;
  const fitWidth = usableWidth / (tableHalfWidth * 2);
  const fitHeight = usableHeight / (tableHalfHeight * 2 * Math.max(0.35, Math.cos(tiltRadians)));
  const baseScale = Math.max(0.01, Math.min(fitWidth, fitHeight) * camera.tableFill);
  const centerX = safe.left + usableWidth / 2;
  const centerY = safe.top + usableHeight / 2;
  const cardWidth = Math.max(24, plan.cardMinWidth * camera.entityScale);
  return {
    viewport,
    plan,
    camera,
    width,
    height,
    centerX,
    centerY,
    baseScale,
    safe,
    panes: panesFor(plan, width, height),
    hinge: plan.splitView.hinge,
    tableHalfWidth,
    tableHalfHeight,
    cardWidth,
    cardHeight: Math.round(cardWidth * 1.42),
    tileWidth: Math.round(cardWidth * 0.95),
    tileHeight: Math.round(cardWidth * 0.5),
    pixelRatio: pixelRatioFor(viewport, options.pixelRatio),
  };
}

/** Área del panel que debe contener la mesa o el HUD de un jugador. */
export function paneAt(layout: StageLayout, index: number): StagePane {
  const pane = layout.panes[index] ?? layout.panes[0];
  if (pane === undefined) return { x: 0, y: 0, width: layout.width, height: layout.height };
  return pane;
}
