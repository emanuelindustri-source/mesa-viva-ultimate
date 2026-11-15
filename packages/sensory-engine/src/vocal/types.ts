export type VocalVowel = 'm' | 'u' | 'o';

export interface VocalNote {
  readonly midi: number;
  readonly when: number;
  readonly duration: number;
  readonly velocity: number;
  readonly vowel?: VocalVowel;
  readonly previousMidi?: number;
  readonly portamentoSeconds?: number;
  readonly vibratoCents?: number;
}

export interface FormantSpec {
  readonly frequency: number;
  readonly gain: number;
  readonly q: number;
}

export interface VocalVoice {
  readonly vowel: VocalVowel;
  readonly targetHz: number;
  readonly fromHz: number;
  readonly formants: readonly FormantSpec[];
  readonly endsAt: number;
  stop(when?: number): void;
}
