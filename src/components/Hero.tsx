import { motion } from 'motion/react';
import { useWikiSummary } from '../hooks/useWikiSummary';
import { IconCompass, IconPin, IconPlane } from './icons';

interface Props {
  wikiTitle: string;
  countryName: string;
}

const floatIcons = [
  { Icon: IconPlane, top: '14%', left: '78%', size: 30, duration: 9, delay: 0, rotate: -18 },
  { Icon: IconPin, top: '68%', left: '10%', size: 24, duration: 7, delay: 0.6, rotate: 0 },
  { Icon: IconCompass, top: '22%', left: '8%', size: 26, duration: 11, delay: 1.1, rotate: 0 },
];

export function Hero({ wikiTitle, countryName }: Props) {
  const { thumbnail } = useWikiSummary(wikiTitle);

  return (
    <header className="relative isolate overflow-hidden rounded-3xl border border-paper-line shadow-lift">
      <motion.div
        className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,var(--color-olive-dark),var(--color-sky-dark)_45%,var(--color-terracotta-dark)_100%)] bg-[length:220%_220%]"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      />
      {thumbnail && (
        <img src={thumbnail} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" loading="eager" />
      )}
      <div className="absolute inset-0 -z-[5] bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10" />

      {floatIcons.map(({ Icon, top, left, size, duration, delay, rotate }, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute -z-[2] text-paper/25"
          style={{ top, left, width: size, height: size }}
          animate={{ y: [0, -14, 0], rotate: [rotate, rotate + 6, rotate] }}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          <Icon className="h-full w-full" />
        </motion.div>
      ))}

      <div className="relative flex min-h-[62vw] flex-col justify-end gap-4 px-6 py-10 sm:min-h-[420px] sm:px-12 sm:py-14">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-paper/50 bg-ink/30 px-3 py-1 font-hand text-xl text-paper backdrop-blur-sm"
        >
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="inline-flex"
          >
            <IconCompass className="h-5 w-5" />
          </motion.span>
          diario de ruta · {countryName}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="max-w-2xl text-4xl font-semibold leading-[1.05] text-paper sm:text-6xl"
        >
          Recorre {countryName} sin perder ni un día manejando
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="max-w-lg text-base leading-relaxed text-paper/90 sm:text-lg"
        >
          Cuéntanos cuántos días tienes y qué no te quieres perder. Te devolvemos la ruta con menos
          carretera, un itinerario día a día y dónde comer en cada parada.
        </motion.p>
      </div>
    </header>
  );
}
