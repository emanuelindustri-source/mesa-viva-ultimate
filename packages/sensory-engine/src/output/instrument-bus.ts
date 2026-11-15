import type { AudioContextLike, AudioNodeLike, PannerNodeLike, StereoPannerNodeLike } from '../audio/contracts.js';
import { setSignedParam } from '../audio/params.js';
import { clamp01 } from '../types.js';
import { zonePosition } from './layouts.js';
import type { InstrumentBus, InstrumentRoute, ResolvedOutputMode } from './types.js';

function targetPosition(route: InstrumentRoute): { x: number; y: number; z: number } {
  const pan = Math.min(1, Math.max(-1, route.pan ?? 0));
  if (route.target === 'center') return zonePosition('center');
  if (route.target === 'lfe') return zonePosition('lfe');
  if (route.target === 'surround') return pan < 0 ? zonePosition('surround-left') : zonePosition('surround-right');
  if (route.target === 'rear') return pan < 0 ? zonePosition('rear-left') : zonePosition('rear-right');
  return pan < 0 ? zonePosition('front-left') : zonePosition('front-right');
}

function makePanner(context: AudioContextLike, route: InstrumentRoute): PannerNodeLike {
  const panner = context.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1.2;
  panner.maxDistance = 14;
  panner.rolloffFactor = 1.1;
  const position = targetPosition(route);
  setSignedParam(panner.positionX, position.x, context.currentTime);
  setSignedParam(panner.positionY, position.y, context.currentTime);
  setSignedParam(panner.positionZ, position.z, context.currentTime);
  return panner;
}

export function createBinauralBus(
  context: AudioContextLike,
  destination: AudioNodeLike,
  route: InstrumentRoute,
  reverbSend?: AudioNodeLike,
): InstrumentBus {
  const input = context.createGain();
  input.gain.value = Math.min(1, Math.max(0, route.gain ?? 0.9));
  const panner = makePanner(context, route);
  if (route.target === 'lfe') {
    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 118;
    lowpass.Q.value = 0.7;
    input.connect(lowpass);
    lowpass.connect(panner);
  } else {
    input.connect(panner);
  }
  panner.connect(destination);
  if ((route.reverb ?? 0) > 0 && reverbSend !== undefined) {
    const send = context.createGain();
    send.gain.value = clamp01(route.reverb ?? 0);
    input.connect(send);
    send.connect(reverbSend);
  }
  return {
    input,
    route,
    dispose: () => {
      for (const node of [input, panner]) {
        try {
          node.disconnect();
        } catch {
          // Nodo ya liberado.
        }
      }
    },
  };
}

export function createStereoBus(
  context: AudioContextLike,
  destination: AudioNodeLike,
  route: InstrumentRoute,
  reverbSend?: AudioNodeLike,
): InstrumentBus {
  const input = context.createGain();
  input.gain.value = Math.min(1, Math.max(0, route.gain ?? 0.9));
  const panner: StereoPannerNodeLike = context.createStereoPanner();
  panner.pan.value = Math.min(1, Math.max(-1, route.pan ?? 0));
  if (route.target === 'lfe') {
    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 118;
    input.connect(lowpass);
    lowpass.connect(panner);
  } else {
    input.connect(panner);
  }
  panner.connect(destination);
  if ((route.reverb ?? 0) > 0 && reverbSend !== undefined) {
    const send = context.createGain();
    send.gain.value = clamp01(route.reverb ?? 0);
    input.connect(send);
    send.connect(reverbSend);
  }
  return {
    input,
    route,
    dispose: () => {
      for (const node of [input, panner]) {
        try {
          node.disconnect();
        } catch {
          // Nodo ya liberado.
        }
      }
    },
  };
}

export type { ResolvedOutputMode };
