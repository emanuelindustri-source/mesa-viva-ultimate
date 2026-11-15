import { BrandAssetGenerator, type HolidayId, type ThemeMode } from '@mesa-viva/design-system';
import { useMemo } from 'preact/hooks';

interface BrandMarkProps {
  readonly holidayId?: HolidayId;
  readonly mode?: ThemeMode;
  readonly size?: number;
  readonly label?: string;
  readonly class?: string;
  readonly animated?: boolean;
}

/** Logo mutante inline, sin peticiones de red ni imágenes externas. */
export function BrandMark({ holidayId = 'dia-normal', mode = 'dark', size = 48, label = 'Mesa Viva', class: className = '', animated = false }: BrandMarkProps) {
  const svg = useMemo(() => BrandAssetGenerator.holidayLogo(holidayId, { mode, size, title: label }), [holidayId, mode, size, label]);
  return (
    <span
      class={`brand-mark ${animated ? 'brand-mark--animado' : ''} ${className}`.trim()}
      style={{ width: `${size}px`, height: `${size}px` }}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

interface GameEmblemProps {
  readonly gameId: string;
  readonly holidayId?: HolidayId;
  readonly mode?: ThemeMode;
  readonly size?: number;
}

export function GameEmblem({ gameId, holidayId = 'dia-normal', mode = 'dark', size = 80 }: GameEmblemProps) {
  const svg = useMemo(() => BrandAssetGenerator.gameEmblem({ gameId, holidayId, mode, size, title: gameId }), [gameId, holidayId, mode, size]);
  return <span class="game-emblem" style={{ width: `${size}px`, height: `${size}px` }} role="img" aria-label={`Emblema de ${gameId}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}
