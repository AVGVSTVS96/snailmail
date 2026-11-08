import { useId } from "react";

import type { EmblemKey, Theme } from "@/lib/theme";

const random = (seed: number) => {
  let a = seed >>> 0;

  return () => {
    a = (a + 0x6d_2b_79_f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const blob = (cx: number, cy: number, r: number, seed: number) => {
  const draw = random(seed);
  const turn = () => draw() * Math.PI * 2;
  const phase = [turn(), turn(), turn(), turn()] as const;

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
};

const size = 84;
const center = size / 2;
const radius = size * 0.44;
const inner = radius * 0.66;

const crackStart = [center - 2, center - radius] as const;

const crack: readonly (readonly [number, number])[] = [
  crackStart,
  [center + 3, center - radius * 0.45],
  [center - 3, center - radius * 0.05],
  [center + 4, center + radius * 0.4],
  [center, center + radius],
];

const crackPath = crack.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

const emblemPaths = {
  heart: "M0,6 C-9,-1 -9,-9 -4,-10 C-1,-11 0,-8 0,-7 C0,-8 1,-11 4,-10 C9,-9 9,-1 0,6 Z",
  star: "M0,-10 L2.6,-3.2 L9.5,-3.1 L4,1.3 L5.9,8.1 L0,4.1 L-5.9,8.1 L-4,1.3 L-9.5,-3.1 L-2.6,-3.2 Z",
  moon: "M2,-10 C-4,-10 -9,-5 -9,1 C-9,6 -5,10 1,10 C5,10 8,8 9,5 C6,7 1,7 -2,4 C-5,1 -5,-5 2,-10 Z",
};

export const Emblem = ({ kind }: { kind: Exclude<EmblemKey, "initial"> }) => {
  if (kind === "flower") {
    return (
      <g>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="0" cy="-5.2" rx="3.1" ry="5" transform={`rotate(${a})`} />
        ))}
      </g>
    );
  }

  if (kind === "snail") {
    return (
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        transform="translate(-1 -1)"
      >
        <path d="M-10,8 L10,8 C13,8 14,5 12,3" />
        <path d="M-10,8 C-12,2 -7,-8 1,-8 C9,-8 11,0 6,4 C2,7 -4,5 -4,0 C-4,-4 2,-5 3,-2" />
      </g>
    );
  }

  return <path d={emblemPaths[kind]} />;
};

const Impression = ({ theme, initial }: { theme: Theme; initial: string }) => {
  const kind = theme.style.emblem;

  if (kind === "initial") {
    const fontSize = Math.round(inner * 1.25);

    return (
      <g className="font-fell" textAnchor="middle" fontSize={fontSize}>
        <text x={center - 0.7} y={center + fontSize * 0.34 - 0.7} fill={theme.waxHi} opacity="0.55">
          {initial}
        </text>
        <text x={center} y={center + fontSize * 0.34} fill={theme.waxLo} opacity="0.9">
          {initial}
        </text>
      </g>
    );
  }

  const k = inner / 15;

  return (
    <g>
      <g
        transform={`translate(${center - 0.6},${center - 0.6}) scale(${k})`}
        fill={theme.waxHi}
        color={theme.waxHi}
        opacity="0.55"
      >
        <Emblem kind={kind} />
      </g>
      <g
        transform={`translate(${center},${center}) scale(${k})`}
        fill={theme.waxLo}
        color={theme.waxLo}
        opacity="0.85"
      >
        <Emblem kind={kind} />
        {kind === "flower" && <circle r="2.6" fill={theme.wax} />}
      </g>
    </g>
  );
};

const SealBody = ({ theme, initial, seed }: { theme: Theme; initial: string; seed: number }) => {
  const id = useId();

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
      <Impression theme={theme} initial={initial} />
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
};

interface SealProps {
  theme: Theme;
  initial: string;
  seed: number;
  className?: string;
}

export const WaxSeal = ({ theme, initial, seed, className }: SealProps) => (
  <svg viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden>
    <SealBody theme={theme} initial={initial} seed={seed} />
  </svg>
);

export const HalfSeal = ({
  theme,
  initial,
  seed,
  side,
  className,
}: SealProps & { side: "left" | "right" }) => {
  const id = useId();
  const edge = side === "left" ? 0 : size;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden>
      <defs>
        <clipPath id={id}>
          <path
            d={`M${edge},0 L${center - 2},0 ${crackPath} L${center},${size} L${edge},${size} Z`}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <SealBody theme={theme} initial={initial} seed={seed} />
        <path
          d={`M${crackStart[0]},${crackStart[1]} ${crackPath}`}
          fill="none"
          stroke={theme.waxLo}
          strokeWidth="1.6"
        />
      </g>
    </svg>
  );
};
