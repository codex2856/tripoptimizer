import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { countries, defaultPlannerInputFor, getCountry } from './data/countries';
import { PlannerForm } from './components/PlannerForm';
import { CustomTripForm, type CustomTripState } from './components/CustomTripForm';
import { BrochureMap } from './components/BrochureMap';
import { CityCard } from './components/CityCard';
import { Timeline } from './components/Timeline';
import { Hero } from './components/Hero';
import { IconCompass, IconPin } from './components/icons';
import { AnimatedNumber } from './components/AnimatedNumber';
import { planTrip, type PlannerInput } from './lib/itinerary';
import { buildCustomCountryData, plannerInputForCustom } from './lib/customCountry';
import { fetchCountryOutline } from './lib/geocode';
import { iso3ForCountryName } from './data/countryCodes';
import type { CountryData } from './data/types';

const emptyCustomState: CustomTripState = {
  countryName: '',
  hub: null,
  stops: [],
  maxDriveHours: 3.5,
  totalDays: 7,
};

function App() {
  const [mode, setMode] = useState<'curated' | 'custom'>('curated');

  // ---- curated mode ----
  const [countryId, setCountryId] = useState(countries[0].id);
  const curatedCountry = getCountry(countryId);
  const [curatedInput, setCuratedInput] = useState<PlannerInput>(() => defaultPlannerInputFor(curatedCountry));
  const handleCountryChange = (id: string) => {
    setCountryId(id);
    setCuratedInput(defaultPlannerInputFor(getCountry(id)));
  };

  // ---- custom (any place) mode ----
  const [customState, setCustomState] = useState<CustomTripState>(emptyCustomState);
  const [customOutline, setCustomOutline] = useState<[number, number][]>([]);
  const [customCountry, setCustomCountry] = useState<CountryData | null>(null);
  const [customBuilding, setCustomBuilding] = useState(false);
  const buildVersion = useRef(0);

  useEffect(() => {
    const iso3 = iso3ForCountryName(customState.countryName);
    if (!iso3) {
      setCustomOutline([]);
      return;
    }
    let cancelled = false;
    fetchCountryOutline(iso3).then((outline) => {
      if (!cancelled) setCustomOutline(outline);
    });
    return () => {
      cancelled = true;
    };
  }, [customState.countryName]);

  useEffect(() => {
    if (!customState.hub || customState.stops.length === 0) {
      setCustomCountry(null);
      return;
    }
    const version = ++buildVersion.current;
    setCustomBuilding(true);
    buildCustomCountryData(customState, customOutline).then((result) => {
      if (version !== buildVersion.current) return; // a newer build superseded this one
      setCustomCountry(result?.country ?? null);
      setCustomBuilding(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customState.hub, customState.stops, customOutline]);

  const country = mode === 'curated' ? curatedCountry : customCountry;
  const input = mode === 'curated' ? curatedInput : customCountry ? plannerInputForCustom(customState) : null;

  const plan = useMemo(() => (country && input ? planTrip(country, input) : null), [country, input]);
  const hub = country?.cities.find((c) => c.id === country.hubCityId);
  const priorityCity = country?.cities.find((c) => c.id === input?.priorityCityId);

  const orderedStopsForMap = useMemo(
    () => plan?.route.map((s) => ({ city: s.city, nights: plan.nightsByCity[s.city.id] ?? 0 })) ?? [],
    [plan],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <Hero wikiTitle={priorityCity?.wikiTitle ?? hub?.wikiTitle ?? 'Travel'} countryName={country?.name ?? 'donde quieras'} />

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

          <div className="mb-6 flex gap-1 rounded-full border border-paper-line bg-paper p-1 text-sm">
            <ModeTab active={mode === 'curated'} onClick={() => setMode('curated')} label="Países preparados" />
            <ModeTab active={mode === 'custom'} onClick={() => setMode('custom')} label="Cualquier lugar" />
          </div>

          {mode === 'curated' ? (
            <PlannerForm
              country={curatedCountry}
              countries={countries}
              onCountryChange={handleCountryChange}
              value={curatedInput}
              onChange={setCuratedInput}
            />
          ) : (
            <>
              <CustomTripForm value={customState} onChange={setCustomState} />
              {customBuilding && (
                <p className="mt-3 text-xs text-sky-dark">Calculando rutas reales entre tus destinos…</p>
              )}
              {!customState.hub && (
                <p className="mt-3 text-xs text-ink-faint">
                  Agrega tu ciudad de llegada y al menos un destino para generar el itinerario.
                </p>
              )}
            </>
          )}

          <AnimatePresence>
            {plan && plan.warnings.length > 0 && (
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

          {country && (
            <p className="mt-4 rounded-2xl bg-sky-light/60 p-4 text-sm leading-relaxed text-sky-dark">
              {country.travelNote}
            </p>
          )}

          {plan && (
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
                <AnimatedNumber value={plan.route.length} className="font-display text-3xl font-semibold text-terracotta" />
                <p className="text-xs text-ink-soft">paradas en la ruta</p>
              </div>
            </div>
          )}

          {plan && plan.droppedCities.length > 0 && (
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
            {country ? (
              <BrochureMap country={country} orderedStops={orderedStopsForMap} />
            ) : (
              <EmptyState text="El mapa aparece aquí en cuanto armes tu viaje." />
            )}
          </section>

          <section>
            <SectionTitle icon={<IconCompass className="h-6 w-6" />} title="Itinerario día a día" />
            {plan && country ? (
              <Timeline schedule={plan.schedule} country={country} />
            ) : (
              <EmptyState text="Tu itinerario día a día aparece aquí." />
            )}
          </section>
        </div>
      </main>

      {plan && country && hub && (
        <section className="mt-14">
          <SectionTitle title="Ciudades en tu ruta" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <CityCard city={hub} badge="Base" />
            {plan.route.map((stop) => (
              <CityCard
                key={stop.city.id}
                city={stop.city}
                nights={plan.nightsByCity[stop.city.id] ?? 0}
                badge={stop.city.id === input?.priorityCityId ? 'Prioridad' : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {plan && plan.droppedCities.length > 0 && (
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
        {mode === 'curated'
          ? `Hecho con datos curados de ${curatedCountry.name}. Los restaurantes son sugerencias generales — confirma horarios y disponibilidad antes de ir.`
          : 'Modo "cualquier lugar": ciudades geocodificadas y rutas calculadas en vivo — verifica siempre horarios, seguridad y condiciones antes de viajar.'}
      </footer>
    </div>
  );
}

function ModeTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
        active ? 'bg-olive text-paper shadow-soft' : 'text-ink-soft hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-paper-line bg-paper-dim/40 p-6 text-center text-sm text-ink-faint">
      {text}
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
