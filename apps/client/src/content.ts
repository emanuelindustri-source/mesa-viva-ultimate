import { CORE_VERSION } from '@mesa-viva/core';
import { DESIGN_SYSTEM_VERSION } from '@mesa-viva/design-system';
import { ENGINE_25D_VERSION } from '@mesa-viva/engine-25d';
import { SENSORY_ENGINE_VERSION } from '@mesa-viva/sensory-engine';

export const REPO_URL = 'https://github.com/emanuelindustri-source/mesa-viva-ultimate';

export const PAQUETES = [
  { nombre: 'Motor Core', detalle: 'Reglas, bots y economía', version: CORE_VERSION },
  { nombre: 'Diseño', detalle: 'Material You, 19 festividades, 11 idiomas y atlas SVG', version: DESIGN_SYSTEM_VERSION },
  { nombre: 'Motor 2.5D', detalle: 'PixiJS v8, atlas GPU, físicas táctiles y sensores', version: ENGINE_25D_VERSION },
  { nombre: 'Sensorial', detalle: 'Audio 3D HRTF, 8 stems adaptativos y háptica de precisión', version: SENSORY_ENGINE_VERSION },
] as const;

export const FASES = [
  { n: 0, nombre: 'Fundación', detalle: 'Monorepo, Git, CI/CD y repositorio público.', estado: 'Completada' },
  { n: 1, nombre: 'Motor Core', detalle: 'Reglas universales, primeros juegos, bots y economía.', estado: 'Completada' },
  { n: 2, nombre: 'Diseño Universal', detalle: 'Material You, 19 festividades, 6 pantallas y 11 idiomas.', estado: 'Completada' },
  { n: 3, nombre: 'Motor 2.5D', detalle: 'Entidades, perspectiva, sombras y sensores de movimiento.', estado: 'Completada' },
  { n: 4, nombre: 'Motor Sensorial', detalle: 'Audio HRTF a 48 kHz, 8 stems adaptativos y háptica Capacitor.', estado: 'Completada' },
  { n: 5, nombre: 'Portal y Online', detalle: 'Landing, app offline, P2P por QR/PIN y monetización.', estado: 'Siguiente' },
  { n: 6, nombre: 'Catálogo Completo', detalle: 'Todos los juegos, enciclopedia y empaquetado Android.', estado: 'Planificada' },
] as const;

export const JUEGOS = [
  { nombre: 'Caída Venezolana', detalle: 'Seis cantos, entrega de mesa, capturas y carrera a 24 puntos.', etiqueta: '2–4 jugadores' },
  { nombre: 'Dominó Venezolano', detalle: 'Doble seis, equipos 1v1 y 2v2, pases, tranca y 100 puntos.', etiqueta: '1v1 · 2v2' },
  { nombre: 'Blackjack 21', detalle: 'Apuestas, pedir, plantar y doblar contra el crupier. Paga 3:2.', etiqueta: '1–4 jugadores' },
  { nombre: 'Cartas de Colores', detalle: 'Salta, reversa, roba dos y comodines en una baraja original.', etiqueta: '2–4 jugadores' },
] as const;

export const VERSIONES = [
  {
    version: 'v0.5.0',
    titulo: 'Fase 4 · Motor Sensorial',
    detalle:
      'Audio espacial HRTF a 48 kHz, música adaptativa de ocho stems con 19 festividades, limitador maestro, voz pooling, háptica Capacitor/Web y render offline determinista. 257 pruebas.',
    nota: 'docs/versiones/v0.5.0-fase4-motor-sensorial.md',
  },
  {
    version: 'v0.4.0',
    titulo: 'Fase 3 · Motor 2.5D',
    detalle:
      'PixiJS v8 y GSAP, entidades universales, cámara adaptativa en seis formatos, atlas SVG en GPU, object pooling y sensores de movimiento con degradación segura.',
    nota: 'docs/versiones/v0.4.0-fase3-motor-25d.md',
  },
  {
    version: 'v0.3.0',
    titulo: 'Fase 2 · Diseño Universal',
    detalle:
      'Material You con color dinámico, 19 festividades, 11 idiomas, seis formatos de pantalla y 200 assets SVG procedurales.',
    nota: 'docs/versiones/v0.3.0-fase2-diseno-universal.md',
  },
  {
    version: 'v0.2.0',
    titulo: 'Fase 1 · Motor Core',
    detalle:
      'Cuatro juegos completos, bots Novato/Competitivo/Maestro, economía de largo plazo con misiones, racha, tienda y guardado HMAC.',
    nota: 'docs/versiones/v0.2.0-fase1-motor-core.md',
  },
  {
    version: 'v0.1.0',
    titulo: 'Fase 0 · Fundación',
    detalle:
      'Monorepo pnpm con cuatro paquetes y cliente Preact, TypeScript estricto, Vitest, CI/CD y sistema de notas de versión.',
    nota: 'docs/versiones/v0.1.0-fase0-fundacion.md',
  },
] as const;
