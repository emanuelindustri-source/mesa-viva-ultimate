import type { EffectId, FestivalId, OutputMode, PerformanceState } from '@mesa-viva/sensory-engine';
import { SENSORY_FESTIVALS, SENSORY_GESTURES, SENSORY_OUTPUTS, SENSORY_STATES } from './sensory-data.js';

interface SelectProps<T> {
  readonly selected: T;
  readonly onSelect: (value: T) => void;
}

export function OutputModes({ selected, onSelect }: SelectProps<OutputMode>) {
  return (
    <fieldset class="festivales">
      <legend class="lab__leyenda">Salida multicanal</legend>
      {SENSORY_OUTPUTS.map((choice) => (
        <button class={`festival ${selected === choice.id ? 'festival--activo' : ''}`} key={choice.id} type="button" aria-pressed={selected === choice.id} title={choice.detail} onClick={() => onSelect(choice.id)}>
          <span class="festival__punto" style={{ background: selected === choice.id ? '#c9a227' : '#5c5345' }} />
          {choice.label}
        </button>
      ))}
    </fieldset>
  );
}

export function StateModes({ selected, onSelect }: SelectProps<PerformanceState>) {
  return (
    <fieldset class="festivales">
      <legend class="lab__leyenda">Estado musical</legend>
      {SENSORY_STATES.map((choice) => (
        <button class={`festival ${selected === choice.id ? 'festival--activo' : ''}`} key={choice.id} type="button" aria-pressed={selected === choice.id} onClick={() => onSelect(choice.id)}>
          {choice.label}
        </button>
      ))}
    </fieldset>
  );
}

export function FestivalPicker({ selected, onSelect }: SelectProps<FestivalId>) {
  return (
    <fieldset class="festivales">
      <legend class="lab__leyenda">Festividad local</legend>
      {SENSORY_FESTIVALS.map((choice) => (
        <button class={`festival ${selected === choice.id ? 'festival--activo' : ''}`} key={choice.id} type="button" aria-pressed={selected === choice.id} onClick={() => onSelect(choice.id)}>
          <span class="festival__punto" style={{ background: choice.color }} />
          {choice.label}
        </button>
      ))}
    </fieldset>
  );
}

interface GestureProps {
  readonly onTrigger: (event: EffectId, label: string) => void;
  readonly onSparkle: () => void;
}

export function GestureButtons({ onTrigger, onSparkle }: GestureProps) {
  return (
    <fieldset class="gestos">
      <legend class="lab__leyenda">Probar gestos</legend>
      {SENSORY_GESTURES.map((gesture) => (
        <button class="gesto" key={gesture.event} type="button" onClick={() => onTrigger(gesture.event, gesture.label)}>
          <span aria-hidden="true">{gesture.icon}</span>
          {gesture.label}
        </button>
      ))}
      <button class="gesto" type="button" onClick={onSparkle}>✨ SFX armónico</button>
    </fieldset>
  );
}
