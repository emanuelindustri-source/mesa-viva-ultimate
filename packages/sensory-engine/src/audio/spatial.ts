import { clamp } from '../types.js';
import type { GainNodeLike, PannerNodeLike, StereoPannerNodeLike } from './contracts.js';
import type { AudioBusName } from './graph.js';
import { createHrtfPanner, stereoPan, writeListener, writePannerPosition } from './panner.js';
import { rampSignedParam, type SpatialPoint } from './params.js';
import type { AudioRuntime } from './runtime.js';

export type SpatialSourceKind = 'asiento' | 'carta' | 'ficha' | 'centro';

export interface SpatialSource {
  readonly id: string;
  readonly kind: SpatialSourceKind;
  readonly position: SpatialPoint;
}

export type SpatialMode = 'hrtf' | 'estereo' | 'mono';

export interface SpatialOutput {
  readonly input: GainNodeLike;
  readonly mode: SpatialMode;
  readonly sourceId: string | null;
  move(position: SpatialPoint, fadeSeconds?: number): void;
  dispose(): void;
}

export interface SpatialOutputOptions {
  readonly position?: SpatialPoint | null;
  readonly sourceId?: string | null;
  readonly volume?: number;
  readonly bus?: AudioBusName;
}

export interface SpatialAudioOptions {
  readonly hrtfEnabled?: boolean;
  readonly maxHrtfVoices?: number;
  readonly panRange?: number;
  readonly refDistance?: number;
  readonly maxDistance?: number;
  readonly rolloffFactor?: number;
}

export interface SpatialStats {
  readonly activeOutputs: number;
  readonly activeHrtf: number;
  readonly attachedSources: number;
  readonly hrtfEnabled: boolean;
}

/** Audio 3D atado a asientos, cartas y fichas; degrada de HRTF a estéreo. */
export class SpatialAudioEngine {
  private readonly runtime: AudioRuntime;
  private readonly sources = new Map<string, SpatialSource>();
  private readonly outputs = new Set<SpatialOutput>();
  private readonly pannerConfig: { refDistance: number; maxDistance: number; rolloffFactor: number };
  private readonly maxHrtfVoices: number;
  private readonly panRange: number;
  private hrtf: boolean;
  private activeHrtf = 0;
  private disposed = false;

  constructor(runtime: AudioRuntime, options: SpatialAudioOptions = {}) {
    this.runtime = runtime;
    this.hrtf = options.hrtfEnabled ?? true;
    this.maxHrtfVoices = Math.max(1, options.maxHrtfVoices ?? 8);
    this.panRange = Math.max(1, options.panRange ?? 5);
    this.pannerConfig = {
      refDistance: options.refDistance ?? 1.4,
      maxDistance: options.maxDistance ?? 16,
      rolloffFactor: options.rolloffFactor ?? 1.1,
    };
  }

  get stats(): SpatialStats {
    return {
      activeOutputs: this.outputs.size,
      activeHrtf: this.activeHrtf,
      attachedSources: this.sources.size,
      hrtfEnabled: this.hrtf,
    };
  }

  setHrtfEnabled(enabled: boolean): void {
    this.hrtf = enabled;
  }

  attach(id: string, kind: SpatialSourceKind, position: SpatialPoint): void {
    this.sources.set(id, { id, kind, position });
    this.moveLiveSource(id, position, 0);
  }

  updateSource(id: string, position: SpatialPoint, fadeSeconds = 0.08): void {
    const current = this.sources.get(id);
    if (current === undefined) return;
    this.sources.set(id, { ...current, position });
    this.moveLiveSource(id, position, fadeSeconds);
  }

  detach(id: string): void {
    this.sources.delete(id);
  }

  source(id: string): SpatialSource | null {
    return this.sources.get(id) ?? null;
  }

  /** Orienta al oyente en el asiento; la mesa queda al frente. */
  setListener(position: SpatialPoint, forward: SpatialPoint, up: SpatialPoint = { x: 0, y: 1, z: 0 }): void {
    const context = this.runtime.context;
    if (context === null) return;
    writeListener(context.listener, position, forward, up, context.currentTime);
  }

  setListenerFromSeat(position: SpatialPoint): void {
    this.setListener(position, { x: -position.x, y: -0.35, z: -position.z });
  }

  /** Crea la salida de una voz; devuelve null si el audio aún no se desbloqueó. */
  createOutput(options: SpatialOutputOptions = {}): SpatialOutput | null {
    if (this.disposed) return null;
    const context = this.runtime.context;
    const graph = this.runtime.graph;
    if (context === null || graph === null) return null;
    const position = options.position ?? (options.sourceId != null ? this.sources.get(options.sourceId)?.position ?? null : null);
    const gain = context.createGain();
    gain.gain.value = clamp(options.volume ?? 1, 0, 4);
    const bus = graph.bus(options.bus ?? 'effects');
    const sourceId = options.sourceId ?? null;
    let panner: PannerNodeLike | null = null;
    let stereo: StereoPannerNodeLike | null = null;
    let mode: SpatialMode = 'mono';

    if (position !== null && this.hrtf && this.activeHrtf < this.maxHrtfVoices) {
      try {
        panner = createHrtfPanner(context, position, this.pannerConfig);
        panner.connect(bus);
        gain.connect(panner);
        this.activeHrtf += 1;
        mode = 'hrtf';
      } catch {
        panner = null;
      }
    }
    if (panner === null && position !== null) {
      try {
        stereo = context.createStereoPanner();
        stereo.pan.value = stereoPan(position, this.panRange);
        stereo.connect(bus);
        gain.connect(stereo);
        mode = 'estereo';
      } catch {
        stereo = null;
      }
    }
    if (panner === null && stereo === null) {
      gain.connect(bus);
      mode = 'mono';
    }

    let released = false;
    const output: SpatialOutput = {
      input: gain,
      mode,
      sourceId,
      move: (next, fadeSeconds = 0.08) => {
        const time = context.currentTime;
        if (panner !== null) writePannerPosition(panner, next, time, fadeSeconds);
        else if (stereo !== null) rampSignedParam(stereo.pan, stereoPan(next, this.panRange), time, fadeSeconds);
      },
      dispose: () => {
        if (released) return;
        released = true;
        this.outputs.delete(output);
        try {
          gain.disconnect();
          panner?.disconnect();
          stereo?.disconnect();
        } catch {
          // Nodos ya desconectados por el navegador.
        }
        if (panner !== null) this.activeHrtf = Math.max(0, this.activeHrtf - 1);
      },
    };
    this.outputs.add(output);
    return output;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const output of [...this.outputs]) output.dispose();
    this.outputs.clear();
    this.sources.clear();
  }

  private moveLiveSource(id: string, position: SpatialPoint, fadeSeconds: number): void {
    for (const output of this.outputs) {
      if (output.sourceId === id) output.move(position, fadeSeconds);
    }
  }
}
