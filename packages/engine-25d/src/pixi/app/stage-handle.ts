import type { ViewportInfo } from '@mesa-viva/design-system';
import type { TableSnapshot } from '../../state/snapshot.js';

export type StageKind = 'pixi' | 'dom';

/** Contrato común entre la mesa GPU y el respaldo estático sin WebGL. */
export interface StageHandle {
  readonly kind: StageKind;
  render(snapshot: TableSnapshot): void;
  resize(viewport?: ViewportInfo): void;
  setHandHidden(hidden: boolean): void;
  destroy(): void;
}
