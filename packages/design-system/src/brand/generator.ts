import type { HolidayId } from '../holidays/holiday-ids.js';
import { generateGameEmblem } from './games.js';
import {
  generateFavicon,
  generateGithubBanner,
  generateHolidayLogo,
  generateLogo,
  generatePwaIcon,
  generateSplash,
} from './logo.js';
import type { BrandOptions, GameEmblemOptions } from './types.js';

/** Fachada única para logos, emblemas, iconos, splash y banner del repositorio. */
export class BrandAssetGenerator {
  static logo(options: BrandOptions = {}): string {
    return generateLogo(options);
  }

  static holidayLogo(holidayId: HolidayId, options: BrandOptions = {}): string {
    return generateHolidayLogo(holidayId, options);
  }

  static gameEmblem(options: GameEmblemOptions): string {
    return generateGameEmblem(options);
  }

  static favicon(options: BrandOptions = {}): string {
    return generateFavicon(options);
  }

  static pwaIcon(size: number, options: BrandOptions & { maskable?: boolean; monochrome?: boolean } = {}): string {
    return generatePwaIcon(size, options);
  }

  static monochromeIcon(size = 512): string {
    return generatePwaIcon(size, { monochrome: true, maskable: true });
  }

  static splash(width = 1170, height = 2532, options: BrandOptions & { tagline?: string } = {}): string {
    return generateSplash(width, height, options);
  }

  static githubBanner(options: BrandOptions = {}): string {
    return generateGithubBanner(options);
  }

  static holidayGallery(holidayIds: readonly HolidayId[]): Readonly<Record<HolidayId, string>> {
    const gallery = {} as Record<HolidayId, string>;
    for (const id of holidayIds) gallery[id] = generateHolidayLogo(id);
    return gallery;
  }

  static emblemGallery(gameIds: readonly string[]): Readonly<Record<string, string>> {
    const gallery: Record<string, string> = {};
    for (const id of gameIds) gallery[id] = generateGameEmblem({ gameId: id });
    return gallery;
  }
}
