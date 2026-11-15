import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const SOURCE = fileURLToPath(new URL('../src', import.meta.url));
const FILES = walk(SOURCE);

describe('presupuesto del paquete sensorial', () => {
  it('no incluye audio externo ni binarios licenciados', () => {
    const binaries = FILES.filter((file) => ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'].includes(extname(file)));
    expect(binaries).toEqual([]);
  });

  it('mantiene cada archivo por debajo de 200 líneas', () => {
    for (const file of FILES) {
      const lines = readFileSync(file, 'utf8').trimEnd().split('\n').length;
      expect(lines, file).toBeLessThanOrEqual(200);
    }
  });

  it('pesa mucho menos que el límite de 10 MB', () => {
    const bytes = FILES.reduce((sum, file) => sum + statSync(file).size, 0);
    expect(bytes).toBeGreaterThan(10_000);
    expect(bytes).toBeLessThan(500_000);
    expect(FILES.filter((file) => extname(file) === '.ts').length).toBeGreaterThan(20);
  });
});
