export interface TelemetryEvent {
  readonly name: string;
  readonly at: number;
  readonly props?: Readonly<Record<string, string | number | boolean>>;
}

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean }>;

const STORAGE_KEY = 'mesa-viva:telemetry:queue';
const MAX_EVENTS = 200;

/** Cola offline de telemetría técnica; no envía nada sin endpoint configurado. */
export class TelemetryService {
  private readonly endpoint: string | null;
  private readonly now: () => number;
  private queue: TelemetryEvent[];

  constructor(endpoint: string | null = null, now: () => number = () => Date.now()) {
    this.endpoint = endpoint !== null && endpoint.trim().length > 0 ? endpoint : null;
    this.now = now;
    this.queue = this.read();
  }

  get size(): number {
    return this.queue.length;
  }

  track(name: string, props?: TelemetryEvent['props']): void {
    const event: TelemetryEvent = { name, at: this.now(), ...(props !== undefined ? { props } : {}) };
    this.queue.push(event);
    if (this.queue.length > MAX_EVENTS) this.queue = this.queue.slice(-MAX_EVENTS);
    this.write();
  }

  async flush(fetchImpl: FetchLike | null = (typeof globalThis.fetch === 'function' ? globalThis.fetch as unknown as FetchLike : null)): Promise<boolean> {
    if (this.endpoint === null || fetchImpl === null || this.queue.length === 0) return false;
    const batch = [...this.queue];
    try {
      const response = await fetchImpl(this.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      });
      if (!response.ok) return false;
      this.queue = this.queue.slice(batch.length);
      this.write();
      return true;
    } catch {
      return false;
    }
  }

  drain(): readonly TelemetryEvent[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
    this.write();
  }

  private read(): TelemetryEvent[] {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      const parsed = raw === null || raw === undefined ? [] : JSON.parse(raw) as TelemetryEvent[];
      return Array.isArray(parsed) ? parsed.slice(-MAX_EVENTS) : [];
    } catch {
      return [];
    }
  }

  private write(): void {
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Sin almacenamiento, la cola vive en memoria.
    }
  }
}

export const telemetry = new TelemetryService();
