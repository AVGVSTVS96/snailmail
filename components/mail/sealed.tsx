import { themeStyle } from "@/lib/texture";
import type { Theme } from "@/lib/theme";

import { WaxSeal } from "./seal";

const W = 346;
const H = 235;
const flap = 141;

export const SealedEnvelope = ({
  theme,
  from,
  initial,
  seed,
  className,
}: {
  theme: Theme;
  from: string | null;
  initial: string;
  seed: number;
  className?: string;
}) => {
  const edge = `M0,0 L${W / 2 - 14},${flap - 8} Q${W / 2},${flap + 2} ${W / 2 + 14},${flap - 8} L${W},0`;

  return (
    <div
      className={`sealed ${className ?? ""}`}
      style={themeStyle(theme)}
      data-light={theme.darkDesk ? undefined : ""}
    >
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <path
          d={`M0,${H} L${W / 2},${H * 0.46} L${W},${H}`}
          fill="none"
          stroke="rgba(0,0,0,0.10)"
        />
        <path
          d={`M0,${H} L${W * 0.42},${H * 0.52} L${W / 2},${H * 0.46} L${W * 0.58},${H * 0.52} L${W},${H} Z`}
          fill="rgba(0,0,0,0.035)"
        />
        <path d={`${edge} Z`} fill="rgba(0,0,0,0.12)" transform="translate(0,3)" />
        <path d={`${edge} Z`} fill={theme.envelopeShade} />
        <path d={edge} fill="none" stroke="rgba(255,255,255,0.4)" />
        {from && (
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
        )}
      </svg>
      <WaxSeal theme={theme} initial={initial} seed={seed} className="sealed-seal" />
    </div>
  );
};
