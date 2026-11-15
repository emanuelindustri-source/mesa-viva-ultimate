import { ExternalLink } from 'lucide-react';
import { VERSION_NOTES } from '../content/version-notes.js';
import { REPO_URL } from '../content.js';

export function VersionHistory() {
  return (
    <div class="versiones-lista">
      {VERSION_NOTES.map((note) => (
        <article class="version-card" key={note.file}>
          <div>
            <span class="pastilla">v{note.version}</span>
            <h3>{note.title}</h3>
            <p>{note.summary}</p>
            <small>{note.date}</small>
          </div>
          <a class="enlace" href={`${REPO_URL}/blob/main/docs/versiones/${note.file}`} target="_blank" rel="noreferrer">
            Leer la nota <ExternalLink size={14} aria-hidden="true" />
          </a>
        </article>
      ))}
    </div>
  );
}
