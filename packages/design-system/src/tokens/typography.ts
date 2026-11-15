export const TYPOGRAPHY_ROLES = [
  'display-large',
  'display-medium',
  'display-small',
  'headline-large',
  'headline-medium',
  'headline-small',
  'title-large',
  'title-medium',
  'title-small',
  'body-large',
  'body-medium',
  'body-small',
  'label-large',
  'label-medium',
  'label-small',
] as const;

export type TypographyRole = (typeof TYPOGRAPHY_ROLES)[number];

export interface TypeToken {
  readonly family: string;
  readonly size: number;
  readonly lineHeight: number;
  readonly weight: number;
  readonly letterSpacing: number;
}

export type TypographyScale = Readonly<Record<TypographyRole, TypeToken>>;

const LATIN = "'Inter', 'Segoe UI', 'Noto Sans', system-ui, sans-serif";
const CJK_SC = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
const CJK_JP = "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif";
const DEVANAGARI = "'Noto Sans Devanagari', 'Mangal', 'Nirmala UI', sans-serif";

export function fontStackFor(locale: string): string {
  const language = locale.toLowerCase().split('-')[0] ?? 'es';
  if (language === 'zh') return CJK_SC;
  if (language === 'ja') return CJK_JP;
  if (language === 'hi') return DEVANAGARI;
  return LATIN;
}

interface RoleSpec {
  readonly role: TypographyRole;
  readonly size: number;
  readonly lineHeight: number;
  readonly weight: number;
  readonly spacing: number;
}

const SPECS: readonly RoleSpec[] = [
  { role: 'display-large', size: 57, lineHeight: 64, weight: 400, spacing: -0.25 },
  { role: 'display-medium', size: 45, lineHeight: 52, weight: 400, spacing: 0 },
  { role: 'display-small', size: 36, lineHeight: 44, weight: 400, spacing: 0 },
  { role: 'headline-large', size: 32, lineHeight: 40, weight: 500, spacing: 0 },
  { role: 'headline-medium', size: 28, lineHeight: 36, weight: 500, spacing: 0 },
  { role: 'headline-small', size: 24, lineHeight: 32, weight: 500, spacing: 0 },
  { role: 'title-large', size: 22, lineHeight: 28, weight: 500, spacing: 0 },
  { role: 'title-medium', size: 16, lineHeight: 24, weight: 600, spacing: 0.15 },
  { role: 'title-small', size: 14, lineHeight: 20, weight: 600, spacing: 0.1 },
  { role: 'body-large', size: 16, lineHeight: 24, weight: 400, spacing: 0.5 },
  { role: 'body-medium', size: 14, lineHeight: 20, weight: 400, spacing: 0.25 },
  { role: 'body-small', size: 12, lineHeight: 16, weight: 400, spacing: 0.4 },
  { role: 'label-large', size: 14, lineHeight: 20, weight: 600, spacing: 0.1 },
  { role: 'label-medium', size: 12, lineHeight: 16, weight: 600, spacing: 0.5 },
  { role: 'label-small', size: 11, lineHeight: 16, weight: 600, spacing: 0.5 },
];

function clampScale(scale: number): number {
  if (!Number.isFinite(scale)) return 1;
  return Math.min(2, Math.max(0.8, scale));
}

/** Escala tipográfica común a las seis pantallas. `scale` la acerca al televisor. */
export function createTypography(locale: string, scale = 1): TypographyScale {
  const factor = clampScale(scale);
  const family = fontStackFor(locale);
  const scale2 = (value: number): number => Math.round(value * factor * 100) / 100;
  const entries = SPECS.map((spec) => [
    spec.role,
    {
      family,
      size: scale2(spec.size),
      lineHeight: scale2(spec.lineHeight),
      weight: spec.weight,
      letterSpacing: spec.spacing,
    },
  ] as const);
  return Object.fromEntries(entries) as unknown as TypographyScale;
}

export function typographyToCssVariables(scale: TypographyScale): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const role of TYPOGRAPHY_ROLES) {
    const token = scale[role];
    variables[`--md-sys-typescale-${role}-font`] = token.family;
    variables[`--md-sys-typescale-${role}-size`] = `${token.size}px`;
    variables[`--md-sys-typescale-${role}-line-height`] = `${token.lineHeight}px`;
    variables[`--md-sys-typescale-${role}-weight`] = String(token.weight);
    variables[`--md-sys-typescale-${role}-tracking`] = `${token.letterSpacing}px`;
  }
  return variables;
}
