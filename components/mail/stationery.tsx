import type { Theme } from "@/lib/theme";

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

export function Stamp({ theme }: { theme: Theme }) {
  const { paper, art, caption } = theme.stamp;

  return (
    <g>
      <rect width={stampW} height={stampH} fill="#FBF8F1" />
      <rect x="5" y="5" width={stampW - 10} height={stampH - 10} fill={paper} />
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
      <text
        x={stampW / 2}
        y={stampH - 9}
        textAnchor="middle"
        className="font-geist-mono"
        fontSize="6.4"
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
