import { motion } from 'motion/react';
import type { City, CountryData } from '../data/types';
import { computeProjection, project } from '../lib/geo';
import { IconCompass } from './icons';

interface Props {
  country: CountryData;
  orderedStops: { city: City; nights: number }[];
}

const WIDTH = 360;
const HEIGHT = 620;

export function BrochureMap({ country, orderedStops }: Props) {
  const hub = country.cities.find((c) => c.id === country.hubCityId)!;
  const cityLonLat: [number, number][] = country.cities.map((c) => [c.coords[1], c.coords[0]]);
  const proj = computeProjection([...country.outline, ...cityLonLat], WIDTH, HEIGHT, {
    l: 46,
    r: 46,
    t: 30,
    b: 30,
  });

  const outlinePx = country.outline.map(([lon, lat]) => project(lon, lat, proj));
  const seq = [hub, ...orderedStops.map((s) => s.city), hub];
  const routePx = seq.map((c) => project(c.coords[1], c.coords[0], proj));
  const routeKey = seq.map((c) => c.id).join('-');

  return (
    <figure className="m-0">
      <div className="relative rounded-2xl border border-paper-line bg-sky-light/40 p-3 shadow-soft">
        <motion.div
          className="absolute right-4 top-4 text-sky-dark/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        >
          <IconCompass className="h-9 w-9" />
        </motion.div>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`Mapa ilustrativo de ${country.name} con el contorno del país y la ruta del itinerario en orden`}
          className="h-auto w-full"
        >
          <defs>
            <pattern id="paperGrain" width="9" height="9" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="currentColor" opacity="0.15" />
            </pattern>
          </defs>

          <motion.polygon
            points={outlinePx.map((p) => p.join(',')).join(' ')}
            className="fill-paper stroke-ink-soft"
            strokeWidth={1.6}
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: '50% 50%' }}
          />
          <polygon
            points={outlinePx.map((p) => p.join(',')).join(' ')}
            fill="url(#paperGrain)"
            className="text-olive"
          />

          <motion.polyline
            key={routeKey}
            points={routePx.map((p) => p.join(',')).join(' ')}
            fill="none"
            className="stroke-terracotta"
            strokeWidth={2.2}
            strokeDasharray="1 8"
            strokeLinecap="round"
            animate={{ strokeDashoffset: [0, -36] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          />

          {routePx.slice(0, -1).map(([x, y], i) => {
            const isHub = i === 0;
            const nights = isHub ? undefined : orderedStops[i - 1].nights;
            const name = isHub ? hub.name : orderedStops[i - 1].city.name;
            const fillClass = isHub ? 'fill-terracotta' : nights && nights > 0 ? 'fill-olive' : 'fill-ink-faint';
            return (
              <motion.g
                key={`${name}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 + i * 0.08 }}
                style={{ transformOrigin: `${x}px ${y}px` }}
                whileHover={{ scale: 1.15 }}
              >
                <circle cx={x} cy={y} r={9} className={fillClass} stroke="var(--color-paper)" strokeWidth={2.4} />
                <text x={x} y={y + 3.4} textAnchor="middle" className="fill-paper text-[10px] font-semibold">
                  {i + 1}
                </text>
                <text x={x} y={y - 13} textAnchor="middle" className="fill-ink font-hand text-[15px]">
                  {name}
                  {isHub ? '' : nights ? ` · ${nights}n` : ' · de paso'}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-xs text-ink-faint">
        Contorno real de {country.name} y posición real de cada ciudad — dibujado como mapa de folleto, no como
        vista satelital.
      </figcaption>
    </figure>
  );
}
