import type { CountryData } from '../data/types';
import type { PlannerInput } from '../lib/itinerary';

interface Props {
  country: CountryData;
  value: PlannerInput;
  onChange: (next: PlannerInput) => void;
}

export function PlannerForm({ country, value, onChange }: Props) {
  const nonHubCities = country.cities.filter((c) => c.id !== country.hubCityId);
  const priorityCity = country.cities.find((c) => c.id === value.priorityCityId);
  const maxPriorityNights = Math.max(1, value.totalDays - 1);

  const toggleOtherCity = (id: string) => {
    const isOn = value.otherCityIds.includes(id);
    onChange({
      ...value,
      otherCityIds: isOn ? value.otherCityIds.filter((x) => x !== id) : [...value.otherCityIds, id],
    });
  };

  return (
    <form className="planner-form" onSubmit={(e) => e.preventDefault()}>
      <div className="field-row">
        <label>
          <span>País</span>
          <select value={country.id} disabled>
            <option value={country.id}>{country.name}</option>
          </select>
          <small>Más países próximamente — la estructura de datos ya está lista para agregarlos.</small>
        </label>

        <label>
          <span>Días totales de viaje</span>
          <input
            type="number"
            min={3}
            max={21}
            value={value.totalDays}
            onChange={(e) => onChange({ ...value, totalDays: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="field-row">
        <label>
          <span>Lo que no te quieres perder</span>
          <select
            value={value.priorityCityId}
            onChange={(e) => onChange({ ...value, priorityCityId: e.target.value })}
          >
            {country.cities
              .filter((c) => c.id !== country.hubCityId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>

        <label>
          <span>Días que quieres dedicarle a {priorityCity?.name}</span>
          <input
            type="number"
            min={1}
            max={maxPriorityNights}
            value={value.priorityDays}
            onChange={(e) => onChange({ ...value, priorityDays: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="field-group">
        <span className="field-group__label">Otros lugares que te gustaría conocer si el tiempo alcanza</span>
        <div className="chip-grid">
          {nonHubCities
            .filter((c) => c.id !== value.priorityCityId)
            .map((c) => (
              <button
                type="button"
                key={c.id}
                className={`chip ${value.otherCityIds.includes(c.id) ? 'chip--active' : ''}`}
                onClick={() => toggleOtherCity(c.id)}
              >
                {c.name}
              </button>
            ))}
        </div>
      </div>

      <div className="field-row">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={value.firstNightAtHub}
            onChange={(e) => onChange({ ...value, firstNightAtHub: e.target.checked })}
          />
          <span>Dormir en {country.cities.find((c) => c.id === country.hubCityId)?.name} la primera noche (llegada)</span>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={value.lastNightAtHub}
            onChange={(e) => onChange({ ...value, lastNightAtHub: e.target.checked })}
          />
          <span>Volver a dormir ahí la última noche (vuelo temprano)</span>
        </label>
      </div>

      <div className="field-row">
        <label>
          <span>Máximo de horas de manejo por día que toleras</span>
          <input
            type="number"
            min={1}
            max={8}
            step={0.5}
            value={value.maxDriveHours}
            onChange={(e) => onChange({ ...value, maxDriveHours: Number(e.target.value) })}
          />
        </label>
      </div>
    </form>
  );
}
