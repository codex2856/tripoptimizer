import type { City } from '../data/types';
import { useWikiSummary } from '../hooks/useWikiSummary';

const TYPE_LABEL: Record<string, string> = {
  capital: 'Capital',
  beach: 'Playa',
  history: 'Histórico',
  nature: 'Naturaleza',
  'coastal-city': 'Ciudad costera',
};

interface Props {
  city: City;
  badge?: string;
  nights?: number;
}

export function CityCard({ city, badge, nights }: Props) {
  const { thumbnail, loading } = useWikiSummary(city.wikiTitle);

  return (
    <article className="city-card">
      <div className="city-card__media">
        {thumbnail ? (
          <img src={thumbnail} alt={city.name} loading="lazy" />
        ) : (
          <div className={`city-card__placeholder ${loading ? 'is-loading' : ''}`}>
            <span>{city.name}</span>
          </div>
        )}
        {badge && <span className="city-card__badge">{badge}</span>}
      </div>
      <div className="city-card__body">
        <header>
          <h3>{city.name}</h3>
          <div className="city-card__tags">
            {city.types.map((t) => (
              <span key={t} className="tag">
                {TYPE_LABEL[t] ?? t}
              </span>
            ))}
            {typeof nights === 'number' && nights > 0 && (
              <span className="tag tag--nights">{nights} {nights === 1 ? 'noche' : 'noches'}</span>
            )}
          </div>
        </header>
        <p className="city-card__blurb">{city.blurb}</p>

        {city.attractions && city.attractions.length > 0 && (
          <div className="city-card__attractions">
            {city.attractions.map((a) => (
              <div key={a.name} className="attraction-chip">
                <strong>{a.name}</strong>
                <span>{a.note}</span>
              </div>
            ))}
          </div>
        )}

        {city.restaurants.length > 0 && (
          <div className="city-card__restaurants">
            <h4>Dónde comer</h4>
            <ul>
              {city.restaurants.map((r) => (
                <li key={r.name}>
                  <span className="restaurant-name">{r.name}</span>
                  <span className="restaurant-meta">{r.cuisine} · {r.price}</span>
                  <span className="restaurant-note">{r.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
