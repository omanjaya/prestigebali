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
  | "chevron";

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
