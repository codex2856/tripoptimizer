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

  return (
    <figure className="m-0">
      <div className="relative rounded-2xl border border-paper-line bg-sky-light/40 p-3 shadow-soft">
        <IconCompass className="absolute right-4 top-4 h-9 w-9 text-sky-dark/50" />
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
            <marker id="routeDot" viewBox="0 0 4 4" markerWidth="4" markerHeight="4" refX="2" refY="2">
              <circle cx="2" cy="2" r="1.6" fill="currentColor" />
            </marker>
          </defs>

          <polygon
            points={outlinePx.map((p) => p.join(',')).join(' ')}
            className="fill-paper stroke-ink-soft"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <polygon
            points={outlinePx.map((p) => p.join(',')).join(' ')}
            fill="url(#paperGrain)"
            className="text-olive"
          />

          <polyline
            points={routePx.map((p) => p.join(',')).join(' ')}
            fill="none"
            className="stroke-terracotta"
            strokeWidth={2.2}
            strokeDasharray="1 8"
            strokeLinecap="round"
            markerStart="url(#routeDot)"
            markerEnd="url(#routeDot)"
          />

          {routePx.slice(0, -1).map(([x, y], i) => {
            const isHub = i === 0;
            const nights = isHub ? undefined : orderedStops[i - 1].nights;
            const name = isHub ? hub.name : orderedStops[i - 1].city.name;
            const fillClass = isHub ? 'fill-terracotta' : nights && nights > 0 ? 'fill-olive' : 'fill-ink-faint';
            return (
              <g key={`${name}-${i}`}>
                <circle cx={x} cy={y} r={9} className={fillClass} stroke="var(--color-paper)" strokeWidth={2.4} />
                <text x={x} y={y + 3.4} textAnchor="middle" className="fill-paper text-[10px] font-semibold">
                  {i + 1}
                </text>
                <text
                  x={x}
                  y={y - 13}
                  textAnchor="middle"
                  className="fill-ink font-hand text-[15px]"
                >
                  {name}
                  {isHub ? '' : nights ? ` · ${nights}n` : ' · de paso'}
                </text>
              </g>
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
