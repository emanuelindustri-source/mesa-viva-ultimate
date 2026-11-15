export const FESTIVAL_IDS = [
  'navidad',
  'halloween',
  'reyes-magos',
  'san-patricio',
  'san-valentin',
  'carnaval',
  'semana-santa',
  'dia-inocentes',
  'dia-madre',
  'dia-padre',
  'dia-nino',
  'dia-hijo',
  'dia-familia',
  'dia-tierra',
  'dia-encuentro-dos-mundos',
  'dia-independencia',
  'vacaciones-verano',
  'vacaciones-invierno',
  'ano-bisiesto',
  'dia-normal',
] as const;

export type FestivalId = (typeof FESTIVAL_IDS)[number];

export const STEM_IDS = ['pulso', 'bajo', 'pad', 'arpegio', 'melodia', 'campanas', 'coro', 'acento'] as const;

export type StemId = (typeof STEM_IDS)[number];

export type MusicPhase = 'preparacion' | 'apuesta' | 'turno' | 'resolucion' | 'final';

export type AccentKind =
  | 'campanas'
  | 'tambor'
  | 'palmas'
  | 'castanuelas'
  | 'cuerdas'
  | 'coro'
  | 'cascabeles'
  | 'flauta'
  | 'marimba'
  | 'metal'
  | 'cascada'
  | 'viento'
  | 'fuegos'
  | 'ninguno';

export type InstrumentKind = 'campanas' | 'cuerdas' | 'flauta' | 'metal' | 'marimba' | 'coro' | 'sintetizador' | 'citara';

export interface FestivalProfile {
  readonly id: FestivalId;
  readonly musicId: string;
  readonly label: string;
  readonly rootMidi: number;
  readonly scale: readonly number[];
  readonly tempo: number;
  readonly swing: number;
  readonly density: number;
  readonly accent: AccentKind;
  readonly instrument: InstrumentKind;
  readonly color: string;
  readonly motif: string;
  readonly stemBias: Readonly<Partial<Record<StemId, number>>>;
}

export interface StemDefinition {
  readonly id: StemId;
  readonly label: string;
  readonly role: string;
  readonly low: number;
  readonly high: number;
  readonly floor: number;
  readonly wave: string;
  readonly octave: number;
}

export interface NoteEvent {
  readonly step: number;
  readonly degree: number;
  readonly octave: number;
  readonly durationSteps: number;
  readonly velocity: number;
}

export interface TensionInput {
  readonly phase?: MusicPhase;
  readonly round?: number;
  readonly totalRounds?: number;
  readonly scoreGap?: number;
  readonly maxScore?: number;
  readonly chipsAtStake?: number;
  readonly bankroll?: number;
  readonly cardsLeft?: number;
  readonly totalCards?: number;
  readonly humanTurn?: boolean;
  readonly decisive?: boolean;
  readonly pressure?: number;
}

export interface TensionSnapshot {
  readonly tension: number;
  readonly phase: MusicPhase;
  readonly label: string;
}

export interface MusicDirectorOptions {
  readonly seed?: number;
  readonly autoTick?: boolean;
  readonly tickMs?: number;
  readonly lookaheadSeconds?: number;
  readonly crossfadeSeconds?: number;
  readonly maxVoices?: number;
  readonly initialTension?: number;
  readonly festival?: FestivalId;
}

export interface MusicDirectorStatus {
  readonly running: boolean;
  readonly festival: FestivalId;
  readonly musicId: string;
  readonly tempo: number;
  readonly tension: number;
  readonly step: number;
  readonly bar: number;
  readonly activeVoices: number;
  readonly muted: boolean;
  readonly volume: number;
}
