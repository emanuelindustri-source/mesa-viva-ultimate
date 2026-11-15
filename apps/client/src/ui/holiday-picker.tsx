import { HOLIDAY_IDS, type HolidayId, holidayLabelKey } from '@mesa-viva/design-system';
import { updateSettings } from './settings.js';
import { useI18n } from './use-i18n.js';
import { useSettings } from './use-settings.js';

export function HolidayPicker() {
  const { holiday } = useSettings();
  const { t } = useI18n();
  return (
    <label class="selector-festividad">
      <span class="solo-lector">Festividad</span>
      <select value={holiday} onChange={(event) => updateSettings({ holiday: event.currentTarget.value as HolidayId | 'auto' })}>
        <option value="auto">Festividad automática</option>
        {HOLIDAY_IDS.map((id) => <option key={id} value={id}>{t(holidayLabelKey(id))}</option>)}
      </select>
    </label>
  );
}
