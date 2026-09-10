import { albania } from './albania';
import type { CountryData } from './types';
import { buildRoute } from '../lib/itinerary';

/**
 * Registry of fully curated countries. Each entry needs real city data,
 * drive-time matrix and border outline — see albania.ts for the shape.
 * Ask for a new country and it gets added here with the same depth.
 */
export const countries: CountryData[] = [albania];

export function getCountry(id: string): CountryData {
  return countries.find((c) => c.id === id) ?? countries[0];
}

export function defaultPlannerInputFor(country: CountryData) {
  const stops = country.cities.filter((c) => c.id !== country.hubCityId);
  const priority = [...stops].sort((a, b) => b.nightsRecommended[1] - a.nightsRecommended[1])[0] ?? stops[0];
  const driveTo = (a: string, b: string) => country.driveHours[a]?.[b] ?? country.driveHours[b]?.[a] ?? 99;
  // skip near-duplicates of the arrival city or the priority stop (e.g. a satellite
  // town 15 minutes away) — technically "free" to add, but not a meaningful highlight
  const candidateIds = stops
    .filter((c) => c.id !== priority.id && driveTo(country.hubCityId, c.id) >= 1 && driveTo(priority.id, c.id) >= 0.75)
    .map((c) => c.id);
  // pick the 2 cheapest-detour cities so the default route stays geographically sane
  const others = buildRoute(country, country.hubCityId, priority.id, candidateIds)
    .filter((s) => s.city.id !== priority.id)
    .sort((a, b) => a.detourHours - b.detourHours)
    .slice(0, 2)
    .map((s) => s.city.id);
  return {
    totalDays: 7,
    priorityCityId: priority.id,
    priorityDays: Math.min(4, Math.max(2, priority.nightsRecommended[1])),
    otherCityIds: others,
    firstNightAtHub: true,
    lastNightAtHub: true,
    maxDriveHours: 3.5,
  };
}
