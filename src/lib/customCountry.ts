import type { City, CountryData, DriveMatrix } from '../data/types';
import type { CustomTripState } from '../components/CustomTripForm';
import type { PlannerInput } from './itinerary';
import { realDriveHours } from './geocode';

export interface CustomCountryResult {
  country: CountryData;
  anyRealRouting: boolean;
}

export async function buildCustomCountryData(state: CustomTripState, outline: [number, number][]): Promise<CustomCountryResult | null> {
  if (!state.hub || state.stops.length === 0) return null;

  const hubCity: City = {
    id: 'hub',
    name: state.hub.name,
    types: ['capital'],
    coords: state.hub.coords,
    wikiTitle: state.hub.name,
    blurb: '',
    nightsRecommended: [1, 1],
    restaurants: [],
    isHub: true,
  };

  const stopCities: City[] = state.stops.map((s) => ({
    id: s.id,
    name: s.name,
    types: [],
    coords: s.coords,
    wikiTitle: s.name,
    blurb: '',
    nightsRecommended: [s.days, s.days] as [number, number],
    restaurants: [],
  }));

  const cities = [hubCity, ...stopCities];
  const driveHours: DriveMatrix = {};
  for (const c of cities) driveHours[c.id] = {};

  let anyRealRouting = false;
  const pairs: [City, City][] = [];
  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) pairs.push([cities[i], cities[j]]);
  }
  // OSRM's public demo server is rate-limited — run requests with light concurrency, not all at once
  const concurrency = 4;
  for (let i = 0; i < pairs.length; i += concurrency) {
    const batch = pairs.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(([a, b]) => realDriveHours(a.coords, b.coords)));
    batch.forEach(([a, b], idx) => {
      const { hours, real } = results[idx];
      driveHours[a.id][b.id] = hours;
      driveHours[b.id][a.id] = hours;
      if (real) anyRealRouting = true;
    });
  }

  return {
    anyRealRouting,
    country: {
      id: 'custom',
      name: state.countryName.trim() || 'tu destino',
      hubCityId: 'hub',
      cities,
      driveHours,
      outline,
      travelNote: anyRealRouting
        ? 'Los tiempos de manejo vienen de un servicio de rutas real (OSRM) sobre la red de carreteras — trátalos como una buena aproximación, no como el tiempo exacto que te marque tu GPS ese día.'
        : 'No se pudo consultar el servicio de rutas reales, así que estos tiempos son una estimación en línea recta — trátalos solo como referencia.',
    },
  };
}

export function plannerInputForCustom(state: CustomTripState): PlannerInput {
  const sorted = [...state.stops].sort((a, b) => b.days - a.days);
  const priority = sorted[0];
  const others = sorted.slice(1).map((s) => s.id);
  return {
    totalDays: state.totalDays,
    priorityCityId: priority?.id ?? '',
    priorityDays: priority?.days ?? 1,
    otherCityIds: others,
    firstNightAtHub: true,
    lastNightAtHub: true,
    maxDriveHours: state.maxDriveHours,
  };
}
