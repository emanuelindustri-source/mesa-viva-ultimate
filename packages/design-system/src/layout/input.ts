import type { ScreenFormat } from '../version.js';
import type { FocusDirection } from './focus.js';
import type { InputCapabilities, InputMode } from './types.js';

export type InputAction = FocusDirection | 'activate' | 'back' | 'menu';

const BASE: Readonly<Record<ScreenFormat, InputCapabilities>> = {
  movil: { touch: true, mouse: false, keyboard: false, dpad: false, remote: false },
  tablet: { touch: true, mouse: true, keyboard: true, dpad: false, remote: false },
  televisor: { touch: false, mouse: false, keyboard: true, dpad: true, remote: true },
  laptop: { touch: false, mouse: true, keyboard: true, dpad: false, remote: false },
  ultrawide: { touch: false, mouse: true, keyboard: true, dpad: false, remote: false },
  plegable: { touch: true, mouse: false, keyboard: false, dpad: false, remote: false },
};

export function createInputProfile(
  format: ScreenFormat,
  overrides: Partial<InputCapabilities> = {},
): InputCapabilities {
  const base = BASE[format];
  return {
    touch: overrides.touch ?? base.touch,
    mouse: overrides.mouse ?? base.mouse,
    keyboard: overrides.keyboard ?? base.keyboard,
    dpad: overrides.dpad ?? base.dpad,
    remote: overrides.remote ?? base.remote,
  };
}

export function inputModeFor(profile: InputCapabilities): InputMode {
  if (profile.remote || profile.dpad) return 'dpad';
  if (profile.touch) return profile.mouse || profile.keyboard ? 'hybrid' : 'touch';
  return 'mouse';
}

const KEY_ACTIONS: Readonly<Record<string, InputAction>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
  Enter: 'activate',
  NumpadEnter: 'activate',
  Space: 'activate',
  Escape: 'back',
  Backspace: 'back',
  GoBack: 'back',
  BrowserBack: 'back',
  ContextMenu: 'menu',
  KeyM: 'menu',
};

/** Traduce teclas de teclado, mando y control remoto a acciones de foco. */
export function actionForKey(key: string): InputAction | null {
  return KEY_ACTIONS[key] ?? null;
}

/** En TV el foco debe ser visible sin depender del hover del ratón. */
export function requiresVisibleFocus(format: ScreenFormat, profile: InputCapabilities): boolean {
  return format === 'televisor' || profile.dpad || profile.remote || profile.keyboard;
}

export function minimumTargetSize(format: ScreenFormat): number {
  return format === 'televisor' ? 64 : 48;
}
