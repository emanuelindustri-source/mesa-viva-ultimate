import { MessageCircle, Send, X } from 'lucide-react';
import { useState } from 'preact/hooks';

const EMOJIS = ['😀', '😂', '😮', '😎', '🔥', '👏', '🍀', '💪', '🎉', '😭', '🤝', '🃏'] as const;

interface ChatDockProps {
  readonly open: boolean;
  readonly onToggle: () => void;
  readonly onSend: (message: string) => void;
}

/** Chat rápido con emojis para la mesa; los globos salen sobre el asiento. */
export function ChatDock({ open, onToggle, onSend }: ChatDockProps) {
  const [text, setText] = useState('');
  const send = (message: string): void => {
    const clean = message.trim().slice(0, 80);
    if (clean.length === 0) return;
    onSend(clean);
    setText('');
  };
  return (
    <div class={`chat-mesa ${open ? 'chat-mesa--abierto' : ''}`}>
      <button class="boton-hud boton-hud--chat" type="button" onClick={onToggle} aria-label={open ? 'Cerrar chat' : 'Abrir chat'} aria-expanded={open}>
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
      {open && (
        <div class="chat-mesa__panel">
          <header><strong>Chat de mesa</strong><small>Rápido y con emojis</small></header>
          <div class="chat-mesa__emojis">
            {EMOJIS.map((emoji) => <button type="button" key={emoji} onClick={() => send(emoji)} aria-label={`Enviar ${emoji}`}>{emoji}</button>)}
          </div>
          <form class="chat-mesa__form" onSubmit={(event) => { event.preventDefault(); send(text); }}>
            <input value={text} onInput={(event) => setText(event.currentTarget.value)} placeholder="Escribe a la mesa…" maxLength={80} aria-label="Mensaje de chat" />
            <button type="submit" aria-label="Enviar mensaje"><Send size={17} /></button>
          </form>
        </div>
      )}
    </div>
  );
}
