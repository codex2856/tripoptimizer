import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { geocodePlace } from '../lib/geocode';
import { IconCalendarDays, IconCompass, IconPin } from './icons';

export interface CustomStop {
  id: string;
  name: string;
  coords: [number, number];
  days: number;
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

export function CustomTripForm({ value, onChange, onStart }: Props) {
  const [hubQuery, setHubQuery] = useState(value.hub?.name ?? '');
  const [hubError, setHubError] = useState(false);
  const [starting, setStarting] = useState(false);
  const [stopQuery, setStopQuery] = useState('');
  const [stopDays, setStopDays] = useState(2);
  const [stopStatus, setStopStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const addStop = async () => {
    if (!stopQuery.trim()) return;
    setStopStatus('loading');
    const result = await geocodePlace(stopQuery, value.countryName);
    if (!result) {
      setStopStatus('error');
      return;
    }
    setStopStatus('idle');
    onChange({
      ...value,
      stops: [
        ...value.stops,
        { id: `${stopQuery.trim().toLowerCase()}-${Date.now()}`, name: stopQuery.trim(), coords: result.coords, days: stopDays },
      ],
    });
    setStopQuery('');
    setStopDays(2);
  };

  const removeStop = (id: string) => onChange({ ...value, stops: value.stops.filter((s) => s.id !== id) });
  const updateStopDays = (id: string, days: number) =>
    onChange({ ...value, stops: value.stops.map((s) => (s.id === id ? { ...s, days } : s)) });

  const handleStart = async () => {
    setHubError(false);
    if (!hubQuery.trim() || value.stops.length === 0) return;
    setStarting(true);
    let hub = value.hub;
    if (!hub || hub.name !== hubQuery.trim()) {
      const result = await geocodePlace(hubQuery, value.countryName);
      if (!result) {
        setHubError(true);
        setStarting(false);
        return;
      }
      hub = { name: hubQuery.trim(), coords: result.coords };
      onChange({ ...value, hub });
    }
    onStart();
    setStarting(false);
  };

  const canStart = hubQuery.trim().length > 0 && value.stops.length > 0 && !starting;

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
        {hubError && <p className="mt-1.5 text-xs text-terracotta-dark">No encontré ese lugar, prueba otro nombre.</p>}
      </div>

      <div>
        <FieldLabel icon={<IconCalendarDays className="h-5 w-5" />} text="Destinos que quieres visitar" />
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="ej. Kioto"
            value={stopQuery}
            onChange={(e) => setStopQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStop())}
            className={`${inputCls} min-w-0 flex-1`}
          />
          <input
            type="number"
            min={0}
            max={20}
            value={stopDays}
            onChange={(e) => setStopDays(Number(e.target.value))}
            title="Días que le quieres dedicar"
            className={`${inputCls} w-20 flex-none`}
          />
          <button
            type="button"
            onClick={addStop}
            disabled={stopStatus === 'loading'}
            className="flex-none rounded-2xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {stopStatus === 'loading' ? '…' : 'Agregar'}
          </button>
        </div>
        {stopStatus === 'error' && <p className="mt-1.5 text-xs text-terracotta-dark">No encontré ese lugar, prueba otro nombre.</p>}

        <AnimatePresence>
          {value.stops.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2">
              {value.stops.map((s) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between gap-2 overflow-hidden rounded-xl border border-paper-line bg-paper px-3 py-2 text-sm"
                >
                  <span className="font-medium text-ink">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={s.days}
                      onChange={(e) => updateStopDays(s.id, Number(e.target.value))}
                      className="w-14 rounded-lg border border-paper-line bg-stone px-2 py-1 text-center text-xs"
                    />
                    <span className="text-xs text-ink-soft">días</span>
                    <button
                      type="button"
                      onClick={() => removeStop(s.id)}
                      aria-label={`Quitar ${s.name}`}
                      className="text-ink-faint transition-colors hover:text-terracotta-dark"
                    >
                      ✕
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </AnimatePresence>
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
      </div>

      <motion.button
        type="button"
        onClick={handleStart}
        disabled={!canStart}
        whileHover={canStart ? { y: -2 } : undefined}
        whileTap={canStart ? { scale: 0.97 } : undefined}
        className="rounded-2xl bg-terracotta px-5 py-3.5 text-base font-semibold text-paper shadow-soft transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {starting ? 'Armando tu ruta…' : 'Comenzar'}
      </motion.button>
      {!canStart && !starting && (
        <p className="-mt-3 text-xs text-ink-faint">Agrega tu ciudad de llegada y al menos un destino para comenzar.</p>
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
