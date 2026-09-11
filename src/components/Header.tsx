import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { IconCompass } from './icons';

const LINKS = [
  { href: '#bitacora', label: 'Tu viaje' },
  { href: '#mapa', label: 'Mapa' },
  { href: '#itinerario', label: 'Itinerario' },
  { href: '#ciudades', label: 'Ciudades' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? 'border-white/10 bg-ink/95 backdrop-blur-sm' : 'border-transparent bg-ink'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2 text-paper">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
            className="inline-flex text-olive"
          >
            <IconCompass className="h-6 w-6" />
          </motion.span>
          <span className="font-display text-lg tracking-wide">TRIP OPTIMIZER</span>
        </a>

        <nav className="hidden items-center gap-7 sm:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative text-xs font-semibold uppercase tracking-[0.12em] text-paper/80 transition-colors hover:text-paper"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-olive transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="flex h-9 w-9 flex-none flex-col items-center justify-center gap-1.5 sm:hidden"
        >
          <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }} className="h-0.5 w-6 bg-paper" />
          <motion.span animate={{ opacity: open ? 0 : 1 }} className="h-0.5 w-6 bg-paper" />
          <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }} className="h-0.5 w-6 bg-paper" />
        </button>
      </div>

      <motion.nav
        initial={false}
        animate={{ height: open ? 'auto' : 0 }}
        className="overflow-hidden sm:hidden"
      >
        <div className="flex flex-col gap-1 px-4 pb-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-semibold uppercase tracking-wide text-paper/90 hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
        </div>
      </motion.nav>
    </header>
  );
}
