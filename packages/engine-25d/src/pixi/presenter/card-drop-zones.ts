import type { DropZone } from '../../drag/drop-session.js';
import type { DropHint } from '../../state/snapshot.js';

export interface CardZoneSource {
  readonly cardId: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly scale: number;
}

export interface ZoneLayout {
  readonly centerX: number;
  readonly centerY: number;
  readonly width: number;
  readonly height: number;
}

export type ProjectPoint = (x: number, y: number) => { readonly x: number; readonly y: number; readonly scale: number };

/** Construye las zonas táctiles de mesa, descarte y captura. */
export function buildCardZones(
  sources: readonly CardZoneSource[],
  drops: readonly DropHint[],
  project: ProjectPoint,
  layout: ZoneLayout,
): readonly DropZone[] {
  const zones: DropZone[] = [];
  for (const hint of drops) {
    if (hint.kind === 'table') continue;
    const source = sources.find((candidate) => candidate.cardId === hint.cardId);
    if (source === undefined) continue;
    const point = project(source.x, source.y);
    const width = source.width * point.scale * source.scale;
    const height = source.height * point.scale * source.scale;
    zones.push({
      id: hint.cardId,
      kind: hint.kind,
      x: point.x - width / 2 - 12,
      y: point.y - height / 2 - 12,
      width: width + 24,
      height: height + 24,
    });
  }
  if (drops.some((hint) => hint.kind === 'table')) {
    zones.push({
      id: 'mesa',
      kind: 'table',
      x: layout.centerX - layout.width * 0.3,
      y: layout.centerY - layout.height * 0.22,
      width: layout.width * 0.6,
      height: layout.height * 0.44,
    });
  }
  return zones;
}

export function hintedCards(drops: readonly DropHint[]): readonly string[] {
  return drops.filter((hint) => hint.kind !== 'table').map((hint) => hint.cardId);
}
