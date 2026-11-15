export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface Oklch {
  /** Luminosidad perceptual 0..1. */
  readonly l: number;
  /** Croma 0..0.37 aproximado. */
  readonly c: number;
  /** Matiz en grados 0..360. */
  readonly h: number;
}

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Acepta `#rgb` o `#rrggbb` y devuelve siempre `#rrggbb` en minúsculas. */
export function normalizeHex(input: string): string {
  const match = HEX_PATTERN.exec(input.trim());
  if (match === null) throw new Error(`Color hexadecimal inválido: ${input}`);
  const digits = match[1] ?? '';
  if (digits.length === 6) return `#${digits.toLowerCase()}`;
  return `#${digits
    .split('')
    .map((digit) => `${digit}${digit}`)
    .join('')
    .toLowerCase()}`;
}

export function hexToRgb(input: string): Rgb {
  const hex = normalizeHex(input).slice(1);
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

export function rgbToHex(rgb: Rgb): string {
  const channel = (value: number): string =>
    Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0');
  return `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`;
}

export function srgbToLinear(channel: number): number {
  const value = clamp(channel, 0, 1);
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function linearToSrgb(value: number): number {
  const channel = clamp(value, 0, 1);
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
}

export function hexToOklch(input: string): Oklch {
  const { r, g, b } = hexToRgb(input);
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.sqrt(a * a + bb * bb);
  const hue = chroma < 1e-6 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return { l: clamp(lightness, 0, 1), c: chroma, h: hue };
}

export function oklchToHex(color: Oklch): string {
  const l = clamp(color.l, 0, 1);
  const c = Math.max(0, color.c);
  const h = ((color.h % 360) + 360) % 360;
  const radians = (h * Math.PI) / 180;
  const a = Math.cos(radians) * c;
  const b = Math.sin(radians) * c;
  const lCube = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mCube = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sCube = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linearR = 4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
  const linearG = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
  const linearB = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube;
  return rgbToHex({
    r: linearToSrgb(linearR) * 255,
    g: linearToSrgb(linearG) * 255,
    b: linearToSrgb(linearB) * 255,
  });
}

export function relativeLuminance(input: string): number {
  const { r, g, b } = hexToRgb(input);
  return 0.2126 * srgbToLinear(r / 255) + 0.7152 * srgbToLinear(g / 255) + 0.0722 * srgbToLinear(b / 255);
}

/** Relación WCAG 2.1 entre dos colores opacos. */
export function contrastRatio(first: string, second: string): number {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function blendHex(first: string, second: string, amount = 0.5): string {
  const a = hexToRgb(first);
  const b = hexToRgb(second);
  const ratio = clamp(amount, 0, 1);
  return rgbToHex({
    r: a.r + (b.r - a.r) * ratio,
    g: a.g + (b.g - a.g) * ratio,
    b: a.b + (b.b - a.b) * ratio,
  });
}

export function withAlpha(input: string, alpha: number): string {
  const { r, g, b } = hexToRgb(input);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1).toFixed(3)})`;
}
