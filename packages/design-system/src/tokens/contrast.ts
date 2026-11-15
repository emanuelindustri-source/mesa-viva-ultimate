import { contrastRatio } from './color-convert.js';
import type { ColorScheme, ContrastCheck } from './color-types.js';
import { CONTRAST_PAIRS } from './color-types.js';

/** Audita los pares mínimos de una paleta con WCAG 2.1 AA/AAA. */
export function checkSchemeContrast(scheme: ColorScheme): readonly ContrastCheck[] {
  return CONTRAST_PAIRS.map(([foregroundRole, backgroundRole]) => {
    const ratio = contrastRatio(scheme[foregroundRole], scheme[backgroundRole]);
    return {
      foregroundRole,
      backgroundRole,
      ratio: Math.round(ratio * 100) / 100,
      passesAA: ratio >= 4.5,
      passesAAA: ratio >= 7,
    };
  });
}

export function schemePassesAA(scheme: ColorScheme): boolean {
  return checkSchemeContrast(scheme).every((check) => check.passesAA);
}
