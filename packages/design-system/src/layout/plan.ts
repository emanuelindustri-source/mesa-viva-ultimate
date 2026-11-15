import type { ScreenFormat } from '../version.js';
import { detectScreenFormat, orientationOf, sizeClassFor, splitPlanFor } from './formats.js';
import { createInputProfile } from './input.js';
import type {
  LayoutOptions,
  LayoutPlan,
  NavigationPlan,
  SafeArea,
  ScreenOrientation,
  SizeClass,
  ViewportInfo,
} from './types.js';

interface FormatSpec {
  readonly columns: number;
  readonly gutter: number;
  readonly margin: number;
  readonly contentMaxWidth: number;
  readonly boardScale: number;
  readonly cardMinWidth: number;
  readonly touchTarget: number;
  readonly minFontSize: number;
  readonly focusRingWidth: number;
  readonly overscan: number;
  readonly nav: Omit<NavigationPlan, 'itemSize'>;
}

const SPECS: Readonly<Record<ScreenFormat, FormatSpec>> = {
  movil: {
    columns: 4, gutter: 16, margin: 16, contentMaxWidth: 720, boardScale: 0.85, cardMinWidth: 72,
    touchTarget: 48, minFontSize: 14, focusRingWidth: 2, overscan: 0,
    nav: { mode: 'bottom', position: 'bottom', maxItems: 5, alwaysVisibleLabels: true },
  },
  tablet: {
    columns: 8, gutter: 20, margin: 24, contentMaxWidth: 960, boardScale: 1, cardMinWidth: 84,
    touchTarget: 48, minFontSize: 14, focusRingWidth: 3, overscan: 0,
    nav: { mode: 'rail', position: 'left', maxItems: 7, alwaysVisibleLabels: false },
  },
  televisor: {
    columns: 12, gutter: 32, margin: 48, contentMaxWidth: 1600, boardScale: 1.15, cardMinWidth: 120,
    touchTarget: 64, minFontSize: 24, focusRingWidth: 6, overscan: 48,
    nav: { mode: 'rail', position: 'left', maxItems: 8, alwaysVisibleLabels: true },
  },
  laptop: {
    columns: 12, gutter: 24, margin: 32, contentMaxWidth: 1280, boardScale: 1, cardMinWidth: 96,
    touchTarget: 44, minFontSize: 14, focusRingWidth: 3, overscan: 0,
    nav: { mode: 'sidebar', position: 'left', maxItems: 8, alwaysVisibleLabels: true },
  },
  ultrawide: {
    columns: 16, gutter: 32, margin: 48, contentMaxWidth: 1680, boardScale: 1.2, cardMinWidth: 104,
    touchTarget: 44, minFontSize: 16, focusRingWidth: 3, overscan: 0,
    nav: { mode: 'sidebar', position: 'left', maxItems: 10, alwaysVisibleLabels: true },
  },
  plegable: {
    columns: 8, gutter: 16, margin: 16, contentMaxWidth: 1200, boardScale: 0.95, cardMinWidth: 84,
    touchTarget: 48, minFontSize: 14, focusRingWidth: 3, overscan: 0,
    nav: { mode: 'bottom', position: 'bottom', maxItems: 5, alwaysVisibleLabels: true },
  },
};

function safeAreaFor(spec: FormatSpec, format: ScreenFormat): SafeArea {
  const inset = format === 'televisor' ? spec.overscan : 0;
  return { top: inset, right: inset, bottom: inset, left: inset, overscan: spec.overscan };
}

export interface FormatDecision {
  readonly format: ScreenFormat;
  readonly orientation: ScreenOrientation;
  readonly sizeClass: SizeClass;
}

export function decideFormat(viewport: ViewportInfo): FormatDecision {
  if (!Number.isFinite(viewport.width) || !Number.isFinite(viewport.height) || viewport.width <= 0 || viewport.height <= 0) {
    throw new Error('El viewport debe tener ancho y alto positivos');
  }
  return {
    format: detectScreenFormat(viewport),
    orientation: orientationOf(viewport),
    sizeClass: sizeClassFor(viewport.width),
  };
}

export function createLayoutPlan(viewport: ViewportInfo, options: LayoutOptions = {}): LayoutPlan {
  const decision = decideFormat(viewport);
  const spec = SPECS[decision.format];
  const split = splitPlanFor(viewport);
  const scale = Number.isFinite(options.scale) && (options.scale ?? 1) > 0 ? (options.scale as number) : 1;
  const nav: NavigationPlan = {
    ...spec.nav,
    itemSize: spec.touchTarget,
    mode: split.enabled && decision.orientation === 'landscape' ? 'rail' : spec.nav.mode,
  };
  return {
    format: decision.format,
    orientation: decision.orientation,
    sizeClass: decision.sizeClass,
    columns: split.enabled ? Math.max(spec.columns, 8) : spec.columns,
    gutter: spec.gutter,
    margin: spec.margin,
    contentMaxWidth: spec.contentMaxWidth,
    boardScale: spec.boardScale * scale,
    cardMinWidth: spec.cardMinWidth * scale,
    touchTarget: spec.touchTarget,
    minFontSize: spec.minFontSize,
    focusRingWidth: spec.focusRingWidth,
    nav,
    safeArea: safeAreaFor(spec, decision.format),
    splitView: {
      enabled: split.enabled,
      panes: split.panes,
      hinge: split.hinge,
      paneMaxWidth: split.enabled ? Math.floor((spec.contentMaxWidth - spec.gutter) / 2) : null,
    },
    input: createInputProfile(decision.format, options.input ?? {}),
  };
}
