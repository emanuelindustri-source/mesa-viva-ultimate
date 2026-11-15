import type { LayoutDefinition, OutputMode, OutputStatus, ResolvedOutputMode, SpeakerZone } from './types.js';

export const MODE_LAYOUTS: Readonly<Record<ResolvedOutputMode, LayoutDefinition>> = Object.freeze({
  binaural: { label: 'Binaural 2.0', channels: 2, zones: ['front-left', 'front-right'], subwoofers: 0, description: 'HRTF, ondas alpha/beta/theta y escena 3D para audífonos' },
  stereo: { label: 'Estéreo 2.0', channels: 2, zones: ['front-left', 'front-right'], subwoofers: 0, description: 'Mezcla frontal L/R con paneo clásico' },
  '2.1': { label: '2.1', channels: 3, zones: ['front-left', 'front-right', 'lfe'], subwoofers: 1, description: 'Frontales más subwoofer dedicado' },
  '5.1': { label: '5.1', channels: 6, zones: ['front-left', 'front-right', 'center', 'lfe', 'surround-left', 'surround-right'], subwoofers: 1, description: 'Seis canales discretos con central y LFE' },
  '5.2': { label: '5.2', channels: 6, zones: ['front-left', 'front-right', 'center', 'lfe', 'surround-left', 'surround-right'], subwoofers: 2, description: 'Dos subwoofers comparten el LFE dedicado' },
  '7.1': { label: '7.1', channels: 8, zones: ['front-left', 'front-right', 'center', 'lfe', 'surround-left', 'surround-right', 'rear-left', 'rear-right'], subwoofers: 1, description: 'Ocho canales con traseros para cuerdas y sala' },
});

const AUTO_ORDER: readonly ResolvedOutputMode[] = ['7.1', '5.1', '2.1', 'binaural'];

function highestSupported(maxChannelCount: number): ResolvedOutputMode {
  if (maxChannelCount >= 8) return '7.1';
  if (maxChannelCount >= 6) return '5.1';
  if (maxChannelCount >= 3) return '2.1';
  return 'binaural';
}

export function resolveOutputMode(requested: OutputMode, maxChannelCount: number): {
  readonly active: ResolvedOutputMode;
  readonly fallback: boolean;
  readonly maxChannelCount: number;
} {
  const max = Math.max(1, Math.floor(maxChannelCount));
  if (requested === 'auto') return { active: highestSupported(max), fallback: false, maxChannelCount: max };
  const definition = MODE_LAYOUTS[requested];
  if (definition.channels <= max) return { active: requested, fallback: false, maxChannelCount: max };
  const fallback = AUTO_ORDER.find((mode) => MODE_LAYOUTS[mode].channels <= max) ?? 'binaural';
  return { active: fallback, fallback: true, maxChannelCount: max };
}

export function outputStatus(requested: OutputMode, maxChannelCount: number): OutputStatus {
  const resolved = resolveOutputMode(requested, maxChannelCount);
  const definition = MODE_LAYOUTS[resolved.active];
  return {
    requested,
    active: resolved.active,
    label: definition.label,
    channels: definition.channels,
    maxChannelCount: resolved.maxChannelCount,
    fallback: resolved.fallback,
    binaural: resolved.active === 'binaural',
    description: definition.description,
  };
}

export function channelIndexForZone(mode: ResolvedOutputMode, zone: SpeakerZone): number {
  if (mode === 'binaural' || mode === 'stereo') {
    if (zone === 'front-left') return 0;
    if (zone === 'front-right') return 1;
    return -1;
  }
  if (zone === 'lfe-2') return 3;
  if (mode === '2.1') {
    if (zone === 'front-left') return 0;
    if (zone === 'front-right') return 1;
    if (zone === 'lfe') return 2;
    return -1;
  }
  if (mode === '5.1' || mode === '5.2') {
    const map: Partial<Record<SpeakerZone, number>> = {
      'front-left': 0, 'front-right': 1, center: 2, lfe: 3, 'surround-left': 4, 'surround-right': 5, 'rear-left': 4, 'rear-right': 5,
    };
    return map[zone] ?? -1;
  }
  const map: Partial<Record<SpeakerZone, number>> = {
    'front-left': 0, 'front-right': 1, center: 2, lfe: 3, 'surround-left': 4, 'surround-right': 5, 'rear-left': 6, 'rear-right': 7,
  };
  return map[zone] ?? -1;
}

export function zonePan(zone: SpeakerZone): number {
  switch (zone) {
    case 'front-left': return -0.62;
    case 'front-right': return 0.62;
    case 'surround-left': return -0.92;
    case 'surround-right': return 0.92;
    case 'rear-left': return -1;
    case 'rear-right': return 1;
    default: return 0;
  }
}

export function zonePosition(zone: SpeakerZone): { x: number; y: number; z: number } {
  switch (zone) {
    case 'front-left': return { x: -1.4, y: 0.3, z: -2.2 };
    case 'front-right': return { x: 1.4, y: 0.3, z: -2.2 };
    case 'center': return { x: 0, y: 0.25, z: -2.8 };
    case 'lfe': return { x: 0, y: 0.1, z: -1.6 };
    case 'lfe-2': return { x: 0, y: 0.1, z: -1.6 };
    case 'surround-left': return { x: -2.4, y: 0.4, z: 0.4 };
    case 'surround-right': return { x: 2.4, y: 0.4, z: 0.4 };
    case 'rear-left': return { x: -1.8, y: 0.5, z: 2.4 };
    case 'rear-right': return { x: 1.8, y: 0.5, z: 2.4 };
    default: return { x: 0, y: 0.3, z: -2 };
  }
}
