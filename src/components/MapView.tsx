import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { City, CountryData } from '../data/types';

function numberedIcon(n: number, kind: 'hub' | 'stay' | 'pass') {
  const color = kind === 'hub' ? '#1f6f5c' : kind === 'stay' ? '#e07a2f' : '#8a8a8a';
  return L.divIcon({
    className: 'numbered-marker',
    html: `<div style="background:${color}" class="numbered-marker__dot">${n}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

interface Props {
  country: CountryData;
  orderedStops: { city: City; nights: number }[];
}

export function MapView({ country, orderedStops }: Props) {
  const hub = country.cities.find((c) => c.id === country.hubCityId)!;
  const points: [number, number][] = [hub.coords, ...orderedStops.map((s) => s.city.coords), hub.coords];

  return (
    <MapContainer center={country.center} zoom={country.zoom} className="map-view" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={points} pathOptions={{ color: '#1f6f5c', weight: 3, dashArray: '6 8' }} />

      <Marker position={hub.coords} icon={numberedIcon(1, 'hub')}>
        <Tooltip permanent direction="top" offset={[0, -12]}>
          {hub.name} (llegada/salida)
        </Tooltip>
      </Marker>

      {orderedStops.map((s, i) => (
        <Marker key={s.city.id} position={s.city.coords} icon={numberedIcon(i + 2, s.nights > 0 ? 'stay' : 'pass')}>
          <Tooltip permanent direction="top" offset={[0, -12]}>
            {s.city.name}{s.nights > 0 ? ` · ${s.nights}n` : ' · de paso'}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
