import { useWikiSummary } from '../hooks/useWikiSummary';
import { IconCompass } from './icons';

interface Props {
  wikiTitle: string;
  countryName: string;
}

export function Hero({ wikiTitle, countryName }: Props) {
  const { thumbnail } = useWikiSummary(wikiTitle);

  return (
    <header className="relative isolate overflow-hidden rounded-3xl border border-paper-line shadow-lift">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-olive-dark via-sky-dark to-terracotta-dark" />
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 -z-[5] bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10" />

      <div className="relative flex min-h-[62vw] flex-col justify-end gap-4 px-6 py-10 sm:min-h-[420px] sm:px-12 sm:py-14">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-paper/50 bg-ink/30 px-3 py-1 font-hand text-xl text-paper backdrop-blur-sm">
          <IconCompass className="h-5 w-5" /> diario de ruta · {countryName}
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] text-paper sm:text-6xl">
          Recorre {countryName} sin perder ni un día manejando
        </h1>
        <p className="max-w-lg text-base leading-relaxed text-paper/90 sm:text-lg">
          Cuéntanos cuántos días tienes y qué no te quieres perder. Te devolvemos la ruta con menos
          carretera, un itinerario día a día y dónde comer en cada parada.
        </p>
      </div>
    </header>
  );
}
