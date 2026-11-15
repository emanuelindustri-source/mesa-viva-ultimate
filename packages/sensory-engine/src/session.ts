import type { EffectId } from './audio/effect-sounds.js';
import { SpatialEffectPlayer } from './audio/effects.js';
import type { SpatialPoint } from './audio/params.js';
import { AudioRuntime } from './audio/runtime.js';
import { SpatialAudioEngine } from './audio/spatial.js';
import type { TableSpatialLayout } from './audio/spatial-layout.js';
import { SensoryBenchmark } from './bench.js';
import { sensoryEvent } from './events.js';
import { HapticEngine } from './haptics/engine.js';
import { AdaptiveMusicDirector } from './music/director.js';
import { deriveTension, tensionLabel } from './music/tension.js';
import type { FestivalId, MusicPhase, TensionInput, TensionSnapshot } from './music/types.js';
import { applySessionPreferences, buildSessionStatus } from './session-support.js';
import type { SensoryEvent, SensoryPlayResult, SensorySessionOptions, SensorySessionStatus } from './session-types.js';
import { mergePreferences, normalizePreferences, type SensoryPreferences, type Vec3 } from './types.js';

/** Fachada de audio 3D, director musical, háptica y preferencias; nunca lanza errores. */
export class SensorySession {
  private readonly runtime: AudioRuntime;
  private readonly haptics: HapticEngine;
  private readonly spatial: SpatialAudioEngine;
  private readonly effects: SpatialEffectPlayer;
  private readonly director: AdaptiveMusicDirector;
  private readonly bench = new SensoryBenchmark();
  private readonly now: () => number;
  private readonly shakeAction: 'dados' | 'barajar';
  private preferences: SensoryPreferences;
  private lastTension: TensionSnapshot;
  private faceDown = false;
  private disposed = false;

  constructor(options: SensorySessionOptions = {}) {
    this.preferences = normalizePreferences(options.preferences);
    this.now = options.now ?? (() => Date.now());
    this.shakeAction = options.shakeAction ?? 'dados';
    this.runtime = options.runtime ?? new AudioRuntime();
    this.haptics = options.haptics ?? new HapticEngine({ enabled: this.preferences.hapticsEnabled, reducedMotion: this.preferences.reducedMotion, intensity: this.preferences.hapticsIntensity });
    this.spatial = new SpatialAudioEngine(this.runtime, options.maxHrtfVoices !== undefined ? { maxHrtfVoices: options.maxHrtfVoices } : {});
    this.effects = new SpatialEffectPlayer(this.runtime, this.spatial, options.seed ?? 11);
    this.director = new AdaptiveMusicDirector(this.runtime, {
      seed: options.seed ?? 29, autoTick: options.autoTick ?? true, maxVoices: options.maxVoices ?? 28,
      festival: options.festival ?? 'dia-normal', initialTension: 0.18,
    });
    this.lastTension = deriveTension({ phase: 'preparacion' });
  }

  get status(): SensorySessionStatus {
    return buildSessionStatus({
      audio: this.runtime.status,
      spatial: this.spatial.stats,
      director: this.director,
      haptics: this.haptics,
      effects: this.effects.stats,
      preferences: this.preferences,
      faceDown: this.faceDown,
      tension: this.lastTension,
    });
  }

  get metrics() {
    return this.bench.report();
  }

  get tension(): TensionSnapshot {
    return this.lastTension;
  }

  async unlock() {
    const started = this.now();
    const status = await this.runtime.unlock();
    if (this.runtime.isReady) {
      this.spatial.setListener({ x: 0, y: 0.65, z: 6.5 }, { x: 0, y: -0.08, z: -1 });
      applySessionPreferences({
        graph: this.runtime.graph,
        director: this.director,
        haptics: this.haptics,
        preferences: this.preferences,
        faceDown: this.faceDown,
      });
      this.director.start();
      this.director.setMuted(this.preferences.muted || this.faceDown);
    }
    this.bench.note('unlock', started, this.now(), 0);
    return status;
  }

  play(input: EffectId | SensoryEvent): SensoryPlayResult | null {
    if (this.disposed) return null;
    const event: SensoryEvent = typeof input === 'string' ? { type: input } : input;
    const definition = sensoryEvent(event.type);
    const silenced = this.faceDown && this.preferences.silentWhenFaceDown;
    const started = this.now();
    const effect = silenced || this.preferences.muted
      ? null
      : this.effects.play(event.type, {
        position: event.position ?? null,
        sourceId: event.sourceId ?? null,
        volume: event.volume ?? 1,
      });
    const haptic = silenced ? null : this.haptics.play(definition.haptic);
    const latency = this.now() - started;
    this.bench.note(event.type, started, this.now(), this.effects.stats.activeVoices);
    return { event: event.type, effect, haptic, latencyMs: latency };
  }

  /** Agitar lanza dados o baraja según el juego; nunca bloquea la partida. */
  onShake(intensity: number, action: 'dados' | 'barajar' = this.shakeAction): SensoryPlayResult | null {
    if (!Number.isFinite(intensity) || intensity < 0.12) return null;
    return this.play(action === 'dados' ? 'dados-lanzar' : 'barajar');
  }

  /** Boca abajo silencia audio y háptica sin pausar reglas ni turnos. */
  onFaceDown(down: boolean): void {
    if (this.faceDown === down) return;
    this.faceDown = down;
    const silence = down && this.preferences.silentWhenFaceDown;
    this.runtime.graph?.setMuted(silence || this.preferences.muted);
    this.director.setMuted(silence || this.preferences.muted);
    this.haptics.configure({ silent: silence });
    if (down && silence) this.haptics.play('silencio');
  }

  setFestival(id: FestivalId): void {
    this.director.setFestival(id);
  }

  setTension(input: number | TensionInput): TensionSnapshot {
    if (typeof input === 'number') {
      const value = Math.min(1, Math.max(0, input));
      this.director.setTension(value);
      this.lastTension = { tension: value, phase: this.lastTension.phase, label: tensionLabel(value) };
      return this.lastTension;
    }
    const snapshot = deriveTension(input);
    this.director.setTension(snapshot.tension);
    if (input.phase !== undefined) this.director.setPhase(input.phase);
    this.lastTension = snapshot;
    return snapshot;
  }

  setPhase(phase: MusicPhase): void {
    this.director.setPhase(phase);
    this.lastTension = { ...this.lastTension, phase };
  }

  setPreferences(patch: Partial<SensoryPreferences>): SensoryPreferences {
    this.preferences = mergePreferences(this.preferences, patch);
    applySessionPreferences({
      graph: this.runtime.graph,
      director: this.director,
      haptics: this.haptics,
      preferences: this.preferences,
      faceDown: this.faceDown,
    });
    return this.preferences;
  }

  setMuted(muted: boolean): void {
    this.setPreferences({ muted });
  }

  setLayout(layout: TableSpatialLayout): void {
    for (const seat of layout.seats) this.spatial.attach(seat.id, 'asiento', seat.position);
    for (const card of layout.cards) this.spatial.attach(card.id, 'carta', card.position);
    const first = layout.seats[0];
    if (first !== undefined) this.spatial.setListenerFromSeat(first.position);
  }

  moveCard(id: string, position: Vec3, fadeSeconds = 0.08): void {
    this.spatial.updateSource(id, position, fadeSeconds);
  }

  attachSeat(id: string, position: SpatialPoint): void {
    this.spatial.attach(id, 'asiento', position);
  }

  attachCard(id: string, position: SpatialPoint): void {
    this.spatial.attach(id, 'carta', position);
  }

  celebrate(kind: 'victoria' | 'derrota' = 'victoria'): SensoryPlayResult | null {
    this.director.setPhase('final');
    this.setTension({ phase: 'final', decisive: true, pressure: 1 });
    return this.play(kind === 'victoria' ? 'celebracion' : 'derrota');
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    this.effects.dispose();
    this.director.dispose();
    this.spatial.dispose();
    this.haptics.dispose();
    await this.runtime.dispose();
  }
}
