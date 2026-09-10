import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { countries, defaultPlannerInputFor, getCountry } from './data/countries';
import { PlannerForm } from './components/PlannerForm';
import { BrochureMap } from './components/BrochureMap';
import { CityCard } from './components/CityCard';
import { Timeline } from './components/Timeline';
import { Hero } from './components/Hero';
import { IconCompass, IconPin } from './components/icons';
import { AnimatedNumber } from './components/AnimatedNumber';
import { planTrip, type PlannerInput } from './lib/itinerary';

function App() {
  const [countryId, setCountryId] = useState(countries[0].id);
  const country = getCountry(countryId);
  const [input, setInput] = useState<PlannerInput>(() => defaultPlannerInputFor(country));

  const handleCountryChange = (id: string) => {
    setCountryId(id);
    setInput(defaultPlannerInputFor(getCountry(id)));
  };

  const plan = useMemo(() => planTrip(country, input), [country, input]);
  const hub = country.cities.find((c) => c.id === country.hubCityId)!;
  const priorityCity = country.cities.find((c) => c.id === input.priorityCityId)!;

  const orderedStopsForMap = plan.route.map((s) => ({
    city: s.city,
    nights: plan.nightsByCity[s.city.id] ?? 0,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <Hero wikiTitle={priorityCity.wikiTitle} countryName={country.name} />

      <main className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
        <section className="grain rounded-3xl border border-paper-line bg-paper-dim/60 p-6 shadow-soft sm:p-7 lg:sticky lg:top-6">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-ink">
            <motion.span
              className="inline-flex text-terracotta"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              <IconCompass className="h-6 w-6" />
            </motion.span>
            Tu bitácora
          </h2>
          <PlannerForm
            country={country}
            countries={countries}
            onCountryChange={handleCountryChange}
            value={input}
            onChange={setInput}
          />

          <AnimatePresence>
            {plan.warnings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-2 overflow-hidden rounded-2xl border border-terracotta-light/60 bg-terracotta-light/15 p-4 text-sm text-terracotta-dark"
              >
                {plan.warnings.map((w, i) => (
                  <p key={i}>⚠ {w}</p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-4 rounded-2xl bg-sky-light/60 p-4 text-sm leading-relaxed text-sky-dark">
            {country.travelNote}
          </p>

          <div className="mt-5 flex gap-8 border-t border-dashed border-paper-line pt-5">
            <div>
              <AnimatedNumber
                value={plan.totalDriveHours}
                decimals={1}
                suffix="h"
                className="font-display text-3xl font-semibold text-terracotta"
              />
              <p className="text-xs text-ink-soft">de manejo en total</p>
            </div>
            <div>
              <AnimatedNumber
                value={plan.route.length}
                className="font-display text-3xl font-semibold text-terracotta"
              />
              <p className="text-xs text-ink-soft">paradas en la ruta</p>
            </div>
          </div>

          {plan.droppedCities.length > 0 && (
            <div className="mt-5 border-t border-dashed border-paper-line pt-4 text-sm text-ink-soft">
              <h3 className="mb-2 font-semibold text-ink">Para otro viaje</h3>
              <ul className="flex flex-col gap-1.5">
                {plan.droppedCities.map((d) => (
                  <li key={d.city.id}>
                    <strong className="text-ink">{d.city.name}:</strong> {d.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-8">
          <section>
            <SectionTitle icon={<IconPin className="h-6 w-6" />} title="Mapa de la ruta" />
            <BrochureMap country={country} orderedStops={orderedStopsForMap} />
          </section>

          <section>
            <SectionTitle icon={<IconCompass className="h-6 w-6" />} title="Itinerario día a día" />
            <Timeline schedule={plan.schedule} country={country} />
          </section>
        </div>
      </main>

      <section className="mt-14">
        <SectionTitle title="Ciudades en tu ruta" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
        <section className="mt-14">
          <SectionTitle title="Si tuvieras más días" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {plan.droppedCities.map((d) => (
              <CityCard key={d.city.id} city={d.city} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-16 border-t border-dashed border-paper-line pt-6 text-center text-sm text-ink-faint">
        Hecho con datos curados de {country.name}. Los restaurantes son sugerencias generales — confirma horarios y
        disponibilidad antes de ir.
      </footer>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon?: ReactNode; title: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-ink">
      {icon && <span className="text-terracotta">{icon}</span>}
      {title}
    </h2>
  );
}

export default App;
