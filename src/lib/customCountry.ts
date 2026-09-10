import type { City, CountryData, DriveMatrix } from '../data/types';
import type { CustomTripState } from '../components/CustomTripForm';
import type { PlannerInput } from './itinerary';
import { estimateDriveHours } from './geocode';

export function buildCustomCountryData(state: CustomTripState, outline: [number, number][]): CountryData | null {
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
  for (const a of cities) {
    driveHours[a.id] = {};
    for (const b of cities) {
      if (a.id === b.id) continue;
      driveHours[a.id][b.id] = estimateDriveHours(a.coords, b.coords);
    }
  }

  return {
    id: 'custom',
    name: state.countryName.trim() || 'tu destino',
    hubCityId: 'hub',
    cities,
    driveHours,
    outline,
    travelNote:
      'Los tiempos de manejo son una estimación en línea recta (no hay datos reales de carretera para cualquier lugar del mundo) — trátalos como referencia y confirma con un mapa antes de tu viaje.',
  };
}

export function plannerInputForCustom(state: CustomTripState, totalDays: number): PlannerInput {
  const sorted = [...state.stops].sort((a, b) => b.days - a.days);
  const priority = sorted[0];
  const others = sorted.slice(1).map((s) => s.id);
  return {
    totalDays,
    priorityCityId: priority?.id ?? '',
    priorityDays: priority?.days ?? 1,
    otherCityIds: others,
    firstNightAtHub: true,
    lastNightAtHub: true,
    maxDriveHours: state.maxDriveHours,
  };
}
