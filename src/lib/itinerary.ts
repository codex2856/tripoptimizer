import type { City, CountryData } from '../data/types';

export interface PlannerInput {
  totalDays: number; // total calendar days of the trip (including arrival & departure day)
  priorityCityId: string;
  priorityDays: number;
  otherCityIds: string[];
  firstNightAtHub: boolean;
  lastNightAtHub: boolean;
  maxDriveHours: number;
}

export interface RouteStop {
  city: City;
  detourHours: number; // marginal driving cost this stop added when inserted into the route
}

export interface ScheduleDay {
  dayNumber: number;
  cityId: string;
  cityName: string;
  isTravelDay: boolean;
  driveFromPrevious?: { fromCityName: string; hours: number; overBudget: boolean };
  nightsHere: number; // total nights allotted to this stay (only shown on the first day of the stay)
  isFirstDayOfStay: boolean;
  isLastDayOfStay: boolean;
  note?: string;
}

export interface PlanResult {
  route: RouteStop[]; // ordered stops between hub and hub, excluding the hub bookends
  droppedCities: { city: City; reason: string }[];
  passThroughCities: { city: City; reason: string }[]; // visited briefly, no overnight
  schedule: ScheduleDay[];
  totalDriveHours: number;
  nightsByCity: Record<string, number>;
  warnings: string[];
}

function hours(matrix: CountryData['driveHours'], a: string, b: string): number {
  if (a === b) return 0;
  return matrix[a]?.[b] ?? matrix[b]?.[a] ?? 99;
}

/**
 * Cheapest-insertion heuristic for a closed loop hub -> ... -> hub.
 * Small N (<=8 candidate cities) so this greedy approach finds a near-optimal,
 * non-backtracking order without needing full TSP search.
 */
function buildRoute(
  country: CountryData,
  hubId: string,
  priorityId: string,
  otherIds: string[],
): RouteStop[] {
  const matrix = country.driveHours;
  const cityById = (id: string) => country.cities.find((c) => c.id === id)!;

  // Seed the loop with the must-visit priority city first, then greedily
  // insert the rest. Seeding first means every other city's recorded
  // "detour" cost is the real marginal driving time it adds on top of a
  // trip that already includes the priority stop (not the cost of a
  // detour from an empty hub-only loop, which would misrepresent cities
  // that happen to sit along the way).
  let loop = [hubId, priorityId, hubId];
  const remaining = otherIds.filter((id) => id !== priorityId);
  const detour: Record<string, number> = { [priorityId]: 2 * hours(matrix, hubId, priorityId) };

  while (remaining.length) {
    let best: { id: string; index: number; cost: number } | null = null;
    for (const id of remaining) {
      for (let i = 0; i < loop.length - 1; i++) {
        const u = loop[i];
        const v = loop[i + 1];
        const cost = hours(matrix, u, id) + hours(matrix, id, v) - hours(matrix, u, v);
        if (!best || cost < best.cost) best = { id, index: i + 1, cost };
      }
    }
    if (!best) break;
    loop.splice(best.index, 0, best.id);
    detour[best.id] = best.cost;
    remaining.splice(remaining.indexOf(best.id), 1);
  }

  return loop
    .slice(1, -1)
    .map((id) => ({ city: cityById(id), detourHours: detour[id] ?? 0 }));
}

export function planTrip(country: CountryData, input: PlannerInput): PlanResult {
  const warnings: string[] = [];
  const hub = country.cities.find((c) => c.id === country.hubCityId)!;
  const totalNights = Math.max(0, input.totalDays - 1);

  const nightsAtHubStart = input.firstNightAtHub ? 1 : 0;
  const nightsAtHubEnd = input.lastNightAtHub ? 1 : 0;
  let stopsBudget = totalNights - nightsAtHubStart - nightsAtHubEnd;

  if (stopsBudget < 1) {
    warnings.push(
      'El viaje es muy corto para salir de la ciudad de llegada con las noches reservadas actuales. Se reducen noches en el hub para dejar al menos 1 noche fuera.',
    );
    stopsBudget = Math.max(1, totalNights - 1);
  }

  const otherIds = Array.from(new Set(input.otherCityIds.filter((id) => id !== hub.id && id !== input.priorityCityId)));
  const fullRoute = buildRoute(country, hub.id, input.priorityCityId, otherIds);
  const sortedByDetour = [...fullRoute].sort((a, b) => a.detourHours - b.detourHours);

  const nightsByCity: Record<string, number> = {};
  const included: RouteStop[] = [];
  const dropped: { city: City; reason: string }[] = [];
  const passThrough: { city: City; reason: string }[] = [];

  const priorityStop = fullRoute.find((s) => s.city.id === input.priorityCityId);
  if (priorityStop) {
    const priorityNights = Math.min(input.priorityDays, stopsBudget);
    nightsByCity[priorityStop.city.id] = priorityNights;
    stopsBudget -= priorityNights;
    included.push(priorityStop);
  }

  for (const stop of sortedByDetour) {
    if (stop.city.id === input.priorityCityId) continue;
    const recommendedMin = stop.city.nightsRecommended[0] || 1;
    const need = Math.max(1, recommendedMin);
    if (stopsBudget >= need) {
      nightsByCity[stop.city.id] = need;
      stopsBudget -= need;
      included.push(stop);
    } else if (stop.detourHours <= 1.5) {
      nightsByCity[stop.city.id] = 0;
      included.push(stop);
      passThrough.push({
        city: stop.city,
        reason: `Está de paso en la ruta (desvío de solo ~${stop.detourHours.toFixed(1)}h), se visita sin pernoctar.`,
      });
    } else {
      dropped.push({
        city: stop.city,
        reason: `No alcanzan los días disponibles: agregarlo hubiera costado ~${stop.detourHours.toFixed(1)}h extra de manejo y al menos ${need} noche(s).`,
      });
    }
  }

  // give any leftover nights to the priority city (bonus beach/relax time)
  if (stopsBudget > 0 && priorityStop) {
    nightsByCity[priorityStop.city.id] = (nightsByCity[priorityStop.city.id] ?? 0) + stopsBudget;
    stopsBudget = 0;
  }

  // rebuild the ordered route keeping only included stops, preserving relative order
  const includedIds = new Set(included.map((s) => s.city.id));
  const orderedRoute = fullRoute.filter((s) => includedIds.has(s.city.id));

  // ---- build day-by-day schedule ----
  const schedule: ScheduleDay[] = [];
  let day = 1;
  let prevCityId = hub.id;
  let prevCityName = hub.name;

  if (nightsAtHubStart > 0) {
    schedule.push({
      dayNumber: day,
      cityId: hub.id,
      cityName: hub.name,
      isTravelDay: false,
      nightsHere: nightsAtHubStart,
      isFirstDayOfStay: true,
      isLastDayOfStay: true,
      note: 'Llegada. Aclimátate y recorre la capital antes de salir de ruta.',
    });
    day += 1;
  }

  let totalDriveHours = 0;

  orderedRoute.forEach((stop) => {
    const legHours = hours(country.driveHours, prevCityId, stop.city.id);
    totalDriveHours += legHours;
    const overBudget = legHours > input.maxDriveHours;
    if (overBudget) {
      warnings.push(
        `El tramo ${prevCityName} → ${stop.city.name} son ~${legHours.toFixed(1)}h de manejo, por encima de tu máximo de ${input.maxDriveHours}h/día. Considera salir temprano y sumar paradas para estirar las piernas.`,
      );
    }

    const nights = nightsByCity[stop.city.id] ?? 0;
    if (nights === 0) {
      schedule.push({
        dayNumber: day,
        cityId: stop.city.id,
        cityName: stop.city.name,
        isTravelDay: true,
        driveFromPrevious: { fromCityName: prevCityName, hours: legHours, overBudget },
        nightsHere: 0,
        isFirstDayOfStay: true,
        isLastDayOfStay: true,
        note: 'Parada de paso, sin pernoctar: aprovecha unas horas antes de seguir.',
      });
      day += 1;
    } else {
      for (let n = 0; n < nights; n++) {
        schedule.push({
          dayNumber: day,
          cityId: stop.city.id,
          cityName: stop.city.name,
          isTravelDay: n === 0,
          driveFromPrevious: n === 0 ? { fromCityName: prevCityName, hours: legHours, overBudget } : undefined,
          nightsHere: nights,
          isFirstDayOfStay: n === 0,
          isLastDayOfStay: n === nights - 1,
        });
        day += 1;
      }
    }
    prevCityId = stop.city.id;
    prevCityName = stop.city.name;
  });

  if (nightsAtHubEnd > 0) {
    const legHours = hours(country.driveHours, prevCityId, hub.id);
    totalDriveHours += legHours;
    const overBudget = legHours > input.maxDriveHours;
    if (overBudget) {
      warnings.push(
        `El regreso ${prevCityName} → ${hub.name} son ~${legHours.toFixed(1)}h. Por eso conviene volver un día antes del vuelo en vez de manejar el mismo día de salida.`,
      );
    }
    schedule.push({
      dayNumber: day,
      cityId: hub.id,
      cityName: hub.name,
      isTravelDay: true,
      driveFromPrevious: { fromCityName: prevCityName, hours: legHours, overBudget },
      nightsHere: nightsAtHubEnd,
      isFirstDayOfStay: true,
      isLastDayOfStay: true,
      note: 'Vuelves al punto de partida para tener margen antes del vuelo.',
    });
    day += 1;
  }

  schedule.push({
    dayNumber: day,
    cityId: hub.id,
    cityName: hub.name,
    isTravelDay: false,
    nightsHere: 0,
    isFirstDayOfStay: true,
    isLastDayOfStay: true,
    note: 'Traslado al aeropuerto y vuelo de salida.',
  });

  return {
    route: orderedRoute,
    droppedCities: dropped,
    passThroughCities: passThrough,
    schedule,
    totalDriveHours,
    nightsByCity,
    warnings,
  };
}
