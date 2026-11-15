export const SPACING = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export type SpacingToken = keyof typeof SPACING;

export const RADII = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof RADII;

export const BORDERS = {
  thin: 1,
  medium: 2,
  thick: 4,
  focus: 3,
  tvFocus: 6,
} as const;

export type BorderToken = keyof typeof BORDERS;

export interface MotionToken {
  readonly duration: number;
  readonly easing: string;
}

export const MOTION = {
  instant: { duration: 0, easing: 'linear' },
  fast: { duration: 120, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  standard: { duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  emphasized: { duration: 420, easing: 'cubic-bezier(0.05, 0.7, 0.1, 1)' },
  deal: { duration: 520, easing: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)' },
  reduced: { duration: 1, easing: 'linear' },
} as const satisfies Record<string, MotionToken>;

export type MotionTokenName = keyof typeof MOTION;

/** Duración segura cuando el sistema pide movimiento reducido. */
export function motionDuration(name: MotionTokenName, reduceMotion = false): number {
  if (reduceMotion) return MOTION.reduced.duration;
  return MOTION[name].duration;
}

export function spacingCssVariables(): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const [name, value] of Object.entries(SPACING)) variables[`--mv-spacing-${name}`] = `${value}px`;
  for (const [name, value] of Object.entries(RADII)) variables[`--mv-radius-${name}`] = `${value}px`;
  for (const [name, value] of Object.entries(BORDERS)) variables[`--mv-border-${name}`] = `${value}px`;
  for (const [name, token] of Object.entries(MOTION)) {
    variables[`--mv-motion-${name}-duration`] = `${token.duration}ms`;
    variables[`--mv-motion-${name}-easing`] = token.easing;
  }
  return variables;
}
