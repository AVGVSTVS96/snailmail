import { useId } from "react";
import type { Theme } from "@/lib/theme";

function random(seed: number) {
  let a = seed >>> 0;

  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blob(cx: number, cy: number, r: number, seed: number) {
  const next = random(seed);
  const phase = [next(), next(), next(), next()].map((p) => p * Math.PI * 2);

  const points = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;

    const k =
      1 +
      0.035 * Math.sin(5 * a + phase[0]) +
      0.025 * Math.sin(9 * a + phase[1]) +
      0.018 * Math.sin(14 * a + phase[2]) +
      0.012 * Math.sin(3 * a + phase[3]);

    return `${(cx + r * k * Math.cos(a)).toFixed(1)},${(cy + r * k * Math.sin(a)).toFixed(1)}`;
  });

  return `M${points.join(" L")} Z`;
}

const size = 84;
const center = size / 2;
const radius = size * 0.44;
const inner = radius * 0.66;

const crack: ReadonlyArray<readonly [number, number]> = [
  [center - 2, center - radius],
  [center + 3, center - radius * 0.45],
  [center - 3, center - radius * 0.05],
  [center + 4, center + radius * 0.4],
  [center, center + radius],
];

const crackPath = crack.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

function SealBody({ theme, initial, seed }: { theme: Theme; initial: string; seed: number }) {
  const id = useId();
  const fontSize = Math.round(inner * 1.25);

  return (
    <g>
      <defs>
        <radialGradient id={`${id}a`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor={theme.waxHi} />
          <stop offset="0.55" stopColor={theme.wax} />
          <stop offset="1" stopColor={theme.waxLo} />
        </radialGradient>
        <radialGradient id={`${id}b`} cx="60%" cy="65%" r="70%">
          <stop offset="0" stopColor={theme.waxHi} stopOpacity="0.5" />
          <stop offset="1" stopColor={theme.waxLo} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <path d={blob(center, center + 1.5, radius, seed)} fill={theme.waxLo} opacity="0.45" />
      <path d={blob(center, center, radius, seed)} fill={`url(#${id}a)`} />
      <circle cx={center} cy={center} r={inner} fill={theme.wax} />
      <circle cx={center} cy={center} r={inner} fill={`url(#${id}b)`} />
      <circle
        cx={center + 0.8}
        cy={center + 0.8}
        r={inner}
        fill="none"
        stroke={theme.waxHi}
        strokeOpacity="0.55"
        strokeWidth="1.2"
      />
      <circle
        cx={center - 0.6}
        cy={center - 0.6}
        r={inner}
        fill="none"
        stroke={theme.waxLo}
        strokeOpacity="0.7"
        strokeWidth="1.4"
      />
      <g className="font-fell" textAnchor="middle" fontSize={fontSize}>
        <text x={center - 0.7} y={center + fontSize * 0.34 - 0.7} fill={theme.waxHi} opacity="0.55">
          {initial}
        </text>
        <text x={center} y={center + fontSize * 0.34} fill={theme.waxLo} opacity="0.9">
          {initial}
        </text>
      </g>
      <ellipse
        cx={center - radius * 0.42}
        cy={center - radius * 0.5}
        rx={radius * 0.22}
        ry={radius * 0.1}
        transform={`rotate(-35 ${center - radius * 0.42} ${center - radius * 0.5})`}
        fill="#fff"
        opacity="0.22"
      />
    </g>
  );
}

type SealProps = { theme: Theme; initial: string; seed: number; className?: string };

export function WaxSeal({ theme, initial, seed, className }: SealProps) {
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden>
      <SealBody theme={theme} initial={initial} seed={seed} />
    </svg>
  );
}

export function HalfSeal({ theme, initial, seed, side, className }: SealProps & { side: "left" | "right" }) {
  const id = useId();
  const edge = side === "left" ? 0 : size;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden>
      <defs>
        <clipPath id={id}>
          <path d={`M${edge},0 L${center - 2},0 ${crackPath} L${center},${size} L${edge},${size} Z`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <SealBody theme={theme} initial={initial} seed={seed} />
        <path d={`M${crack[0][0]},${crack[0][1]} ${crackPath}`} fill="none" stroke={theme.waxLo} strokeWidth="1.6" />
      </g>
    </svg>
  );
}

export function seedFrom(text: string) {
  let h = 2166136261;

  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619);

  return h >>> 0;
}
