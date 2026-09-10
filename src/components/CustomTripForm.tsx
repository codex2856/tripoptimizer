import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { geocodePlace } from '../lib/geocode';
import { fetchWikivoyageCities } from '../lib/wikivoyage';
import { IconCalendarDays, IconCompass, IconPin } from './icons';

export interface CustomStop {
  id: string;
  name: string;
  coords: [number, number];
  blurb?: string;
}

export interface CustomTripState {
  countryName: string;
  hub: { name: string; coords: [number, number] } | null;
  stops: CustomStop[];
  maxDriveHours: number;
  totalDays: number;
}

interface Props {
  value: CustomTripState;
  onChange: (next: CustomTripState) => void;
  onStart: () => void;
}

function newId(name: string) {
  return `${name.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function CustomTripForm({ value, onChange, onStart }: Props) {
  const [hubQuery, setHubQuery] = useState(value.hub?.name ?? '');
  const [status, setStatus] = useState<'idle' | 'suggesting' | 'hub-error' | 'no-suggestions'>('idle');
  const [manualQuery, setManualQuery] = useState('');
  const [manualStatus, setManualStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const addManualStop = async () => {
    if (!manualQuery.trim()) return;
    setManualStatus('loading');
    const result = await geocodePlace(manualQuery, value.countryName);
    if (!result) {
      setManualStatus('error');
      return;
    }
    setManualStatus('idle');
    onChange({ ...value, stops: [...value.stops, { id: newId(manualQuery), name: manualQuery.trim(), coords: result.coords }] });
    setManualQuery('');
  };

  const removeStop = (id: string) => onChange({ ...value, stops: value.stops.filter((s) => s.id !== id) });

  const handleSuggest = async () => {
    if (!hubQuery.trim()) return;
    setStatus('suggesting');

    const hubResult = await geocodePlace(hubQuery, value.countryName);
    if (!hubResult) {
      setStatus('hub-error');
      return;
    }
    const hub = { name: hubQuery.trim(), coords: hubResult.coords };

    const suggestions = await fetchWikivoyageCities(value.countryName);
    const geocoded = await Promise.all(
      suggestions
        .filter((s) => s.name.toLowerCase() !== hubQuery.trim().toLowerCase())
        .map(async (s): Promise<CustomStop | null> => {
          const g = await geocodePlace(s.name, value.countryName);
          return g ? { id: newId(s.name), name: s.name, coords: g.coords, blurb: s.blurb } : null;
        }),
    );
    const stops = geocoded.filter((s): s is CustomStop => s !== null);

    if (stops.length === 0) {
      onChange({ ...value, hub, stops: [] });
      setStatus('no-suggestions');
      return;
    }

    onChange({ ...value, hub, stops });
    setStatus('idle');
    onStart();
  };

  const showManualFallback = status === 'no-suggestions' || value.stops.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <FieldLabel icon={<IconPin className="h-5 w-5" />} htmlFor="custom-country" text="¿A qué país vas?" />
        <input
          id="custom-country"
          type="text"
          placeholder="ej. Japón, Perú, Marruecos…"
          value={value.countryName}
          onChange={(e) => onChange({ ...value, countryName: e.target.value })}
          className={`${inputCls} w-full`}
        />
      </div>

      <div>
        <FieldLabel icon={<IconCompass className="h-5 w-5" />} htmlFor="custom-hub" text="Ciudad de llegada" />
        <input
          id="custom-hub"
          type="text"
          placeholder="ej. Tokio"
          value={hubQuery}
          onChange={(e) => setHubQuery(e.target.value)}
          className={`${inputCls} w-full`}
        />
        {status === 'hub-error' && (
          <p className="mt-1.5 text-xs text-terracotta-dark">No encontré esa ciudad, prueba otro nombre.</p>
        )}
      </div>

      <div>
        <FieldLabel icon={<IconCalendarDays className="h-5 w-5" />} htmlFor="custom-days" text="Días totales de viaje" />
        <input
          id="custom-days"
          type="number"
          min={2}
          max={30}
          value={value.totalDays}
          onChange={(e) => onChange({ ...value, totalDays: Number(e.target.value) })}
          className={`${inputCls} w-full`}
        />
        <p className="mt-1.5 text-xs text-ink-faint">
          Reparte estos días entre las ciudades que te sugiramos, priorizando menos manejo.
        </p>
      </div>

      <motion.button
        type="button"
        onClick={handleSuggest}
        disabled={!hubQuery.trim() || status === 'suggesting'}
        whileHover={hubQuery.trim() ? { y: -2 } : undefined}
        whileTap={hubQuery.trim() ? { scale: 0.97 } : undefined}
        className="rounded-2xl bg-terracotta px-5 py-3.5 text-base font-semibold text-paper shadow-soft transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === 'suggesting' ? 'Buscando qué ver…' : 'Sugerir itinerario'}
      </motion.button>

      {status === 'no-suggestions' && (
        <p className="-mt-3 text-xs text-terracotta-dark">
          No encontré sugerencias automáticas para ese país — agrega tus destinos a mano abajo.
        </p>
      )}

      {showManualFallback && (
        <div className="border-t border-dashed border-paper-line pt-5">
          <FieldLabel icon={<IconCalendarDays className="h-5 w-5" />} text="Destinos sugeridos" />
          <AnimatePresence>
            {value.stops.length > 0 && (
              <ul className="mb-3 flex flex-col gap-2">
                {value.stops.map((s) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start justify-between gap-2 overflow-hidden rounded-xl border border-paper-line bg-paper px-3 py-2 text-sm"
                  >
                    <span>
                      <span className="font-medium text-ink">{s.name}</span>
                      {s.blurb && <span className="block text-xs text-ink-soft">{s.blurb.slice(0, 90)}</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStop(s.id)}
                      aria-label={`Quitar ${s.name}`}
                      className="flex-none text-ink-faint transition-colors hover:text-terracotta-dark"
                    >
                      ✕
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Agregar otro destino…"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addManualStop())}
              className={`${inputCls} min-w-0 flex-1`}
            />
            <button
              type="button"
              onClick={addManualStop}
              disabled={manualStatus === 'loading'}
              className="flex-none rounded-2xl bg-olive px-4 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {manualStatus === 'loading' ? '…' : 'Agregar'}
            </button>
          </div>
          {manualStatus === 'error' && (
            <p className="mt-1.5 text-xs text-terracotta-dark">No encontré ese lugar, prueba otro nombre.</p>
          )}

          {value.stops.length > 0 && (
            <motion.button
              type="button"
              onClick={onStart}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 w-full rounded-2xl bg-terracotta px-5 py-3.5 text-base font-semibold text-paper shadow-soft"
            >
              Armar itinerario
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}

const inputCls =
  'rounded-2xl border border-paper-line bg-paper px-4 py-2.5 text-ink shadow-sm outline-none transition-colors focus:border-terracotta focus:ring-2 focus:ring-terracotta/25';

function FieldLabel({ icon, text, htmlFor }: { icon: ReactNode; text: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-soft">
      <span className="text-terracotta">{icon}</span>
      {text}
    </label>
  );
}
