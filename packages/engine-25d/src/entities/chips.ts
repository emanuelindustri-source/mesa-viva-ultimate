import { clamp } from '../math/vec3.js';

export interface ChipDenomination {
  readonly value: number;
  readonly color: string;
  readonly rim: string;
}

/** Fichas virtuales de mesa, sin valor monetario ni conversión a dinero. */
export const CHIP_DENOMINATIONS: readonly ChipDenomination[] = [
  { value: 500, color: '#6a1b9a', rim: '#ce93d8' },
  { value: 100, color: '#1a237e', rim: '#9fa8da' },
  { value: 25, color: '#1b5e20', rim: '#a5d6a7' },
  { value: 10, color: '#b71c1c', rim: '#ef9a9a' },
  { value: 5, color: '#e65100', rim: '#ffcc80' },
  { value: 1, color: '#37474f', rim: '#b0bec5' },
];

export interface ChipStack {
  readonly denomination: ChipDenomination;
  readonly count: number;
  readonly total: number;
  readonly x: number;
  readonly y: number;
  readonly height: number;
}

export interface ChipStackLayout {
  readonly amount: number;
  readonly stacks: readonly ChipStack[];
  readonly chipCount: number;
  readonly overflow: number;
}

export interface ChipStackOptions {
  readonly maxPerStack?: number;
  readonly spacing?: number;
  readonly chipHeight?: number;
}

/** Descompone una cantidad en pilas visuales de fichas. */
export function chipStackLayout(amount: number, options: ChipStackOptions = {}): ChipStackLayout {
  const total = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));
  const maxPerStack = clamp(Math.round(options.maxPerStack ?? 12), 1, 40);
  const spacing = Math.max(8, options.spacing ?? 30);
  const chipHeight = Math.max(1, options.chipHeight ?? 5);
  const stacks: ChipStack[] = [];
  let remaining = total;
  let overflow = 0;
  for (const denomination of CHIP_DENOMINATIONS) {
    if (remaining < denomination.value) continue;
    const count = Math.floor(remaining / denomination.value);
    remaining -= count * denomination.value;
    let left = count;
    let stackIndex = 0;
    while (left > 0) {
      const inStack = Math.min(maxPerStack, left);
      left -= inStack;
      const offset = (stacks.length % 2 === 0 ? 1 : -1) * Math.floor(stacks.length / 2) * spacing;
      stacks.push({
        denomination,
        count: inStack,
        total: inStack * denomination.value,
        x: offset,
        y: -stackIndex * chipHeight,
        height: inStack * chipHeight,
      });
      stackIndex += 1;
      if (stackIndex > 6) {
        overflow += left;
        break;
      }
    }
  }
  return {
    amount: total,
    stacks,
    chipCount: stacks.reduce((sum, stack) => sum + stack.count, 0),
    overflow,
  };
}

/** Color de la ficha de mayor valor de una pila. */
export function dominantChipColor(layout: ChipStackLayout, fallback: string): string {
  return layout.stacks[0]?.denomination.color ?? fallback;
}
