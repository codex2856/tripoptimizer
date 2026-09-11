import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CustomTripForm, type CustomTripState } from './components/CustomTripForm';
import { BrochureMap } from './components/BrochureMap';
import { CityCard } from './components/CityCard';
import { Timeline } from './components/Timeline';
import { Hero } from './components/Hero';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
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
  maxDriveHours: 4,
  totalDays: 7,
};

interface Ready {
  country: CountryData;
  input: PlannerInput;
}

function App() {
  const [customState, setCustomState] = useState<CustomTripState>(emptyCustomState);
  const [customOutline, setCustomOutline] = useState<[number, number][]>([]);
  // country + input are always set together from the same build, so a city id
  // in `input` can never point at a `country.cities` list that hasn't caught
  // up yet (that mismatch used to crash planTrip when you removed/added a
  // destination while a previous build was still in flight).
  const [ready, setReady] = useState<Ready | null>(null);
  const [building, setBuilding] = useState(false);
  const [started, setStarted] = useState(false);
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
      ++buildVersion.current; // invalidate any in-flight build so it can't overwrite this reset
      setReady(null);
      setBuilding(false);
      return;
    }
    const version = ++buildVersion.current;
    const stateSnapshot = customState; // pair country+input from this exact snapshot, never a later one
    setBuilding(true);
    buildCustomCountryData(stateSnapshot, customOutline).then((result) => {
      if (version !== buildVersion.current) return; // a newer build superseded this one
      setReady(result ? { country: result.country, input: plannerInputForCustom(stateSnapshot) } : null);
      setBuilding(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customState.hub, customState.stops, customOutline]);

  const country = ready?.country ?? null;
  const input = ready?.input ?? null;
  const plan = useMemo(() => (country && input ? planTrip(country, input) : null), [country, input]);
  const hub = country?.cities.find((c) => c.id === country.hubCityId);
  const priorityCity = country?.cities.find((c) => c.id === input?.priorityCityId);

  const orderedStopsForMap = useMemo(
    () => plan?.route.map((s) => ({ city: s.city, nights: plan.nightsByCity[s.city.id] ?? 0 })) ?? [],
    [plan],
  );

  return (
    <>
      <Header />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <Hero
        wikiTitle={priorityCity?.wikiTitle ?? hub?.wikiTitle ?? 'Travel'}
        countryName={country?.name ?? (customState.countryName || 'donde quieras')}
      />

      <StatusBar
        countryName={customState.countryName}
        hubName={customState.hub?.name}
        totalDays={customState.totalDays}
        stopsCount={customState.stops.length}
      />

      <main id="bitacora" className={`mt-10 scroll-mt-24 grid grid-cols-1 gap-8 ${started ? 'lg:grid-cols-[380px_1fr]' : ''} lg:items-start`}>
        <section className="grain rounded-3xl border border-ink bg-paper-dim/60 p-6 shadow-soft sm:p-7 lg:sticky lg:top-24">
          <h2 className="mb-6 flex items-center gap-2 font-display text-3xl text-ink">
            <motion.span
              className="inline-flex text-terracotta"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              <IconCompass className="h-6 w-6" />
            </motion.span>
            Tu viaje
          </h2>

          <CustomTripForm value={customState} onChange={setCustomState} onStart={() => setStarted(true)} />

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

          {started && country && (
            <p className="mt-4 rounded-2xl bg-sky-light/60 p-4 text-sm leading-relaxed text-sky-dark">
              {country.travelNote}
            </p>
          )}

          {started && plan && (
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

          {started && plan && plan.droppedCities.length > 0 && (
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

        {started && (
          <div className="flex flex-col gap-8">
            <section id="mapa" className="scroll-mt-24">
              <SectionTitle icon={<IconPin className="h-6 w-6" />} title="Mapa de la ruta" />
              {country ? (
                <BrochureMap country={country} orderedStops={orderedStopsForMap} />
              ) : (
                <EmptyState text={building ? 'Calculando rutas reales entre tus destinos…' : 'Preparando tu mapa…'} />
              )}
            </section>

            <section id="itinerario" className="scroll-mt-24">
              <SectionTitle icon={<IconCompass className="h-6 w-6" />} title="Itinerario día a día" />
              {plan && country ? (
                <Timeline schedule={plan.schedule} country={country} />
              ) : (
                <EmptyState text={building ? 'Calculando rutas reales entre tus destinos…' : 'Preparando tu itinerario…'} />
              )}
            </section>
          </div>
        )}
      </main>

      {started && plan && country && hub && (
        <section id="ciudades" className="mt-14 scroll-mt-24">
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

      {started && plan && plan.droppedCities.length > 0 && (
        <section className="mt-14">
          <SectionTitle title="Si tuvieras más días" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {plan.droppedCities.map((d) => (
              <CityCard key={d.city.id} city={d.city} />
            ))}
          </div>
        </section>
      )}

      {started && (
        <footer className="mt-16 border-t border-dashed border-paper-line pt-6 text-center text-sm text-ink-faint">
          Ciudades geocodificadas y rutas calculadas en vivo — verifica siempre horarios, seguridad y condiciones
          antes de viajar.
        </footer>
      )}
      </div>
      <footer className="bg-ink px-4 py-10 text-paper sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <IconCompass className="h-6 w-6 text-olive" />
            <span className="font-display text-lg tracking-wide">TRIP OPTIMIZER</span>
          </div>
          <p className="max-w-md text-xs uppercase tracking-[0.1em] text-paper/60">
            Datos en vivo de Wikivoyage, OpenStreetMap y Wikipedia — no somos una agencia de viajes.
          </p>
        </div>
      </footer>
    </>
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
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className="mb-4 flex items-center gap-2 font-display text-3xl text-ink"
    >
      {icon && <span className="text-terracotta">{icon}</span>}
      {title}
    </motion.h2>
  );
}

export default App;
