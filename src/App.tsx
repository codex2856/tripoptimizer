import { useMemo, useState } from 'react';
import './App.css';
import { albania } from './data/albania';
import { PlannerForm } from './components/PlannerForm';
import { MapView } from './components/MapView';
import { CityCard } from './components/CityCard';
import { Timeline } from './components/Timeline';
import { planTrip, type PlannerInput } from './lib/itinerary';

const country = albania;

const initialInput: PlannerInput = {
  totalDays: 7,
  priorityCityId: 'ksamil',
  priorityDays: 4,
  otherCityIds: ['berat', 'gjirokaster'],
  firstNightAtHub: true,
  lastNightAtHub: true,
  maxDriveHours: 3.5,
};

function App() {
  const [input, setInput] = useState<PlannerInput>(initialInput);

  const plan = useMemo(() => planTrip(country, input), [input]);
  const hub = country.cities.find((c) => c.id === country.hubCityId)!;

  const orderedStopsForMap = plan.route.map((s) => ({
    city: s.city,
    nights: plan.nightsByCity[s.city.id] ?? 0,
  }));

  return (
    <div className="app">
      <header className="hero">
        <h1>Trip Optimizer</h1>
        <p>
          Dinos a dónde quieres ir y cuántos días tienes: te armamos la ruta más eficiente, sin perder tiempo
          manejando y sin dejar de lado lo que de verdad quieres ver.
        </p>
      </header>

      <main className="layout">
        <section className="panel panel--form">
          <h2>Tu viaje</h2>
          <PlannerForm country={country} value={input} onChange={setInput} />

          {plan.warnings.length > 0 && (
            <div className="warnings">
              {plan.warnings.map((w, i) => (
                <p key={i}>⚠️ {w}</p>
              ))}
            </div>
          )}

          <p className="travel-note">ℹ️ {country.travelNote}</p>

          <div className="summary">
            <div>
              <span className="summary__value">{plan.totalDriveHours.toFixed(1)}h</span>
              <span className="summary__label">de manejo en total</span>
            </div>
            <div>
              <span className="summary__value">{plan.route.length}</span>
              <span className="summary__label">paradas en la ruta</span>
            </div>
          </div>

          {plan.droppedCities.length > 0 && (
            <div className="dropped">
              <h3>Para otro viaje</h3>
              <ul>
                {plan.droppedCities.map((d) => (
                  <li key={d.city.id}>
                    <strong>{d.city.name}:</strong> {d.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="panel panel--map">
          <h2>Mapa de la ruta</h2>
          <MapView country={country} orderedStops={orderedStopsForMap} />
        </section>
      </main>

      <section className="panel panel--timeline">
        <h2>Itinerario día a día</h2>
        <Timeline schedule={plan.schedule} />
      </section>

      <section className="panel panel--cities">
        <h2>Ciudades en tu ruta</h2>
        <div className="city-grid">
          <CityCard city={hub} badge="Base" />
          {plan.route.map((stop) => (
            <CityCard
              key={stop.city.id}
              city={stop.city}
              nights={plan.nightsByCity[stop.city.id] ?? 0}
              badge={stop.city.id === input.priorityCityId ? 'Prioridad' : undefined}
            />
          ))}
        </div>
      </section>

      {plan.droppedCities.length > 0 && (
        <section className="panel panel--cities">
          <h2>Si tuvieras más días</h2>
          <div className="city-grid">
            {plan.droppedCities.map((d) => (
              <CityCard key={d.city.id} city={d.city} />
            ))}
          </div>
        </section>
      )}

      <footer className="footer">
        Hecho con datos curados de Albania. Los restaurantes son sugerencias generales — confirma horarios y
        disponibilidad antes de ir.
      </footer>
    </div>
  );
}

export default App;
