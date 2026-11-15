const MODULES = import.meta.glob('../../../docs/versiones/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface VersionNote {
  readonly file: string;
  readonly version: string;
  readonly title: string;
  readonly date: string;
  readonly summary: string;
}

function parse(file: string, source: string): VersionNote | null {
  const name = file.split('/').at(-1) ?? '';
  const match = /^v(\d+\.\d+\.\d+)-(.+)\.md$/.exec(name);
  if (match === null) return null;
  const title = source.match(/^#\s+(.+)$/m)?.[1] ?? name;
  const date = source.match(/\*\*Fecha:\*\*\s*(.+)/)?.[1]?.trim() ?? '';
  const body = source
    .replace(/^#.*$/m, '')
    .replace(/\*\*Fecha:\*\*.*$/m, '')
    .replace(/\*\*Estado:\*\*.*$/m, '')
    .replace(/\*\*Tipo:\*\*.*$/m, '')
    .replace(/^---$/gm, '')
    .replace(/^##.*$/gm, '')
    .trim();
  const summary = body.split(/\n\s*\n/).find((paragraph) => paragraph.trim().length > 40)?.replaceAll('\n', ' ').slice(0, 260) ?? '';
  return { file: name, version: match[1] ?? '', title: title.replace(/^v[\d.]+\s*[—-]\s*/, ''), date, summary };
}

export const VERSION_NOTES: readonly VersionNote[] = Object.values(MODULES)
  .map((source, index) => parse(Object.keys(MODULES)[index] ?? '', source))
  .filter((note): note is VersionNote => note !== null)
  .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
