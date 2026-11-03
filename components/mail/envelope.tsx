import { useId } from "react";
import type { Theme } from "@/lib/theme";
import { HalfSeal, WaxSeal } from "./seal";
import { Postmark, Stamp } from "./stationery";

export const W = 346;
export const H = 235;
const flapH = 141;
const vee = H * 0.46;

export type Address = {
  to: string;
  toPlace: string;
  from: string;
  openWhen: string | null;
  postmark: { city: string; date: string; year: string };
};

function Front({ theme, address }: { theme: Theme; address: Address }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
      {address.openWhen && (
        <g>
          <text
            x="24"
            y="30"
            className="font-geist-mono"
            fontSize="8.5"
            letterSpacing="1.2"
            fill={theme.inkSoft}
            opacity="0.8"
          >
            OPEN WHEN
          </text>
          <text x="24" y="50" className="font-caveat" fontSize="18" fill={theme.ink}>
            {address.openWhen}
          </text>
        </g>
      )}
      <g transform={`translate(${W - 18 - 62} 18) rotate(2.5 30 36)`}>
        <Stamp theme={theme} />
      </g>
      <g transform={`translate(${W - 60 - 150} 26) rotate(-9 75 34)`}>
        <g className="postmark">
          <g opacity="0.72">
            <Postmark ink={theme.postmarkInk} {...address.postmark} />
          </g>
        </g>
      </g>
      <text x={W * 0.27} y="153" className="font-delafield" fontSize="62" fill={theme.ink}>
        {address.to}
      </text>
      <text x={W * 0.27} y="190" className="font-caveat" fontSize="19" fill={theme.ink} opacity="0.85">
        {address.toPlace}
      </text>
    </svg>
  );
}

function Pocket({ theme, from }: { theme: Theme; from: string }) {
  const id = useId();
  const outline = `M0,0 L${W / 2},${vee} L${W},0 L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="env-pocket" aria-hidden>
      <defs>
        <Grain id={`${id}g`} theme={theme} />
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.10" />
          <stop offset="1" stopColor="#000" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <path
        d={`M0,2 L${W / 2},${vee + 2} L${W},2`}
        fill="none"
        stroke="#000"
        strokeOpacity="0.22"
        strokeWidth="5"
        style={{ filter: "blur(3px)" }}
      />
      <path d={outline} fill={theme.envelope} />
      <path d={outline} fill={theme.envelope} filter={`url(#${id}g)`} />
      <path d={outline} fill={`url(#${id}l)`} />
      <path d={`M0,${H} L${W * 0.42},${vee + H * 0.08} L${W / 2},${vee}`} fill="none" stroke="rgba(0,0,0,0.09)" />
      <path d={`M${W},${H} L${W * 0.58},${vee + H * 0.08} L${W / 2},${vee}`} fill="none" stroke="rgba(0,0,0,0.09)" />
      <path d={`M0,0 L${W / 2},${vee} L${W},0`} fill="none" stroke="rgba(255,255,255,0.5)" />
      <text
        x={W / 2}
        y={H * 0.86}
        textAnchor="middle"
        className="font-caveat"
        fontSize="19"
        fill={theme.ink}
        opacity="0.85"
      >
        from {from}
      </text>
    </svg>
  );
}

function Grain({ id, theme }: { id: string; theme: Theme }) {
  const [r, g, b] = theme.grain;

  return (
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" result="n" />
      <feColorMatrix in="n" values={`0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 0.14 0`} result="c" />
      <feComposite in="c" in2="SourceAlpha" operator="in" />
    </filter>
  );
}

function Dots({ id, theme }: { id: string; theme: Theme }) {
  return (
    <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill={theme.liner} />
      <circle cx="3.5" cy="3.5" r="1.3" fill={theme.linerInk} fillOpacity="0.55" />
      <circle cx="10.5" cy="10.5" r="1.3" fill={theme.linerInk} fillOpacity="0.55" />
    </pattern>
  );
}

function Inside({ theme }: { theme: Theme }) {
  const id = useId();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <Dots id={`${id}d`} theme={theme} />
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={theme.envelopeShade} />
      <rect x="14" width={W - 28} height={H - 10} fill={`url(#${id}d)`} />
      <rect width={W} height={H} fill={`url(#${id}s)`} />
    </svg>
  );
}

function FlapOutside({ theme }: { theme: Theme }) {
  const d = `M0,0 L${W / 2 - 14},${flapH - 8} Q${W / 2},${flapH + 2} ${W / 2 + 14},${flapH - 8} L${W},0`;

  return (
    <svg viewBox={`0 0 ${W} ${flapH + 6}`} className="flap-face flap-outside" aria-hidden>
      <path d={`${d} Z`} fill="rgba(0,0,0,0.12)" transform="translate(0,3)" />
      <path d={`${d} Z`} fill={theme.envelopeShade} />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.4)" />
    </svg>
  );
}

function FlapInside({ theme }: { theme: Theme }) {
  const id = useId();
  const h = flapH + 6;
  const outer = `M0,${h} L${W / 2 - 14},14 Q${W / 2},4 ${W / 2 + 14},14 L${W},${h} Z`;
  const lining = `M14,${h} L${W / 2 - 11},22 Q${W / 2},14 ${W / 2 + 11},22 L${W - 14},${h} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="flap-face flap-inside" aria-hidden>
      <defs>
        <Dots id={`${id}d`} theme={theme} />
        <Grain id={`${id}g`} theme={theme} />
      </defs>
      <path d={outer} fill={theme.envelopeShade} />
      <path d={outer} fill={theme.envelopeShade} filter={`url(#${id}g)`} />
      <path d={lining} fill={`url(#${id}d)`} />
    </svg>
  );
}

type EnvelopeProps = {
  theme: Theme;
  address: Address;
  seed: number;
  initial: string;
  seal?: React.ReactNode;
  letterRef?: React.Ref<HTMLDivElement>;
  onLetter?: () => void;
};

export function Envelope({ theme, address, seed, initial, seal, letterRef, onLetter }: EnvelopeProps) {
  return (
    <div className="envelope">
      <div className="env-mover">
        <div className="env-flipper">
          <div className="env-face env-front">
            <Front theme={theme} address={address} />
          </div>
          <div className="env-face env-back">
            <Inside theme={theme} />
            <div className="env-letter" ref={letterRef} onClick={onLetter}>
              <div className="env-letter-note font-caveat">for {address.to}</div>
            </div>
            <Pocket theme={theme} from={address.from} />
            <div className="env-flap">
              <FlapOutside theme={theme} />
              <FlapInside theme={theme} />
            </div>
            <div className="env-seal">
              {seal}
              <WaxSeal theme={theme} initial={initial} seed={seed} className="seal-whole" />
              <HalfSeal theme={theme} initial={initial} seed={seed} side="left" className="seal-half seal-left" />
              <HalfSeal theme={theme} initial={initial} seed={seed} side="right" className="seal-half seal-right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { flapH, vee };
