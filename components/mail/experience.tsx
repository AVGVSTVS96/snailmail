"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Theme } from "@/lib/theme";
import { themeStyle } from "@/lib/texture";
import { type Address, Envelope } from "./envelope";
import { HalfSeal } from "./seal";
import { type Letter, SheetContent } from "./sheet";

type Stage = "front" | "back" | "open" | "unfold" | "read";

export type Delivery = {
  token: string;
  theme: Theme;
  address: Address;
  letter: Letter;
  seed: number;
  initial: string;
  arrived: string;
  signedFrom: string;
  sealedLine: string;
  sealedOn: string;
};

const holdMs = 900;
const ringLength = 2 * Math.PI * 46;

function subscribeMotion(onChange: () => void) {
  const query = matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function subscribeNever() {
  return () => {};
}

function activate(action: () => void) {
  return (event: React.KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    action();
  };
}

export function Experience({ delivery }: { delivery: Delivery }) {
  const { theme, address, letter, seed, initial, token } = delivery;
  const [stage, setStage] = useState<Stage>("front");
  const [run, setRun] = useState(0);
  const [holding, setHolding] = useState(false);
  const reduced = useReducedMotion();
  const ring = useRef<SVGCircleElement>(null);
  const hold = useRef<number | null>(null);
  const envelopeLetter = useRef<HTMLDivElement>(null);
  const source = useRef<DOMRect | null>(null);
  const fold = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLElement>(null);
  const stageArea = useRef<HTMLDivElement>(null);
  const storageKey = `snailmail:read:${token}`;

  const readBefore = useSyncExternalStore(
    subscribeNever,
    () => localStorage.getItem(storageKey) !== null,
    () => false,
  );

  const autoUnfold = useEffectEvent(() => unfold());

  useEffect(() => {
    if (stage !== "open") return;
    const timer = setTimeout(autoUnfold, 4200);

    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "unfold") return;
    const timer = setTimeout(() => setStage("read"), reduced ? 350 : 1550);

    return () => clearTimeout(timer);
  }, [stage, reduced]);

  useEffect(() => {
    if (stage !== "read") return;
    localStorage.setItem(storageKey, "1");
  }, [stage, storageKey]);

  useLayoutEffect(() => {
    const from = source.current;
    const target = fold.current?.querySelector(".panel-mid")?.getBoundingClientRect();

    if (stage !== "unfold" || !from || !target || !fold.current || reduced) return;
    const scaleX = from.width / target.width;
    const scaleY = from.height / target.height;
    fold.current.animate(
      [
        {
          transform: `translate(${from.left - target.left}px, ${from.top - target.top}px) scale(${scaleX}, ${scaleY})`,
        },
        { transform: "none" },
      ],
      { duration: 600, easing: "cubic-bezier(.22,1,.36,1)" },
    );
  }, [stage, reduced]);

  function setRing(progress: number) {
    ring.current?.style.setProperty("stroke-dashoffset", String(ringLength * (1 - progress)));
  }

  function fitOpenEnvelope() {
    const room = stageArea.current?.clientHeight ?? 0;
    const width = stageArea.current?.querySelector(".ritual-envelope")?.clientWidth ?? 0;
    const openHeight = width * 1.088;
    const scale = openHeight > 0 ? Math.min(1, (room - 12) / openHeight) : 1;

    scene.current?.style.setProperty("--open-scale", String(scale));
  }

  function crack() {
    fitOpenEnvelope();
    hold.current = null;
    setHolding(false);
    navigator.vibrate?.(10);
    setStage("open");
  }

  function press() {
    if (stage !== "back" || hold.current !== null) return;

    if (reduced) return crack();
    setHolding(true);
    ring.current?.style.setProperty("transition", "none");
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / holdMs);
      setRing(progress);

      if (progress === 1) return crack();
      hold.current = requestAnimationFrame(tick);
    };

    hold.current = requestAnimationFrame(tick);
  }

  function release() {
    if (hold.current === null) return;
    cancelAnimationFrame(hold.current);
    hold.current = null;
    setHolding(false);
    ring.current?.style.setProperty("transition", "stroke-dashoffset 200ms ease-out");
    setRing(0);
  }

  function unfold() {
    if (stage !== "open") return;
    source.current = envelopeLetter.current?.getBoundingClientRect() ?? null;
    setStage("unfold");
  }

  function skip() {
    setStage("read");
  }

  function again() {
    window.scrollTo({ top: 0 });
    setStage("front");
    setRun((n) => n + 1);
  }

  const flipped = stage !== "front";
  const opened = stage === "open" || stage === "unfold";
  const ritual = stage !== "read";
  const label = stage === "front" ? delivery.arrived : stage === "back" ? "SEALED WITH WAX" : "";

  const hint =
    stage === "front"
      ? ["Tap to turn it over", delivery.signedFrom]
      : stage === "back"
        ? holding
          ? ["Keep holding…"]
          : reduced
            ? ["Tap the seal to break it"]
            : ["Press and hold the seal", "it breaks the way real wax does"]
        : stage === "open"
          ? ["Tap the letter to unfold it"]
          : [];

  return (
    <main className="desk" style={themeStyle(theme)} data-stage={stage}>
      {ritual && (
        <section
          ref={scene}
          className="ritual"
          data-flipped={flipped || undefined}
          data-opened={opened || undefined}
          data-holding={holding || undefined}
        >
          {readBefore && stage !== "unfold" && (
            <button type="button" className="skip" onClick={skip}>
              Skip to letter
            </button>
          )}
          <div className="ritual-label" key={`label-${label}`}>
            {label}
          </div>
          <div className="ritual-stage" ref={stageArea}>
            <div
              key={run}
              className="ritual-envelope"
              role="button"
              tabIndex={0}
              aria-label={
                stage === "front"
                  ? `Envelope from ${address.from}. Turn over.`
                  : stage === "open"
                    ? "Folded letter. Unfold it."
                    : "Envelope"
              }
              onClick={() => (stage === "front" ? setStage("back") : stage === "open" ? unfold() : undefined)}
              onKeyDown={activate(() =>
                stage === "front" ? setStage("back") : stage === "open" ? unfold() : undefined,
              )}
            >
              <Envelope
                theme={theme}
                address={address}
                seed={seed}
                initial={initial}
                letterRef={envelopeLetter}
                seal={
                  <button
                    type="button"
                    className="seal-button"
                    aria-label={reduced ? "Wax seal. Tap to open." : "Wax seal. Press and hold to open."}
                    disabled={stage !== "back"}
                    onPointerDown={(event) => {
                      event.currentTarget.setPointerCapture(event.pointerId);
                      press();
                    }}
                    onPointerUp={release}
                    onPointerCancel={release}
                    onContextMenu={(event) => event.preventDefault()}
                    onKeyDown={(event) => {
                      if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
                        event.preventDefault();
                        press();
                      }
                    }}
                    onKeyUp={release}
                  >
                    <svg viewBox="0 0 112 112" className="seal-ring" aria-hidden>
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        fill="none"
                        stroke={theme.ink}
                        strokeOpacity="0.28"
                        strokeWidth="1.5"
                      />
                      <circle
                        ref={ring}
                        cx="56"
                        cy="56"
                        r="46"
                        fill="none"
                        stroke={theme.ink}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={ringLength}
                        strokeDashoffset={ringLength}
                        transform="rotate(-90 56 56)"
                      />
                    </svg>
                  </button>
                }
              />
            </div>
          </div>
          <div className="ritual-hint" key={`hint-${hint.join()}`}>
            {hint[0] && <div className="hint-main">{hint[0]}</div>}
            {hint[1] && <div className="hint-sub">{hint[1]}</div>}
          </div>
        </section>
      )}

      {(stage === "unfold" || stage === "read") && (
        <section className="reading">
          {stage === "unfold" ? (
            <div className="fold" ref={fold} aria-hidden>
              {(["top", "mid", "bot"] as const).map((panel, i) => (
                <div key={panel} className={`panel panel-${panel}`}>
                  <div className="face face-front">
                    <div className="window" style={{ top: `calc(var(--panel) * ${-i})` }}>
                      <SheetContent letter={letter} initial={initial} />
                    </div>
                  </div>
                  {panel !== "mid" && (
                    <div className="face face-back">
                      {panel === "top" && <div className="env-letter-note font-caveat">for {address.to}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              <article className="sheet" aria-label={`A letter from ${address.from}`}>
                <SheetContent letter={letter} initial={initial} />
              </article>
              <div className="sealed-line">{delivery.sealedLine}</div>
              <section className="keep">
                <div className="keep-seal" aria-hidden>
                  <HalfSeal theme={theme} initial={initial} seed={seed} side="left" className="keep-half keep-left" />
                  <HalfSeal theme={theme} initial={initial} seed={seed} side="right" className="keep-half keep-right" />
                </div>
                <h2 className="keep-title">Yours to keep.</h2>
                <p className="keep-text">
                  {address.from} sealed this letter for you on {delivery.sealedOn}. Only people with this link can open
                  it.
                </p>
                <button type="button" className="keep-primary" onClick={() => window.print()}>
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14" />
                  </svg>
                  Keep a copy
                </button>
                <button type="button" className="keep-secondary" onClick={again}>
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
                  </svg>
                  Open it again
                </button>
                <p className="keep-note">Saves the letter as a PDF, just as it looks here</p>
              </section>
              <footer className="credit">
                <div className="credit-rule" />
                <div className="credit-label">MAIL ART INSPIRED BY</div>
                <a
                  className="credit-title"
                  href="https://www.penguin.co.uk/books/481503"
                  target="_blank"
                  rel="noreferrer"
                >
                  The Art of Snail Mail
                </a>
                <div className="credit-by">by Martina Calvi · Quadrille, 2026</div>
                <Link className="credit-site" href="/">
                  snailmail
                </Link>
              </footer>
            </>
          )}
        </section>
      )}
    </main>
  );
}
