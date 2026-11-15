import type { CapacitorHapticsPlugin, CapacitorImpactStyle } from '../src/haptics/types.js';

export interface FakeHaptics {
  readonly plugin: CapacitorHapticsPlugin;
  readonly impacts: CapacitorImpactStyle[];
  readonly vibrations: number[];
  readonly notifications: string[];
  selections: number;
  readonly scheduled: (() => void)[];
  flush(): void;
}

export function fakeHaptics(): FakeHaptics {
  const impacts: CapacitorImpactStyle[] = [];
  const vibrations: number[] = [];
  const notifications: string[] = [];
  const scheduled: (() => void)[] = [];
  const state = { selections: 0 };
  const plugin: CapacitorHapticsPlugin = {
    impact: ({ style }) => {
      impacts.push(style);
    },
    vibrate: (options) => {
      vibrations.push(options?.duration ?? -1);
    },
    selectionChanged: () => {
      state.selections += 1;
    },
    notification: ({ type }) => {
      notifications.push(type);
    },
  };
  return {
    plugin,
    impacts,
    vibrations,
    notifications,
    get selections() {
      return state.selections;
    },
    scheduled,
    flush: () => {
      while (scheduled.length > 0) scheduled.shift()?.();
    },
  };
}

export interface FakeWebHaptics {
  readonly vibrate: (pattern: number | readonly number[]) => boolean;
  readonly calls: (number | readonly number[])[];
  accepted: boolean;
}

export function fakeWebHaptics(accepted = true): FakeWebHaptics {
  const calls: (number | readonly number[])[] = [];
  const result = {
    calls,
    accepted,
    vibrate: (pattern: number | readonly number[]) => {
      calls.push(pattern);
      return result.accepted;
    },
  };
  return result;
}
