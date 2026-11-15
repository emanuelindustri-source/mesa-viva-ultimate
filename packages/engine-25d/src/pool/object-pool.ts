export interface PoolOptions<T> {
  readonly initial?: number;
  readonly max?: number;
  readonly create: () => T;
  readonly reset?: (item: T) => void;
  readonly destroy?: (item: T) => void;
}

export interface PoolStats {
  readonly created: number;
  readonly free: number;
  readonly inUse: number;
  readonly peakInUse: number;
  readonly acquires: number;
  readonly reuses: number;
  readonly releases: number;
  readonly rejected: number;
}

/**
 * Pool genérico sin asignaciones en el camino caliente. Reutilizar cartas,
 * fichas y partículas evita pausas del recolector en Android de gama media.
 */
export class ObjectPool<T> {
  private readonly createItem: () => T;
  private readonly resetItem: ((item: T) => void) | null;
  private readonly destroyItem: ((item: T) => void) | null;
  private readonly max: number;
  private readonly freeItems: T[] = [];
  private readonly liveItems = new Set<T>();
  private created = 0;
  private peak = 0;
  private acquires = 0;
  private reuses = 0;
  private releases = 0;
  private rejected = 0;

  constructor(options: PoolOptions<T>) {
    this.createItem = options.create;
    this.resetItem = options.reset ?? null;
    this.destroyItem = options.destroy ?? null;
    this.max = Math.max(1, options.max ?? 512);
    this.prewarm(options.initial ?? 0);
  }

  prewarm(count: number): void {
    const target = Math.min(this.max, Math.max(0, Math.floor(count)));
    while (this.created < target) {
      this.freeItems.push(this.createItem());
      this.created += 1;
    }
  }

  acquire(): T {
    this.acquires += 1;
    const reused = this.freeItems.pop();
    if (reused !== undefined) {
      this.reuses += 1;
      this.liveItems.add(reused);
      this.peak = Math.max(this.peak, this.liveItems.size);
      return reused;
    }
    if (this.created >= this.max) {
      this.rejected += 1;
      throw new Error(`El pool alcanzó su límite de ${this.max} objetos`);
    }
    const item = this.createItem();
    this.created += 1;
    this.liveItems.add(item);
    this.peak = Math.max(this.peak, this.liveItems.size);
    return item;
  }

  release(item: T): boolean {
    if (!this.liveItems.delete(item)) return false;
    this.releases += 1;
    if (this.resetItem !== null) this.resetItem(item);
    this.freeItems.push(item);
    return true;
  }

  clear(): void {
    if (this.destroyItem !== null) {
      for (const item of this.freeItems) this.destroyItem(item);
      for (const item of this.liveItems) this.destroyItem(item);
    }
    this.freeItems.length = 0;
    this.liveItems.clear();
    this.created = 0;
    this.peak = 0;
  }

  get size(): number {
    return this.created;
  }

  get stats(): PoolStats {
    return {
      created: this.created,
      free: this.freeItems.length,
      inUse: this.liveItems.size,
      peakInUse: this.peak,
      acquires: this.acquires,
      reuses: this.reuses,
      releases: this.releases,
      rejected: this.rejected,
    };
  }
}
