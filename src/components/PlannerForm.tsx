import type { ReactNode } from 'react';
import type { CountryData } from '../data/types';
import type { PlannerInput } from '../lib/itinerary';
import { IconCalendarDays, IconCompass, IconPalm, IconRoad } from './icons';

interface Props {
  country: CountryData;
  value: PlannerInput;
  onChange: (next: PlannerInput) => void;
}

export function PlannerForm({ country, value, onChange }: Props) {
  const nonHubCities = country.cities.filter((c) => c.id !== country.hubCityId);
  const priorityCity = country.cities.find((c) => c.id === value.priorityCityId);
  const maxPriorityNights = Math.max(1, value.totalDays - 1);
  const hub = country.cities.find((c) => c.id === country.hubCityId)!;

  const toggleOtherCity = (id: string) => {
    const isOn = value.otherCityIds.includes(id);
    onChange({
      ...value,
      otherCityIds: isOn ? value.otherCityIds.filter((x) => x !== id) : [...value.otherCityIds, id],
    });
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <FieldLabel icon={<IconCalendarDays className="h-5 w-5" />} htmlFor="days" text="Días totales de viaje" />
      <input
        id="days"
        type="number"
        min={3}
        max={21}
        value={value.totalDays}
        onChange={(e) => onChange({ ...value, totalDays: Number(e.target.value) })}
        className={inputCls}
      />

      <div>
        <FieldLabel icon={<IconPalm className="h-5 w-5" />} htmlFor="priority" text="Lo que no te quieres perder" />
        <select
          id="priority"
          value={value.priorityCityId}
          onChange={(e) => onChange({ ...value, priorityCityId: e.target.value })}
          className={inputCls}
        >
          {nonHubCities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label htmlFor="priority-days" className="mt-3 block text-sm text-ink-soft">
          Días para dedicarle a {priorityCity?.name}
        </label>
        <input
          id="priority-days"
          type="number"
          min={1}
          max={maxPriorityNights}
          value={value.priorityDays}
          onChange={(e) => onChange({ ...value, priorityDays: Number(e.target.value) })}
          className={`${inputCls} mt-1`}
        />
      </div>

      <div>
        <FieldLabel icon={<IconCompass className="h-5 w-5" />} text="Otros lugares, si el tiempo alcanza" />
        <div className="flex flex-wrap gap-2">
          {nonHubCities
            .filter((c) => c.id !== value.priorityCityId)
            .map((c) => {
              const active = value.otherCityIds.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleOtherCity(c.id)}
                  aria-pressed={active}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-150 ${
                    active
                      ? 'border-olive bg-olive text-paper font-medium'
                      : 'border-paper-line bg-paper text-ink-soft hover:border-olive-light hover:text-ink'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-dashed border-paper-line pt-4">
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={value.firstNightAtHub}
            onChange={(e) => onChange({ ...value, firstNightAtHub: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-terracotta"
          />
          Dormir en {hub.name} la primera noche (llegada)
        </label>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={value.lastNightAtHub}
            onChange={(e) => onChange({ ...value, lastNightAtHub: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-terracotta"
          />
          Volver a {hub.name} la última noche (vuelo temprano)
        </label>
      </div>

      <div>
        <FieldLabel icon={<IconRoad className="h-5 w-5" />} htmlFor="maxdrive" text="Máx. horas de manejo por día" />
        <input
          id="maxdrive"
          type="number"
          min={1}
          max={8}
          step={0.5}
          value={value.maxDriveHours}
          onChange={(e) => onChange({ ...value, maxDriveHours: Number(e.target.value) })}
          className={inputCls}
        />
      </div>
    </form>
  );
}

const inputCls =
  'w-full rounded-2xl border border-paper-line bg-paper px-4 py-2.5 text-ink shadow-sm outline-none transition-colors focus:border-terracotta focus:ring-2 focus:ring-terracotta/25';

function FieldLabel({ icon, text, htmlFor }: { icon: ReactNode; text: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-soft">
      <span className="text-terracotta">{icon}</span>
      {text}
    </label>
  );
}
