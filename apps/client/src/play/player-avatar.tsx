const SKIN = ['#f3c9a0', '#d9a273', '#a86d43', '#f7ddc2', '#8a5230'] as const;
const HAIR = ['#2c1a10', '#5a321c', '#1c1c24', '#8a5a2b', '#3a2013'] as const;
const SHIRT = ['#2c6e8f', '#8f2c46', '#2f7a4d', '#7a5a1c', '#4d3a8f'] as const;

export function PlayerAvatar({ seed, className = '' }: { seed: number; className?: string }) {
  const skin = SKIN[seed % SKIN.length] ?? SKIN[0];
  const hair = HAIR[(seed * 3 + 1) % HAIR.length] ?? HAIR[0];
  const shirt = SHIRT[(seed * 2 + 1) % SHIRT.length] ?? SHIRT[0];
  const variant = seed % 4;
  return (
    <span class={`retrato ${className}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" role="presentation">
        <defs>
          <linearGradient id={`pa-bg-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#f7e2b8" />
            <stop offset="1" stop-color="#c9a26a" />
          </linearGradient>
          <linearGradient id={`pa-shirt-${seed}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color={shirt} />
            <stop offset="1" stop-color="#1d2430" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill={`url(#pa-bg-${seed})`} />
        <circle cx="50" cy="112" r="52" fill={`url(#pa-shirt-${seed})`} />
        <rect x="43" y="56" width="14" height="16" rx="6" fill={skin} />
        <ellipse cx="50" cy="44" rx="23" ry="26" fill={skin} />
        {variant === 0 && <path d="M26 40 C28 16 72 16 74 40 C64 28 36 28 26 40 Z" fill={hair} />}
        {variant === 1 && <path d="M27 38 C24 14 76 12 75 40 C68 30 62 30 58 22 C50 32 34 30 27 38 Z" fill={hair} />}
        {variant === 2 && <path d="M26 44 C20 18 80 18 74 44 L70 60 C66 34 34 34 30 60 Z" fill={hair} />}
        {variant === 3 && <path d="M28 34 C34 10 66 10 72 34 C66 26 34 26 28 34 Z" fill={hair} />}
        <circle cx="41" cy="43" r="2.6" fill="#241a12" />
        <circle cx="59" cy="43" r="2.6" fill="#241a12" />
        <path d="M43 53 Q50 58 57 53" fill="none" stroke="#8a4a3a" stroke-width="2" stroke-linecap="round" />
        <circle cx="34" cy="50" r="4" fill="#e88a7a" opacity="0.35" />
        <circle cx="66" cy="50" r="4" fill="#e88a7a" opacity="0.35" />
        {seed % 3 === 0 && <path d="M34 24 L50 8 L66 24 L60 28 L50 20 L40 28 Z" fill="#f2c14e" stroke="#9a6c05" stroke-width="1.4" />}
        {seed % 3 === 1 && <path d="M28 26 Q50 10 72 26 L72 20 Q50 2 28 20 Z" fill="#c92f4b" />}
        {seed % 3 === 2 && <path d="M32 24 C40 18 60 18 68 24 L64 16 C56 10 44 10 36 16 Z" fill="#2f9e44" />}
      </svg>
    </span>
  );
}
