import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { geocodePlace } from '../lib/geocode';
import { IconCalendarDays, IconCompass, IconPin, IconRoad } from './icons';

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
}

interface Props {
  value: CustomTripState;
  onChange: (next: CustomTripState) => void;
}

export function CustomTripForm({ value, onChange }: Props) {
  const [hubQuery, setHubQuery] = useState('');
  const [hubStatus, setHubStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [stopQuery, setStopQuery] = useState('');
  const [stopDays, setStopDays] = useState(2);
  const [stopStatus, setStopStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const setHub = async () => {
    if (!hubQuery.trim()) return;
    setHubStatus('loading');
    const result = await geocodePlace(hubQuery, value.countryName);
    if (!result) {
      setHubStatus('error');
      return;
    }
    setHubStatus('idle');
    onChange({ ...value, hub: { name: hubQuery.trim(), coords: result.coords } });
  };

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
          className={inputCls}
        />
      </div>

      <div>
        <FieldLabel icon={<IconCompass className="h-5 w-5" />} htmlFor="custom-hub" text="Ciudad de llegada y salida" />
        <div className="flex gap-2">
          <input
            id="custom-hub"
            type="text"
            placeholder="ej. Tokio"
            value={hubQuery}
            onChange={(e) => setHubQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), setHub())}
            className={inputCls}
          />
          <button
            type="button"
            onClick={setHub}
            disabled={hubStatus === 'loading'}
            className="flex-none rounded-2xl bg-olive px-4 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {hubStatus === 'loading' ? '…' : 'Usar'}
          </button>
        </div>
        {hubStatus === 'error' && <p className="mt-1.5 text-xs text-terracotta-dark">No encontré ese lugar, prueba otro nombre.</p>}
        {value.hub && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-olive-dark">
            <IconPin className="h-3.5 w-3.5" /> Llegada/salida: <strong>{value.hub.name}</strong>
          </p>
        )}
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
        <p className="mt-2 text-xs text-ink-faint">
          Las distancias se estiman en línea recta (no hay datos reales de carretera para cualquier lugar del
          mundo) — úsalas como referencia, no exactas.
        </p>
      </div>

      <div>
        <FieldLabel icon={<IconRoad className="h-5 w-5" />} htmlFor="custom-maxdrive" text="Máx. horas de manejo por día" />
        <input
          id="custom-maxdrive"
          type="number"
          min={1}
          max={8}
          step={0.5}
          value={value.maxDriveHours}
          onChange={(e) => onChange({ ...value, maxDriveHours: Number(e.target.value) })}
          className={inputCls}
        />
      </div>
    </div>
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
