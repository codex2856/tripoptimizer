import type { ScheduleDay } from '../lib/itinerary';

interface Props {
  schedule: ScheduleDay[];
}

export function Timeline({ schedule }: Props) {
  return (
    <ol className="timeline">
      {schedule.map((day) => (
        <li key={`${day.dayNumber}`} className="timeline__item">
          <div className="timeline__day">Día {day.dayNumber}</div>
          <div className="timeline__content">
            <div className="timeline__city">
              {day.cityName}
              {day.isFirstDayOfStay && day.nightsHere > 0 && (
                <span className="timeline__nights"> · {day.nightsHere} {day.nightsHere === 1 ? 'noche' : 'noches'}</span>
              )}
            </div>
            {day.driveFromPrevious && day.driveFromPrevious.hours > 0 && (
              <div className={`timeline__drive ${day.driveFromPrevious.overBudget ? 'is-over-budget' : ''}`}>
                🚗 {day.driveFromPrevious.fromCityName} → {day.cityName}: ~{day.driveFromPrevious.hours.toFixed(1)}h manejando
              </div>
            )}
            {day.note && <div className="timeline__note">{day.note}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
