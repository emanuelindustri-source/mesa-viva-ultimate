import { describe, expect, it } from 'vitest';
import {
  BRAND_GAME_IDS,
  BrandAssetGenerator,
  generateGameEmblem,
  generateGithubBanner,
  generateLogo,
  generatePwaIcon,
  generateSplash,
  hasAccessory,
} from '../src/brand/index.js';
import { THEMED_HOLIDAY_IDS } from '../src/holidays/holiday-ids.js';

describe('identidad visual procedural', () => {
  it('genera un logo mutante por cada festividad', () => {
    const logos = new Set<string>();
    for (const id of [...THEMED_HOLIDAY_IDS, 'dia-normal'] as const) {
      const svg = BrandAssetGenerator.holidayLogo(id);
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('<title>');
      expect(svg).toContain('Mesa Viva');
      logos.add(svg);
    }
    expect(logos.size).toBe(20);
    expect(hasAccessory('navidad')).toBe(true);
    expect(hasAccessory('dia-normal')).toBe(true);
  });

  it('genera emblemas únicos para el catálogo y futuros juegos', () => {
    const emblems = BRAND_GAME_IDS.map((gameId) => generateGameEmblem({ gameId }));
    expect(new Set(emblems).size).toBe(BRAND_GAME_IDS.length);
    for (const emblem of emblems) {
      expect(emblem).toContain('viewBox="0 0 128 128"');
      expect(emblem).not.toContain('<image');
      expect(emblem).not.toContain('href="http');
    }
    expect(generateGameEmblem({ gameId: 'desconocido' })).toContain('>M<');
  });

  it('genera iconos PWA adaptativos, monocromo, favicon y splash', () => {
    const maskable = BrandAssetGenerator.pwaIcon(512, { maskable: true });
    const monochrome = BrandAssetGenerator.monochromeIcon(192);
    expect(maskable).toContain('width="512"');
    expect(maskable).toContain('scale(0.74)');
    expect(monochrome).toContain('#fff');
    expect(BrandAssetGenerator.favicon()).toContain('width="64"');
    const splash = generateSplash(1080, 1920);
    expect(splash).toContain('width="1080"');
    expect(splash).toContain('La fiesta se juega en tu mesa');
  });

  it('produce un banner de repositorio sin recursos externos', () => {
    const banner = generateGithubBanner();
    expect(banner).toContain('width="1280"');
    expect(banner).toContain('Mesa Viva');
    expect(banner).toContain('100% offline');
    expect(banner).not.toContain('<image');
    expect(generateLogo()).toBe(generateLogo());
    expect(generatePwaIcon(192)).toContain('viewBox="0 0 128 128"');
  });

  it('respeta paletas y modo claro/oscuro', () => {
    const light = generateLogo({ mode: 'light', palette: { primary: '#123456', accent: '#abcdef' } });
    const dark = generateLogo({ mode: 'dark' });
    expect(light).toContain('#123456');
    expect(light).toContain('#abcdef');
    expect(light).not.toBe(dark);
    expect(BrandAssetGenerator.emblemGallery(['caida', 'domino'])).toHaveProperty('caida');
  });
});
