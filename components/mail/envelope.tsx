import { useId } from "react";

import type { Address } from "@/lib/delivery";
import type { Theme } from "@/lib/theme";

import { HalfSeal, WaxSeal } from "./seal";
import { Postmark, SprigArt, Stamp } from "./stationery";

export const W = 346;
export const H = 235;
const flapH = 141;
const vee = H * 0.46;

const AddressName = ({ theme, to }: { theme: Theme; to: string }) => {
  const x = W * 0.27;
  const fill = theme.envelopeInk;

  if (theme.address === "typewriter") {
    return (
      <text
        x={x}
        y="124"
        className="font-courier"
        fontWeight="700"
        fontSize="22"
        letterSpacing="0.44"
        fill={fill}
      >
        {to.toUpperCase()}
      </text>
    );
  }

  if (theme.address === "display") {
    return (
      <text
        x={x}
        y="138"
        className="font-cormorant"
        fontStyle="italic"
        fontWeight="500"
        fontSize="44"
        fill={fill}
      >
        {to}
      </text>
    );
  }

  if (theme.address === "letterpress") {
    return (
      <text x={x} y="136" className="font-fell" fontStyle="italic" fontSize="40" fill={fill}>
        {to}
      </text>
    );
  }

  return (
    <text x={x} y="153" className="font-delafield" fontSize="62" fill={fill}>
      {to}
    </text>
  );
};

const placeLines = {
  script: { y: 190, size: 19, font: "font-caveat" },
  typewriter: { y: 146, size: 13, font: "font-courier" },
  display: { y: 162, size: 16, font: "font-cormorant" },
  letterpress: { y: 160, size: 15, font: "font-fell" },
};

const Airmail = ({ theme }: { theme: Theme }) => {
  const id = useId();
  const b = 8;

  return (
    <g>
      <defs>
        <pattern
          id={id}
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="32" height="32" fill={theme.envelope} />
          <rect width="10" height="32" fill="#C33A3A" />
          <rect x="16" width="10" height="32" fill="#23407A" />
        </pattern>
      </defs>
      <path
        d={`M0,0 H${W} V${H} H0 Z M${b},${b} V${H - b} H${W - b} V${b} Z`}
        fill={`url(#${id})`}
        fillRule="evenodd"
      />
      <g transform={`translate(24 ${H - 22 - 17})`}>
        <rect width="154" height="17" rx="2" fill="none" stroke="#23407A" strokeWidth="1.2" />
        <text
          x="77"
          y="11.6"
          textAnchor="middle"
          textLength="140"
          lengthAdjust="spacing"
          className="font-geist-mono"
          fontWeight="600"
          fontSize="8.5"
          letterSpacing="1"
          fill="#23407A"
        >
          PAR AVION · BY AIR MAIL
        </text>
      </g>
    </g>
  );
};

const Front = ({ theme, address }: { theme: Theme; address: Address }) => {
  const place = placeLines[theme.address];
  const label = theme.envelopeInk === theme.ink ? theme.inkSoft : theme.envelopeInk;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
      {theme.airmail && <Airmail theme={theme} />}
      {address.openWhen && (
        <g>
          <text
            x="24"
            y="30"
            className="font-geist-mono"
            fontSize="8.5"
            letterSpacing="1.2"
            fill={label}
            opacity="0.8"
          >
            OPEN WHEN
          </text>
          <text x="24" y="50" className="font-caveat" fontSize="18" fill={theme.envelopeInk}>
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
      <AddressName theme={theme} to={address.to} />
      <text
        x={W * 0.27}
        y={place.y}
        className={place.font}
        fontSize={place.size}
        fill={theme.envelopeInk}
        opacity="0.85"
      >
        {address.toPlace}
      </text>
      {theme.sprig && (
        <g transform={`translate(10 ${H - 92}) rotate(-14 22 40)`}>
          <svg width="56" height="75" viewBox="0 0 90 120">
            <SprigArt />
          </svg>
        </g>
      )}
    </svg>
  );
};

const Pocket = ({ theme, from }: { theme: Theme; from: string }) => {
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
      <path
        d={`M0,${H} L${W * 0.42},${vee + H * 0.08} L${W / 2},${vee}`}
        fill="none"
        stroke="rgba(0,0,0,0.09)"
      />
      <path
        d={`M${W},${H} L${W * 0.58},${vee + H * 0.08} L${W / 2},${vee}`}
        fill="none"
        stroke="rgba(0,0,0,0.09)"
      />
      <path d={`M0,0 L${W / 2},${vee} L${W},0`} fill="none" stroke="rgba(255,255,255,0.5)" />
      <text
        x={W / 2}
        y={H * 0.86}
        textAnchor="middle"
        className="font-caveat"
        fontSize="19"
        fill={theme.envelopeInk}
        opacity="0.85"
      >
        from {from}
      </text>
    </svg>
  );
};

const Grain = ({ id, theme }: { id: string; theme: Theme }) => {
  const [r, g, b] = theme.grain;

  return (
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" result="n" />
      <feColorMatrix
        in="n"
        values={`0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 0.14 0`}
        result="c"
      />
      <feComposite in="c" in2="SourceAlpha" operator="in" />
    </filter>
  );
};

export const Liner = ({ id, theme }: { id: string; theme: Theme }) => {
  const c = theme.liner;
  const i = theme.linerInk;
  const kind = theme.style.liner;

  if (kind === "stripes") {
    return (
      <pattern id={id} width="27" height="27" patternUnits="userSpaceOnUse">
        <rect width="27" height="27" fill={c} />
        <g transform="rotate(45 13.5 13.5)">
          <rect x="-20" y="9" width="70" height="6" fill="#C33A3A" />
          <rect x="-20" y="21" width="70" height="6" fill={i} />
          <rect x="-20" y="-3" width="70" height="6" fill={i} />
        </g>
      </pattern>
    );
  }

  if (kind === "sprigs") {
    return (
      <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill={c} />
        <g fill="none" stroke={i} strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round">
          <path d="M8,30 C12,22 16,16 22,10" />
          <path d="M12,23 C9,21 8,18 9,16 M15,18 C18,18 20,16 21,14 M17,15 C15,12 15,10 16,8" />
        </g>
        <circle cx="32" cy="30" r="1.4" fill={i} fillOpacity="0.5" />
      </pattern>
    );
  }

  if (kind === "stars") {
    return (
      <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse">
        <rect width="36" height="36" fill={c} />
        <g fill={i} fillOpacity="0.8">
          <circle cx="6" cy="8" r="0.9" />
          <circle cx="26" cy="5" r="0.6" />
          <circle cx="18" cy="22" r="1.1" />
          <circle cx="31" cy="29" r="0.7" />
          <circle cx="5" cy="30" r="0.6" />
        </g>
      </pattern>
    );
  }

  if (kind === "marble") {
    return (
      <pattern id={id} width="400" height="400" patternUnits="userSpaceOnUse">
        <filter id={`${id}m`} x="0" y="0" width="1" height="1">
          <feTurbulence type="turbulence" baseFrequency="0.012 0.03" numOctaves="4" seed="9" />
          <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 -2.4 1.2" />
        </filter>
        <rect width="400" height="400" fill={c} />
        <rect width="400" height="400" filter={`url(#${id}m)`} opacity="0.55" />
      </pattern>
    );
  }

  if (kind === "none") {
    return (
      <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill={theme.envelopeShade} />
      </pattern>
    );
  }

  return (
    <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill={c} />
      <circle cx="3.5" cy="3.5" r="1.3" fill={i} fillOpacity="0.55" />
      <circle cx="10.5" cy="10.5" r="1.3" fill={i} fillOpacity="0.55" />
    </pattern>
  );
};

const Inside = ({ theme }: { theme: Theme }) => {
  const id = useId();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <Liner id={`${id}d`} theme={theme} />
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
};

const FlapOutside = ({ theme }: { theme: Theme }) => {
  const d = `M0,0 L${W / 2 - 14},${flapH - 8} Q${W / 2},${flapH + 2} ${W / 2 + 14},${flapH - 8} L${W},0`;

  return (
    <svg viewBox={`0 0 ${W} ${flapH + 6}`} className="flap-face flap-outside" aria-hidden>
      <path d={`${d} Z`} fill="rgba(0,0,0,0.12)" transform="translate(0,3)" />
      <path d={`${d} Z`} fill={theme.envelopeShade} />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.4)" />
    </svg>
  );
};

const FlapInside = ({ theme }: { theme: Theme }) => {
  const id = useId();
  const h = flapH + 6;
  const outer = `M0,${h} L${W / 2 - 14},14 Q${W / 2},4 ${W / 2 + 14},14 L${W},${h} Z`;
  const lining = `M14,${h} L${W / 2 - 11},22 Q${W / 2},14 ${W / 2 + 11},22 L${W - 14},${h} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="flap-face flap-inside" aria-hidden>
      <defs>
        <Liner id={`${id}d`} theme={theme} />
        <Grain id={`${id}g`} theme={theme} />
      </defs>
      <path d={outer} fill={theme.envelopeShade} />
      <path d={outer} fill={theme.envelopeShade} filter={`url(#${id}g)`} />
      <path d={lining} fill={`url(#${id}d)`} />
    </svg>
  );
};

interface EnvelopeProps {
  theme: Theme;
  address: Address;
  seed: number;
  initial: string;
  seal?: React.ReactNode;
  letterRef?: React.Ref<HTMLDivElement>;
  onLetter?: () => void;
}

export const Envelope = ({
  theme,
  address,
  seed,
  initial,
  seal,
  letterRef,
  onLetter,
}: EnvelopeProps) => (
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
            <HalfSeal
              theme={theme}
              initial={initial}
              seed={seed}
              side="left"
              className="seal-half seal-left"
            />
            <HalfSeal
              theme={theme}
              initial={initial}
              seed={seed}
              side="right"
              className="seal-half seal-right"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export { flapH, vee };
