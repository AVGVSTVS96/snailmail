import type { StampKey, Theme } from "@/lib/theme";
import { Emblem } from "./seal";

const stampW = 60;
const stampH = 72;

function perforations() {
  const r = 2;
  const across = Math.floor(stampW / 7.68);
  const down = Math.floor(stampH / 7.68);
  const holes: Array<readonly [number, number]> = [];

  for (let i = 0; i <= across; i++) holes.push([(i * stampW) / across, 0], [(i * stampW) / across, stampH]);

  for (let i = 0; i <= down; i++) holes.push([0, (i * stampH) / down], [stampW, (i * stampH) / down]);

  return holes.map(([x, y], i) => <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r} />);
}

const moonStars = [
  [-14, -14, 0.9],
  [12, -16, 0.7],
  [15, 4, 1],
  [-10, 12, 0.7],
  [6, 14, 0.6],
] as const;

function StampArt({ kind, art }: { kind: StampKey; art: string }) {
  if (kind === "swallow")
    return (
      <g transform={`translate(${stampW / 2},${stampH / 2})`} fill={art}>
        <path d="M-17,-6 C-8,-4 -3,0 0,3 C4,-2 10,-6 19,-9 C13,-3 8,2 4,6 C8,7 12,11 14,16 C8,12 3,10 -1,9 C-6,9 -10,6 -12,2 C-14,-1 -16,-3 -17,-6 Z" />
      </g>
    );

  if (kind === "poppy")
    return (
      <g transform={`translate(${stampW / 2},${stampH / 2 + 4})`}>
        <path d="M0,16 C0,8 1,2 0,-4" stroke="#5C6B4A" strokeWidth="1.4" fill="none" />
        <path d="M0,10 C-6,6 -9,7 -11,9 C-7,11 -3,11 0,10" fill="#5C6B4A" />
        <g fill={art}>
          <ellipse cx="-5" cy="-9" rx="7" ry="6" />
          <ellipse cx="5" cy="-9" rx="7" ry="6" />
          <ellipse cx="0" cy="-13" rx="6" ry="5.5" />
        </g>
        <circle cx="0" cy="-9" r="2.4" fill="#2E2622" />
      </g>
    );

  if (kind === "moon")
    return (
      <g transform={`translate(${stampW / 2},${stampH / 2})`} fill={art}>
        {moonStars.map(([x, y, r]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={r} />
        ))}
        <g transform="scale(1.3)">
          <Emblem kind="moon" />
        </g>
      </g>
    );

  if (kind === "heart")
    return (
      <g transform={`translate(${stampW / 2},${stampH / 2 + 1}) scale(1.6)`} fill={art}>
        <Emblem kind="heart" />
      </g>
    );

  if (kind === "bridge")
    return (
      <g transform={`translate(${stampW / 2},${stampH / 2 + 6})`} stroke={art} strokeWidth="1.4" fill="none">
        <path d="M-20,4 L20,4" />
        <path d="M-9,4 L-9,-18 M-5,4 L-5,-18 M5,4 L5,-18 M9,4 L9,-18" />
        <path d="M-20,-2 C-14,-4 -10,-12 -7,-16 C-2,-6 2,-6 7,-16 C10,-12 14,-4 20,-2" />
      </g>
    );

  return (
    <g
      transform={`translate(${stampW / 2},${stampH / 2 + 2})`}
      fill="none"
      stroke={art}
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M-14,10 L14,10 C18,10 19,6 16,4" />
      <path d="M-14,10 C-16,2 -10,-10 1,-10 C11,-10 14,0 8,5 C3,9 -5,6 -5,0 C-5,-5 2,-6 3,-2" />
      <path d="M14,10 L17,-1 M17,-1 L15,-5 M17,-1 L20,-4" />
    </g>
  );
}

export function Stamp({ theme }: { theme: Theme }) {
  const { kind, paper, art, caption } = theme.stamp;

  return (
    <g>
      <rect width={stampW} height={stampH} fill="#FBF8F1" />
      <rect x="5" y="5" width={stampW - 10} height={stampH - 10} fill={paper} />
      <StampArt kind={kind} art={art} />
      <text
        x={stampW / 2}
        y={stampH - 9}
        textAnchor="middle"
        className="font-geist-mono"
        fontSize={caption.length > 6 ? 5.6 : 6.4}
        letterSpacing="0.8"
        fill={art}
      >
        {caption}
      </text>
      <text x="9" y="14" className="font-fell" fontSize="9" fill={art}>
        2¢
      </text>
      <g fill={theme.envelope}>{perforations()}</g>
    </g>
  );
}

export function Postmark({ ink, city, date, year }: { ink: string; city: string; date: string; year: string }) {
  const waves = [14, 24, 34, 44, 54].map((y) => (
    <path
      key={y}
      d={`M40,${y} C48,${y - 4} 56,${y + 4} 64,${y} C72,${y - 4} 80,${y + 4} 88,${y} C92,${y - 2} 94,${y} 96,${y}`}
    />
  ));

  return (
    <g>
      <g fill="none" stroke={ink} strokeWidth="1.4">
        {waves}
        <circle cx="116" cy="34" r="30" />
        <circle cx="116" cy="34" r="26.5" strokeWidth="0.8" />
      </g>
      <g className="font-geist-mono" textAnchor="middle" fill={ink}>
        <text x="116" y="22" fontSize="6.4" letterSpacing="0.6">
          {city}
        </text>
        <text x="116" y="38" fontSize="11" fontWeight="600">
          {date}
        </text>
        <text x="116" y="50" fontSize="7" letterSpacing="1">
          {year}
        </text>
      </g>
    </g>
  );
}

export function Emboss({ initial }: { initial: string }) {
  return (
    <div className="emboss" aria-hidden>
      {initial}
    </div>
  );
}

const sprigLeaves = [
  [92, -1],
  [78, 1],
  [64, -1],
  [50, 1],
  [38, -1],
] as const;

export function SprigArt() {
  const stem = "#5C6B4A";
  const petal = "#C4918A";
  const center = "#C9A24A";

  return (
    <g>
      <path d="M38,118 C40,96 42,70 50,24" stroke={stem} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M44,60 C52,52 58,50 66,50" stroke={stem} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {sprigLeaves.map(([y, side], i) => {
        const x = 40 + (100 - y) * 0.12 + side * 9;

        return (
          <ellipse
            key={y}
            cx={x.toFixed(1)}
            cy={y}
            rx="9"
            ry="3.6"
            transform={`rotate(${side * -35} ${x.toFixed(1)} ${y})`}
            fill={stem}
            opacity={(0.85 - i * 0.08).toFixed(2)}
          />
        );
      })}
      <g transform="translate(51,20)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-7" rx="4.6" ry="7" transform={`rotate(${a})`} fill={petal} opacity="0.92" />
        ))}
        <circle r="3.4" fill={center} />
      </g>
      <g transform="translate(68,48)">
        {[36, 108, 180, 252, 324].map((a) => (
          <ellipse key={a} cx="0" cy="-4.5" rx="3" ry="4.6" transform={`rotate(${a})`} fill={petal} opacity="0.75" />
        ))}
        <circle r="2.2" fill={center} />
      </g>
    </g>
  );
}

export function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 120" className={className} aria-hidden>
      <SprigArt />
    </svg>
  );
}
