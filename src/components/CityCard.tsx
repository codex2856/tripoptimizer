import { motion } from 'motion/react';
import type { City } from '../data/types';
import { useWikiSummary } from '../hooks/useWikiSummary';
import { IconFork, IconLandmark, IconMountain, IconPalm, IconPin } from './icons';

const TYPE_LABEL: Record<string, string> = {
  capital: 'Capital',
  beach: 'Playa',
  history: 'Histórico',
  nature: 'Naturaleza',
  'coastal-city': 'Ciudad costera',
};

const TYPE_ICON: Record<string, typeof IconPalm> = {
  beach: IconPalm,
  nature: IconMountain,
  history: IconLandmark,
  capital: IconLandmark,
  'coastal-city': IconPin,
};

/** For freeform cities with no curated `types`, guess a fitting icon from
 * whatever description we do have — better than always falling back to the
 * same generic pin when there's no real photo either. */
function inferIconFromText(text: string): typeof IconPalm | null {
  const t = text.toLowerCase();
  if (/beach|coast|island|seaside|playa|costa/.test(t)) return IconPalm;
  if (/mountain|hik|volcano|forest|jungle|montañ|sierra/.test(t)) return IconMountain;
  if (/histor|ancient|castle|temple|unesco|ruins|old town|catedral/.test(t)) return IconLandmark;
  return null;
}

interface Props {
  city: City;
  badge?: string;
  nights?: number;
}

export function CityCard({ city, badge, nights }: Props) {
  const { thumbnail, extract, loading } = useWikiSummary(city.wikiTitle);
  const blurb = city.blurb || extract || 'Aún no tengo una descripción para este lugar.';
  const TypeIcon = TYPE_ICON[city.types[0]] ?? inferIconFromText(`${city.blurb} ${extract ?? ''}`) ?? IconPin;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, rotate: -0.6 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-paper-line bg-paper shadow-soft transition-shadow duration-200 hover:shadow-lift"
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-sky-dark to-olive-dark">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={city.name}
            loading="lazy"
            className="photo-duotone h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center text-paper ${loading ? 'opacity-60' : ''}`}>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TypeIcon className="h-10 w-10" />
            </motion.div>
          </div>
        )}
        {badge && (
          <motion.span
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: -6 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.2 }}
            className="absolute right-3 top-3 rounded-full border-2 border-dashed border-paper bg-terracotta/90 px-3 py-1 font-hand text-lg leading-none text-paper shadow-soft"
          >
            {badge}
          </motion.span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <header>
          <h3 className="font-display text-xl font-semibold text-ink">{city.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {city.types.map((t) => (
              <span
                key={t}
                className="rounded-full bg-sky-light px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-sky-dark"
              >
                {TYPE_LABEL[t] ?? t}
              </span>
            ))}
            {typeof nights === 'number' && nights > 0 && (
              <span className="rounded-full bg-terracotta-light/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-terracotta-dark">
                {nights} {nights === 1 ? 'noche' : 'noches'}
              </span>
            )}
          </div>
        </header>

        <p className="text-sm leading-relaxed text-ink-soft">{blurb}</p>

        {city.attractions && city.attractions.length > 0 && (
          <div className="flex flex-col gap-2">
            {city.attractions.map((a) => (
              <div key={a.name} className="rounded-lg border border-dashed border-paper-line bg-paper-dim px-3 py-2 text-xs">
                <strong className="block text-sky-dark">{a.name}</strong>
                <span className="text-ink-soft">{a.note}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-1 border-t border-paper-line pt-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-olive-dark">
            <IconFork className="h-4 w-4" /> Dónde comer
          </h4>
          {city.restaurants.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {city.restaurants.map((r) => (
                <li key={r.name} className="border-t border-paper-line pt-2 text-sm first:border-t-0 first:pt-0">
                  <span className="font-semibold text-ink">{r.name}</span>
                  <span className="ml-1.5 text-xs font-semibold text-terracotta">
                    {r.cuisine} · {r.price}
                  </span>
                  <span className="block text-xs text-ink-soft">{r.note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink-faint">
              Todavía no tengo restaurantes curados aquí — revisa Google Maps o TripAdvisor para esta ciudad.
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
