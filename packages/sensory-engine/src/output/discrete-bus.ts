import type { AudioContextLike, AudioNodeLike, GainNodeLike } from '../audio/contracts.js';
import { clamp01 } from '../types.js';
import type { ChannelBank } from './channel-bank.js';
import type { InstrumentBus, InstrumentRoute, ResolvedOutputMode } from './types.js';

interface TargetGain {
  readonly index: number;
  readonly gain: number;
}

function panPair(pan: number): readonly [number, number] {
  const angle = ((Math.min(1, Math.max(-1, pan)) + 1) * Math.PI) / 4;
  return [Math.cos(angle), Math.sin(angle)];
}

function frontPair(pan: number, scale = 1): TargetGain[] {
  const [left, right] = panPair(pan);
  return [{ index: 0, gain: left * scale }, { index: 1, gain: right * scale }];
}

function targetGains(mode: ResolvedOutputMode, route: InstrumentRoute): TargetGain[] {
  const pan = route.pan ?? 0;
  if (route.target === 'center') {
    if (mode === '2.1') return frontPair(0, 0.82);
    return [{ index: 2, gain: 0.9 }];
  }
  if (route.target === 'lfe') {
    if (mode === '2.1') return [{ index: 2, gain: 0.95 }];
    return [{ index: 3, gain: 0.95 }];
  }
  if (route.target === 'surround') {
    return mode === '2.1' ? frontPair(pan, 0.85) : [{ index: 4, gain: pan < 0 ? 0.9 : 0.45 }, { index: 5, gain: pan < 0 ? 0.45 : 0.9 }];
  }
  if (route.target === 'rear') {
    if (mode === '7.1') return [{ index: 6, gain: pan < 0 ? 0.86 : 0.32 }, { index: 7, gain: pan < 0 ? 0.32 : 0.86 }];
    if (mode === '2.1') return frontPair(pan, 0.7);
    return [{ index: 4, gain: pan < 0 ? 0.72 : 0.3 }, { index: 5, gain: pan < 0 ? 0.3 : 0.72 }];
  }
  return frontPair(pan);
}

/** Bus de instrumento hacia canales discretos concretos, con envío de sala. */
export function createDiscreteBus(
  context: AudioContextLike,
  bank: ChannelBank,
  mode: ResolvedOutputMode,
  route: InstrumentRoute,
  reverbSend?: AudioNodeLike,
): InstrumentBus {
  const input = context.createGain();
  input.gain.value = Math.min(1, Math.max(0, route.gain ?? 0.9));
  const nodes: AudioNodeLike[] = [input];
  const targets = targetGains(mode, route);
  for (const target of targets) {
    const channel = bank.input(target.index);
    if (channel === undefined) continue;
    if (Math.abs(target.gain - 1) < 0.001) {
      input.connect(channel);
    } else {
      const trim: GainNodeLike = context.createGain();
      trim.gain.value = target.gain;
      input.connect(trim);
      trim.connect(channel);
      nodes.push(trim);
    }
  }
  if ((route.reverb ?? 0) > 0 && reverbSend !== undefined) {
    const send = context.createGain();
    send.gain.value = clamp01(route.reverb ?? 0);
    input.connect(send);
    send.connect(reverbSend);
    nodes.push(send);
  }
  return {
    input,
    route,
    dispose: () => {
      for (const node of nodes) {
        try {
          node.disconnect();
        } catch {
          // Nodo ya liberado.
        }
      }
    },
  };
}
