import { describe, expect, it } from 'vitest';
import { VERSION_NOTES } from './version-notes.js';

describe('historial de versiones del portal', () => {
  it('lee las notas reales de docs/versiones y las ordena de nueva a vieja', () => {
    expect(VERSION_NOTES.length).toBeGreaterThanOrEqual(7);
    expect(VERSION_NOTES[0]?.version).toBe('0.7.0');
    expect(VERSION_NOTES.every((note) => note.file.endsWith('.md'))).toBe(true);
    expect(VERSION_NOTES.every((note) => note.summary.length > 0)).toBe(true);
    expect(VERSION_NOTES.some((note) => note.title.includes('Fase 5'))).toBe(true);
  });
});
