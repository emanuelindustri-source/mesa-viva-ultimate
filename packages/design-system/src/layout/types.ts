import type { ScreenFormat } from '../version.js';

export type ScreenOrientation = 'portrait' | 'landscape';
export type SizeClass = 'compact' | 'medium' | 'expanded';
export type HingePosture = 'flat' | 'half-open' | 'book' | 'tabletop' | 'unknown';

export interface HingeInfo {
  readonly posture: HingePosture;
  readonly orientation: 'vertical' | 'horizontal';
  /** Grosor de la bisagra en píxeles CSS. */
  readonly size: number;
  readonly isSeparating: boolean;
}

export interface ViewportInfo {
  readonly width: number;
  readonly height: number;
  readonly devicePixelRatio?: number;
  readonly isTelevision?: boolean;
  readonly isFoldable?: boolean;
  readonly hinge?: HingeInfo;
  readonly platform?: 'web' | 'android' | 'ios' | 'tv';
}

export type InputMode = 'touch' | 'mouse' | 'dpad' | 'hybrid';

export interface InputCapabilities {
  readonly touch: boolean;
  readonly mouse: boolean;
  readonly keyboard: boolean;
  readonly dpad: boolean;
  readonly remote: boolean;
}

export interface NavigationPlan {
  readonly mode: 'bottom' | 'rail' | 'sidebar';
  readonly position: 'bottom' | 'left' | 'top';
  readonly itemSize: number;
  readonly maxItems: number;
  readonly alwaysVisibleLabels: boolean;
}

export interface SafeArea {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
  readonly overscan: number;
}

export interface SplitViewPlan {
  readonly enabled: boolean;
  readonly panes: 1 | 2;
  readonly hinge: HingeInfo | null;
  readonly paneMaxWidth: number | null;
}

export interface LayoutPlan {
  readonly format: ScreenFormat;
  readonly orientation: ScreenOrientation;
  readonly sizeClass: SizeClass;
  readonly columns: number;
  readonly gutter: number;
  readonly margin: number;
  readonly contentMaxWidth: number;
  readonly boardScale: number;
  readonly cardMinWidth: number;
  readonly touchTarget: number;
  readonly minFontSize: number;
  readonly focusRingWidth: number;
  readonly nav: NavigationPlan;
  readonly safeArea: SafeArea;
  readonly splitView: SplitViewPlan;
  readonly input: InputCapabilities;
}

export interface LayoutOptions {
  readonly input?: Partial<InputCapabilities>;
  readonly scale?: number;
}
