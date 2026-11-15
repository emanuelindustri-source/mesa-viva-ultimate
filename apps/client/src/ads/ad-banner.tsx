import { Crown, Sparkles } from 'lucide-react';

interface AdBannerProps {
  readonly vip: boolean;
  readonly consent: 'unknown' | 'granted' | 'denied';
  readonly onUpgrade: () => void;
}

export function AdBanner({ vip, consent, onUpgrade }: AdBannerProps) {
  if (vip) {
    return <div class="anuncio-banner anuncio-banner--vip"><Crown size={18} /><span>Modo VIP: sin anuncios y con temas exclusivos.</span></div>;
  }
  if (consent !== 'granted') return null;
  return (
    <button class="anuncio-banner" type="button" onClick={onUpgrade}>
      <Sparkles size={18} aria-hidden="true" />
      <span><strong>Quitar anuncios</strong> · Compra única VIP + temas</span>
      <span class="pastilla">Ver</span>
    </button>
  );
}
