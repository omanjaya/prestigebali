// Ikon line premium (SVG stroke) — pengganti emoji. Ringan, mewarisi currentColor.
// Pakai: <Icon name="arrow" /> ; ukuran via prop `size` (default 18).

import type { SVGProps } from "react";

type IconName =
  | "arrow"
  | "check"
  | "calendar"
  | "key"
  | "steering"
  | "mapPin"
  | "user"
  | "shield"
  | "clock"
  | "chevron"
  | "coin"
  | "percent"
  | "grid"
  | "chat"
  | "chart"
  | "pen"
  | "gear";

const PATHS: Record<IconName, ReactSvgChildren> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M4 12l5 5L20 6" />,
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="1.5" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11l8 8M16 16l2-2M14 18l2-2" />
    </>
  ),
  steering: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 14.5V21M9.6 11.2L4 8M14.4 11.2L20 8" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21c5-5 7-8.5 7-12a7 7 0 10-14 0c0 3.5 2 7 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
    </>
  ),
  shield: <path d="M12 3l7 3v6c0 4-3 6.5-7 9-4-2.5-7-5-7-9V6z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  chevron: <path d="M9 6l6 6-6 6" />,
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v9M9.3 9.3c0-1.1 1.2-1.8 2.7-1.8s2.7.7 2.7 1.6c0 2.2-5.4 1-5.4 3.2 0 .9 1.2 1.6 2.7 1.6s2.7-.7 2.7-1.8" />
    </>
  ),
  percent: (
    <>
      <path d="M5 19L19 5" />
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </>
  ),
  chat: (
    <path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" />
  ),
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8.5 16v-5M13 16V8M17.5 16v-3" />
    </>
  ),
  pen: (
    <>
      <path d="M4 20l1-4L17 4l3 3L8 19z" />
      <path d="M14.5 6.5l3 3" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" />
    </>
  ),
};

type ReactSvgChildren = SVGProps<SVGSVGElement>["children"];

export function Icon({
  name,
  size = 18,
  ...rest
}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
