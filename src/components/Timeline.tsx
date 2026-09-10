import { motion } from 'motion/react';
import type { City, CountryData } from '../data/types';
import type { ScheduleDay } from '../lib/itinerary';
import { useWikiSummary } from '../hooks/useWikiSummary';
import { IconFork, IconLandmark, IconMountain, IconPalm, IconPlane, IconRoad } from './icons';

interface Props {
  schedule: ScheduleDay[];
  country: CountryData;
}

function iconForCity(city?: City) {
  if (!city) return IconRoad;
  if (city.types.includes('beach')) return IconPalm;
  if (city.types.includes('nature')) return IconMountain;
  if (city.types.includes('history') || city.types.includes('capital')) return IconLandmark;
  return IconRoad;
}

export function Timeline({ schedule, country }: Props) {
  const cityById = (id: string) => country.cities.find((c) => c.id === id);

  return (
    <ol className="relative flex flex-col gap-8 pl-2">
      <motion.span
        className="absolute bottom-3 left-[27px] top-3 w-px origin-top border-l-2 border-dashed border-paper-line"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      {schedule.map((day, i) => {
        const isDeparture = day.note?.includes('aeropuerto');
        const city = cityById(day.cityId);
        const Icon = isDeparture ? IconPlane : day.nightsHere === 0 && day.isTravelDay ? IconRoad : iconForCity(city);
        const showPhoto = day.isFirstDayOfStay && day.nightsHere > 0 && city;

        return (
          <motion.li
            key={`${day.dayNumber}-${day.cityId}-${i}`}
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex gap-5"
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: -4 }}
              className="relative z-10 flex h-14 w-14 flex-none items-center justify-center rounded-full border-2 border-paper bg-sky-light text-sky-dark shadow-soft"
            >
              <Icon className="h-6 w-6" />
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="flex-1 rounded-2xl border border-paper-line bg-paper/70 p-4 shadow-soft transition-shadow hover:shadow-lift sm:p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-hand text-2xl leading-none text-terracotta">Día {day.dayNumber}</span>
                <span className="text-lg font-semibold text-ink">
                  {day.cityName}
                  {day.isFirstDayOfStay && day.nightsHere > 0 && (
                    <span className="ml-2 text-sm font-normal text-ink-soft">
                      · {day.nightsHere} {day.nightsHere === 1 ? 'noche' : 'noches'}
                    </span>
                  )}
                </span>
              </div>

              {day.driveFromPrevious && day.driveFromPrevious.hours > 0 && (
                <p
                  className={`mt-2 flex items-center gap-1.5 text-sm ${
                    day.driveFromPrevious.overBudget ? 'font-semibold text-terracotta-dark' : 'text-ink-soft'
                  }`}
                >
                  <IconRoad className="h-4 w-4 flex-none" />
                  {day.driveFromPrevious.fromCityName} → {day.cityName}: ~{day.driveFromPrevious.hours.toFixed(1)}h
                  manejando
                </p>
              )}

              {day.note && <p className="mt-2 text-sm italic text-ink-soft">{day.note}</p>}

              {city && city.restaurants.length > 0 && day.isFirstDayOfStay && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-olive-dark">
                  <IconFork className="h-4 w-4 flex-none" />
                  Prueba {city.restaurants[0].name}
                </p>
              )}

              {showPhoto && <DayPhoto wikiTitle={city.wikiTitle} name={city.name} />}
            </motion.div>
          </motion.li>
        );
      })}
    </ol>
  );
}

function DayPhoto({ wikiTitle, name }: { wikiTitle: string; name: string }) {
  const { thumbnail } = useWikiSummary(wikiTitle);
  if (!thumbnail) return null;
  return (
    <motion.img
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      src={thumbnail}
      alt={name}
      loading="lazy"
      className="mt-3 h-36 w-full rounded-xl object-cover sm:h-44"
    />
  );
}
