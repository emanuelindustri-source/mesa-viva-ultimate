interface SliderProps {
  readonly label: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly icon?: string;
  readonly min?: string;
}

export function Slider({ label, value, onChange, icon, min }: SliderProps) {
  const percent = Math.round(value * 100);
  return (
    <label class="mezclador__fila">
      <span class="mezclador__etiqueta">{icon !== undefined && <span aria-hidden="true">{icon}</span>}{label}</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        aria-valuetext={`${percent} por ciento`}
        style={min === undefined ? undefined : { accentColor: min }}
        onInput={(event) => onChange(Number(event.currentTarget.value))}
      />
      <strong>{percent}%</strong>
    </label>
  );
}
