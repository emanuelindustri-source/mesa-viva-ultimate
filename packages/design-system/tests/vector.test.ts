import { describe, expect, it } from 'vitest';
import {
  ATLAS_VERSION,
  buildAdaptiveIcon,
  buildDominoTile,
  buildEnglishCard,
  buildSpanishCard,
  escapeXml,
  fnv1a,
  generateAdaptiveIcons,
  generateBoards,
  generateColorCards,
  generateDominoSet,
  generateEnglishDeck,
  generateMedals,
  generateSpanishDeck,
  RANK_MEDALS,
  safeId,
  splitSvg,
  svgSprite,
  VectorAtlasGenerator,
} from '../src/index.js';

describe('generadores individuales', () => {
  it('genera 40 cartas españolas con ids estables', () => {
    const deck = generateSpanishDeck();
    expect(deck).toHaveLength(40);
    expect(deck[0]?.id).toBe('carta-espanola-oros-1');
    expect(deck.at(-1)?.id).toBe('carta-espanola-bastos-12');
    expect(new Set(deck.map((card) => card.id)).size).toBe(40);
    expect(buildSpanishCard('copas', 10).markup).toContain('Carta española 10 de copas');
  });

  it('genera 52 cartas inglesas', () => {
    const deck = generateEnglishDeck();
    expect(deck).toHaveLength(52);
    expect(deck[0]?.id).toBe('carta-inglesa-hearts-a');
    expect(deck.at(-1)?.id).toBe('carta-inglesa-spades-k');
    expect(buildEnglishCard('diamonds', 'Q').markup).toContain('Q');
  });

  it('genera 54 caras de colores, incluidas dos comodines', () => {
    const cards = generateColorCards();
    expect(cards).toHaveLength(54);
    expect(cards.filter((card) => card.id.includes('negro'))).toHaveLength(2);
    expect(cards.some((card) => card.id === 'carta-color-azul-roba2')).toBe(true);
  });

  it('genera dominó doble seis, doble nueve y doble doce', () => {
    expect(generateDominoSet(6)).toHaveLength(28);
    expect(generateDominoSet(9)).toHaveLength(55);
    expect(generateDominoSet(12)).toHaveLength(91);
    expect(buildDominoTile(6, 6).markup).toContain('Ficha de dominó 6-6');
    expect(() => generateDominoSet(13)).toThrow();
  });

  it('genera siete tableros base', () => {
    const boards = generateBoards();
    expect(boards).toHaveLength(7);
    expect(boards.map((board) => board.id)).toEqual([
      'tablero-ajedrez',
      'tablero-damas',
      'tablero-go',
      'tablero-serpientes-escaleras',
      'tablero-backgammon',
      'tablero-mancala',
      'tablero-ludo',
    ]);
  });

  it('genera medallas para los cuatro rangos', () => {
    expect(generateMedals()).toHaveLength(4);
    expect(generateMedals().map((medal) => medal.id)).toEqual(RANK_MEDALS.map((rank) => `medalla-${rank}`));
  });

  it('genera 15 capas de iconos adaptativos', () => {
    const icons = generateAdaptiveIcons();
    expect(icons).toHaveLength(15);
    expect(icons.every((icon) => icon.width === 108 && icon.height === 108)).toBe(true);
    expect(buildAdaptiveIcon('colores', 'monochrome').id).toBe('icono-adaptativo-colores-monochrome');
  });
});

describe('atlas completo', () => {
  const generator = new VectorAtlasGenerator();
  const manifest = generator.generate();

  it('reúne 200 assets de siete familias', () => {
    expect(ATLAS_VERSION).toBe('1.0.0');
    expect(manifest.assets).toHaveLength(200);
    expect(manifest.ids).toHaveLength(200);
    expect(new Set(manifest.ids).size).toBe(200);
    expect(manifest.byKind).toEqual([
      { kind: 'carta-espanola', count: 40 },
      { kind: 'carta-inglesa', count: 52 },
      { kind: 'carta-color', count: 54 },
      { kind: 'ficha-domino', count: 28 },
      { kind: 'tablero', count: 7 },
      { kind: 'medalla', count: 4 },
      { kind: 'icono-adaptativo', count: 15 },
    ]);
  });

  it('es determinista y no usa imágenes externas', () => {
    const again = new VectorAtlasGenerator().generate();
    expect(again.fingerprint).toBe(manifest.fingerprint);
    expect(again.ids).toEqual(manifest.ids);
    expect(manifest.fingerprint).toMatch(/^[0-9a-f]{8}$/);
    for (const asset of manifest.assets) {
      expect(asset.markup.startsWith('<svg')).toBe(true);
      expect(asset.markup.endsWith('</svg>')).toBe(true);
      expect(asset.markup).not.toContain('<image');
      expect(asset.markup).not.toContain('xlink:href');
      expect(asset.markup).toContain('viewBox=');
    }
  });

  it('construye un sprite con 200 símbolos', () => {
    expect(manifest.sprite.match(/<symbol /g)).toHaveLength(200);
    expect(manifest.sprite).toContain('id="carta-espanola-oros-1"');
    expect(svgSprite(generateBoards()).match(/<symbol /g)).toHaveLength(7);
  });

  it('permite omitir el sprite y cambiar el dominó', () => {
    const noSprite = new VectorAtlasGenerator({ includeSprite: false }).generate();
    expect(noSprite.sprite).toBe('');
    const doubleTwelve = new VectorAtlasGenerator({ dominoMaxPip: 12 }).generate();
    expect(doubleTwelve.assets).toHaveLength(263);
  });

  it('busca assets por id', () => {
    expect(generator.getById('medalla-leyenda')?.kind).toBe('medalla');
    expect(generator.getById('no-existe')).toBeNull();
    expect(generator.stats().find((item) => item.kind === 'tablero')?.count).toBe(7);
  });
});

describe('utilidades SVG', () => {
  it('escapa XML y normaliza identificadores', () => {
    expect(escapeXml('<a & "b">')).toBe('&lt;a &amp; &quot;b&quot;&gt;');
    expect(safeId('Carta Española', 'Águila')).toBe('carta-espanola-aguila');
  });

  it('calcula huellas deterministas', () => {
    expect(fnv1a('mesa')).toBe(fnv1a('mesa'));
    expect(fnv1a('mesa')).not.toBe(fnv1a('viva'));
    expect(splitSvg('<svg viewBox="0 0 1 1"><rect/></svg>')?.viewBox).toBe('0 0 1 1');
    expect(splitSvg('no-svg')).toBeNull();
  });
});
