// SVG icon set — ported verbatim from the prototype's ICON map (garage.html:591).
// Each is a presentational <svg>; size/color come from the consuming CSS (currentColor).
import type { ReactElement } from 'react';

type IconProps = { className?: string };

export const IconGauge = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 14l3-3M12 21a9 9 0 110-18 9 9 0 010 18z" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const IconDrive = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const IconPin = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const IconCar = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M3 13l1.8-5.2A2 2 0 016.7 6.4h10.6a2 2 0 011.9 1.4L21 13M5 13h14v4a1 1 0 01-1 1H6a1 1 0 01-1-1v-4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="7.5" cy="15" r="1" fill="currentColor" />
    <circle cx="16.5" cy="15" r="1" fill="currentColor" />
  </svg>
);

export const IconFuel = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M14 20V6a2 2 0 00-2-2H7a2 2 0 00-2 2v14m-1 0h11M5 11h7m6-4l2 2v7a1.5 1.5 0 01-3 0V12a1 1 0 00-1-1h-1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconExt = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M14 5h5v5M19 5l-8 8M12 5H6a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconWarn = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 3l9.5 16.5H2.5L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 10v4m0 3h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const IconRisk = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 8v5m0 3h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const IconInfo = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const IconCheck = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconClose = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconStar = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2L7 14.2 2 9.4l7-.9z" />
  </svg>
);

export const IconBrand = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M3 13l1.8-5.2A2 2 0 016.7 6.4h10.6a2 2 0 011.9 1.4L21 13M5 13h14m-14 0v3.5a1 1 0 001 1h1.5a1 1 0 001-1V16m9.5-3v3.5a1 1 0 01-1 1H16a1 1 0 01-1-1V16M3 13v3a1 1 0 001 1"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7.5" cy="13.5" r="1.1" fill="#fff" />
    <circle cx="16.5" cy="13.5" r="1.1" fill="#fff" />
  </svg>
);

export const IconGrid = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const IconCompare = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M3 5h18M3 12h18M3 19h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9 3v18" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const IconSettings = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7.7 2 2 0 01-3.8 0 1.6 1.6 0 00-2.7-.7l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00-1.5-2.7 2 2 0 010-3.8 1.6 1.6 0 001.5-2.7l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H8a1.6 1.6 0 001-1.5 2 2 0 013.8 0 1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1 2 2 0 010 3.8 1.6 1.6 0 00-1.5 1z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export const IconExport = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPlus = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconSearch = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconFilter = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 5h16M7 12h10M10 19h4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

export const IconSun = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

export const IconMoon = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M21 12.8A8.5 8.5 0 1111.2 3a6.5 6.5 0 009.8 9.8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

export const IconCopy = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M5 15V5a2 2 0 012-2h10" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

export const IconDownload = ({ className }: IconProps): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 4v10m0 0l-3.5-3.5M12 14l3.5-3.5M5 19h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
