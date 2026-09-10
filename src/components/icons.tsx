import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconCompass(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M14.8 9.2 12.9 13l-3.8 1.9 1.9-3.9z" />
      <path d="M12 3.4v1.4M12 19.2v1.4M3.4 12h1.4M19.2 12h1.4" />
    </svg>
  );
}

export function IconCalendarDays(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.4" />
      <path d="M3.5 9.6h17M8 3v3.6M16 3v3.6" />
      <path d="M7.6 13.2h1.6M11.2 13.2h1.6M14.8 13.2h1.6M7.6 16.4h1.6M11.2 16.4h1.6" />
    </svg>
  );
}

export function IconPalm(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21V11.4" />
      <path d="M12 12c-2-3.2-5.2-4.4-8-3.6 1 2.6 3.4 4 6.4 3.8" />
      <path d="M12 11.6c2-3.4 5.4-4.6 8.2-3.6-1 2.6-3.6 4-6.6 3.6" />
      <path d="M12 11.4c-.4-2.6.6-4.6 2.6-6-2.4-.6-4.6.4-5.4 2.6" />
      <path d="M17.5 21c-.8-2-2.8-3-5.5-3s-4.7 1-5.5 3" />
    </svg>
  );
}

export function IconRoad(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 3 5 21" />
      <path d="M15 3l4 18" />
      <path d="M12 4.5v2.2M12 10.6v2.2M12 16.7v2.2" />
    </svg>
  );
}

export function IconFork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M8 2.6v7.4a2.2 2.2 0 0 0 4.4 0V2.6" />
      <path d="M10.2 2.6v18.8" />
      <path d="M16.4 2.6c-1.3 1.6-1.9 3.6-1.9 5.8 0 1.9.9 3 1.9 3.4v9.6" />
    </svg>
  );
}

export function IconLandmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 21h16" />
      <path d="M5.5 21V11.4M9.2 21V11.4M14.8 21V11.4M18.5 21V11.4" />
      <path d="M3.2 11.4 12 5.8l8.8 5.6z" />
    </svg>
  );
}

export function IconMountain(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3 19.5 9.4 8.6l3.6 5.6 2-2.8L21 19.5z" />
      <circle cx="7.6" cy="6.6" r="1.5" />
    </svg>
  );
}

export function IconPin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21.4S5 15 5 9.8a7 7 0 0 1 14 0c0 5.2-7 11.6-7 11.6z" />
      <circle cx="12" cy="9.6" r="2.4" />
    </svg>
  );
}

export function IconPlane(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 14.4 20 8.3c1.3-.5 2.3.9 1.5 2L14 20.5l-1.6-5.6-6.2-1z" />
      <path d="M12.4 15 3.5 14.4" />
    </svg>
  );
}
