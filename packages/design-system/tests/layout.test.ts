import { describe, expect, it } from 'vitest';
import {
  actionForKey,
  createInputProfile,
  createLayoutPlan,
  decideFormat,
  detectScreenFormat,
  type HingeInfo,
  inputModeFor,
  minimumTargetSize,
  requiresVisibleFocus,
  SCREEN_FORMATS,
  sizeClassFor,
  type ViewportInfo,
} from '../src/index.js';

const HINGE: HingeInfo = { posture: 'half-open', orientation: 'vertical', size: 32, isSeparating: true };

const DEVICES: Readonly<Record<string, ViewportInfo>> = {
  movil: { width: 390, height: 844 },
  'movil-horizontal': { width: 844, height: 390 },
  tablet: { width: 1024, height: 768 },
  televisor: { width: 1920, height: 1080, isTelevision: true },
  laptop: { width: 1440, height: 900 },
  ultrawide: { width: 3440, height: 1440 },
  plegable: { width: 884, height: 1104, isFoldable: true, hinge: HINGE },
};

describe('detección de los seis formatos', () => {
  it('clasifica cada dispositivo de referencia', () => {
    expect(SCREEN_FORMATS).toHaveLength(6);
    expect(detectScreenFormat(DEVICES.movil as ViewportInfo)).toBe('movil');
    expect(detectScreenFormat(DEVICES['movil-horizontal'] as ViewportInfo)).toBe('movil');
    expect(detectScreenFormat(DEVICES.tablet as ViewportInfo)).toBe('tablet');
    expect(detectScreenFormat(DEVICES.televisor as ViewportInfo)).toBe('televisor');
    expect(detectScreenFormat(DEVICES.laptop as ViewportInfo)).toBe('laptop');
    expect(detectScreenFormat(DEVICES.ultrawide as ViewportInfo)).toBe('ultrawide');
    expect(detectScreenFormat(DEVICES.plegable as ViewportInfo)).toBe('plegable');
  });

  it('calcula orientación y clase de tamaño', () => {
    expect(decideFormat(DEVICES['movil-horizontal'] as ViewportInfo).orientation).toBe('landscape');
    expect(decideFormat(DEVICES.movil as ViewportInfo).orientation).toBe('portrait');
    expect(sizeClassFor(390)).toBe('compact');
    expect(sizeClassFor(800)).toBe('medium');
    expect(sizeClassFor(1440)).toBe('expanded');
  });

  it('rechaza viewports inválidos', () => {
    expect(() => decideFormat({ width: 0, height: 100 })).toThrow();
    expect(() => decideFormat({ width: Number.NaN, height: 100 })).toThrow();
  });
});

describe('planes de layout por formato', () => {
  it('móvil usa barra inferior y objetivos táctiles de 48', () => {
    const plan = createLayoutPlan(DEVICES.movil as ViewportInfo);
    expect(plan.format).toBe('movil');
    expect(plan.columns).toBe(4);
    expect(plan.nav.mode).toBe('bottom');
    expect(plan.touchTarget).toBe(48);
    expect(plan.gutter).toBe(16);
  });

  it('tablet usa raíl, 8 columnas y más margen', () => {
    const plan = createLayoutPlan(DEVICES.tablet as ViewportInfo);
    expect(plan.columns).toBe(8);
    expect(plan.nav.mode).toBe('rail');
    expect(plan.margin).toBe(24);
  });

  it('televisor prioriza foco, overscan y texto grande', () => {
    const plan = createLayoutPlan(DEVICES.televisor as ViewportInfo);
    expect(plan.touchTarget).toBe(64);
    expect(plan.focusRingWidth).toBe(6);
    expect(plan.minFontSize).toBe(24);
    expect(plan.safeArea.overscan).toBe(48);
    expect(plan.nav.alwaysVisibleLabels).toBe(true);
    expect(plan.input.dpad).toBe(true);
    expect(requiresVisibleFocus(plan.format, plan.input)).toBe(true);
    expect(minimumTargetSize('televisor')).toBe(64);
  });

  it('laptop y ultrawide usan barra lateral y más columnas', () => {
    const laptop = createLayoutPlan(DEVICES.laptop as ViewportInfo);
    const ultra = createLayoutPlan(DEVICES.ultrawide as ViewportInfo);
    expect(laptop.nav.mode).toBe('sidebar');
    expect(laptop.columns).toBe(12);
    expect(ultra.columns).toBe(16);
    expect(ultra.contentMaxWidth).toBe(1680);
    expect(ultra.boardScale).toBeGreaterThan(1);
  });

  it('plegable detecta la bisagra y activa dos paneles', () => {
    const plan = createLayoutPlan(DEVICES.plegable as ViewportInfo);
    expect(plan.format).toBe('plegable');
    expect(plan.splitView.enabled).toBe(true);
    expect(plan.splitView.panes).toBe(2);
    expect(plan.splitView.hinge).toEqual(HINGE);
    expect(plan.splitView.paneMaxWidth).toBeGreaterThan(0);
    expect(plan.columns).toBeGreaterThanOrEqual(8);
  });

  it('un plegable plano no divide la pantalla', () => {
    const flat: ViewportInfo = {
      width: 884,
      height: 1104,
      isFoldable: true,
      hinge: { posture: 'flat', orientation: 'vertical', size: 0, isSeparating: false },
    };
    const plan = createLayoutPlan(flat);
    expect(plan.splitView.enabled).toBe(false);
    expect(plan.splitView.panes).toBe(1);
  });

  it('un plegable en modo libro divide en horizontal', () => {
    const book: ViewportInfo = {
      width: 1104,
      height: 884,
      isFoldable: true,
      hinge: { posture: 'book', orientation: 'vertical', size: 24, isSeparating: true },
    };
    const plan = createLayoutPlan(book);
    expect(plan.orientation).toBe('landscape');
    expect(plan.nav.mode).toBe('rail');
    expect(plan.splitView.enabled).toBe(true);
  });

  it('acepta escala adicional del tablero', () => {
    const normal = createLayoutPlan(DEVICES.tablet as ViewportInfo);
    const scaled = createLayoutPlan(DEVICES.tablet as ViewportInfo, { scale: 1.2 });
    expect(scaled.boardScale).toBeCloseTo(normal.boardScale * 1.2);
    expect(scaled.cardMinWidth).toBeCloseTo(normal.cardMinWidth * 1.2);
  });
});

describe('entradas táctil, ratón y D-pad', () => {
  it('asigna capacidades por formato', () => {
    expect(inputModeFor(createInputProfile('movil'))).toBe('touch');
    expect(inputModeFor(createInputProfile('televisor'))).toBe('dpad');
    expect(inputModeFor(createInputProfile('laptop'))).toBe('mouse');
    expect(createInputProfile('tablet').touch).toBe(true);
    expect(createInputProfile('tablet').dpad).toBe(false);
  });

  it('permite sobrescribir capacidades', () => {
    const hybrid = createInputProfile('televisor', { touch: true, remote: false, dpad: false });
    expect(hybrid.touch).toBe(true);
    expect(inputModeFor(hybrid)).toBe('hybrid');
  });

  it('mapea teclas y controles remotos', () => {
    expect(actionForKey('ArrowLeft')).toBe('left');
    expect(actionForKey('KeyW')).toBe('up');
    expect(actionForKey('Enter')).toBe('activate');
    expect(actionForKey('Escape')).toBe('back');
    expect(actionForKey('GoBack')).toBe('back');
    expect(actionForKey('F13')).toBeNull();
  });
});
