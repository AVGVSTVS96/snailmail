"use client";

import Link from "next/link";
import { flushSync } from "react-dom";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Theme } from "@/lib/theme";
import { looksFoldable, watchFold } from "@/lib/fold";
import { tap } from "@/lib/haptics";
import { deskProps } from "@/lib/texture";
import { type Address, Envelope } from "./envelope";
import { HalfSeal } from "./seal";
import { type Letter, SheetContent, type Words } from "./sheet";

export type Stage = "front" | "back" | "open" | "unfold" | "read";

export type Delivery = {
  token: string;
  theme: Theme;
  address: Address;
  letter: Omit<Letter, keyof Words>;
  words?: Words;
  seed: number;
  initial: string;
  arrived: string;
  signedFrom: string;
  sealedLine: string;
  sealedOn: string;
};

const holdMs = 900;
const ringLength = 2 * Math.PI * 46;

const tableQuery = "(min-width: 600px) and (min-height: 480px)";
const foldableKey = "snailmail:foldable";

function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = matchMedia(query);
      list.addEventListener("change", onChange);

      return () => list.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
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

export function Experience({ delivery, start = "front" }: { delivery: Delivery; start?: Stage }) {
  const { theme, address, seed, initial, token } = delivery;
  const [stage, setStage] = useState<Stage>(start);
  const [words, setWords] = useState(delivery.words ?? null);
  const loading = useRef<Promise<boolean> | null>(null);
  const [run, setRun] = useState(0);
  const [holding, setHolding] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const table = useMedia(tableQuery);
  const [unfoldedHere, setUnfoldedHere] = useState(false);
  const ring = useRef<SVGCircleElement>(null);
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

  const foldableBefore = useSyncExternalStore(
    subscribeNever,
    () => localStorage.getItem(foldableKey) !== null || looksFoldable(),
    () => false,
  );

  const unfoldNext = (unfoldedHere || foldableBefore) && !table;

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.surface);
  }, [theme.surface]);

  const autoUnfold = useEffectEvent(() => unfold());

  const finishUnfold = useEffectEvent(() => change(() => setStage("read")));

  useEffect(() => {
    if (stage !== "open" || unfoldNext) return;
    const timer = setTimeout(autoUnfold, 4200);

    return () => clearTimeout(timer);
  }, [stage, unfoldNext]);

  const refit = useEffectEvent(() => fitOpenEnvelope());

  useEffect(() => {
    if (stage !== "open" || !stageArea.current) return;
    const observer = new ResizeObserver(refit);
    observer.observe(stageArea.current);

    return () => observer.disconnect();
  }, [stage]);

  useEffect(() => {
    if (stage !== "unfold") return;
    const timer = setTimeout(finishUnfold, reduced ? 350 : 1550);

    return () => clearTimeout(timer);
  }, [stage, reduced]);

  const onUnfold = useEffectEvent(() => {
    localStorage.setItem(foldableKey, "1");
    setUnfoldedHere(true);
    unfold();
  });

  useEffect(() => watchFold((fold) => fold === "unfold" && onUnfold()), []);

  useEffect(() => {
    if (stage !== "read") return;
    localStorage.setItem(storageKey, "1");
  }, [stage, storageKey]);

  useEffect(() => {
    if (stage !== "read" || reduced) return;

    const below = [...document.querySelectorAll(".sheet-sign, .sheet-drawn, .keep")].filter(
      (element) => element.getBoundingClientRect().top > innerHeight,
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    for (const element of below) {
      element.setAttribute("data-waiting", "");
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [stage, reduced]);

  useLayoutEffect(() => {
    const from = source.current;
    const target = fold.current?.querySelector(".panel-mid")?.getBoundingClientRect();

    if (stage !== "unfold" || !from || !target || !fold.current || reduced) return;
    const scaleX = from.width / target.width;
    const scaleY = from.height / target.height;
    const x = from.left + from.width / 2 - (target.left + target.width / 2);
    const y = from.top + from.height / 2 - (target.top + target.height / 2);
    const timing = { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };

    fold.current.animate(
      [{ transform: `translate(${x}px, ${y}px) rotate(-1deg) scale(${scaleX}, ${scaleY})` }, { transform: "none" }],
      timing,
    );
    fold.current
      .querySelector(".env-letter-note")
      ?.animate([{ transform: `scaleY(${scaleX / scaleY})` }, { transform: "none" }], timing);
  }, [stage, reduced]);

  function load() {
    loading.current ??= fetch(`/l/${token}/letter`, { method: "POST", cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (written: Words | null) => {
          if (written) setWords(written);
          else loading.current = null;

          return written !== null;
        },
        () => {
          loading.current = null;

          return false;
        },
      );

    return loading.current;
  }

  function withWords(action: () => void) {
    if (words) return action();
    void load().then((loaded) => loaded && action());
  }

  function change(update: () => void, crossfade = reduced) {
    if (!crossfade || !("startViewTransition" in document)) return update();
    document.startViewTransition(() => flushSync(update)).ready.catch(() => {});
  }

  function fillRing(full: boolean) {
    const circle = ring.current;

    if (!circle) return;
    const left = Number.parseFloat(getComputedStyle(circle).strokeDashoffset) / ringLength;

    circle.style.transition = full
      ? `stroke-dashoffset ${Math.round(holdMs * left)}ms linear`
      : "stroke-dashoffset 200ms cubic-bezier(0.23, 1, 0.32, 1)";
    circle.style.strokeDashoffset = full ? "0" : String(ringLength);
  }

  function ringFilled(event: React.TransitionEvent<SVGCircleElement>) {
    if (!holding || event.propertyName !== "stroke-dashoffset") return;

    if (Number.parseFloat(getComputedStyle(event.currentTarget).strokeDashoffset) < 1) crack();
  }

  function fitOpenEnvelope() {
    const room = stageArea.current?.clientHeight ?? 0;
    const width = stageArea.current?.querySelector(".ritual-envelope")?.clientWidth ?? 0;
    const openHeight = width * 1.088;
    const scale = openHeight > 0 ? Math.min(1, (room - 12) / openHeight) : 1;

    scene.current?.style.setProperty("--open-scale", String(scale));
  }

  function crack() {
    void load();
    fitOpenEnvelope();
    setHolding(false);
    tap(12);
    change(() => setStage("open"));
  }

  function press() {
    if (stage !== "back" || holding) return;

    if (reduced) return crack();
    void load();
    tap(6);
    setHolding(true);
    fillRing(true);
  }

  function release() {
    if (!holding) return;
    setHolding(false);
    fillRing(false);
  }

  function unfold() {
    if (stage !== "open") return;
    withWords(() => {
      source.current = envelopeLetter.current?.getBoundingClientRect() ?? null;
      change(() => setStage("unfold"));
    });
  }

  function skip() {
    withWords(() => change(() => setStage("read")));
  }

  function again() {
    window.scrollTo({ top: 0 });
    change(() => {
      setStage("front");
      setRun((n) => n + 1);
    });
  }

  const letter = words && { ...delivery.letter, ...words };
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
          : [
              reduced ? "Tap the seal to break it" : "Press and hold the seal",
              unfoldNext ? "then unfold your phone to read it" : reduced ? "" : "it breaks the way real wax does",
            ]
        : stage === "open"
          ? unfoldNext
            ? ["Now unfold your phone", "or tap the letter to read it here"]
            : ["Tap the letter to unfold it"]
          : [];

  return (
    <main className="desk" {...deskProps(theme)} data-stage={stage}>
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
              onClick={() =>
                stage === "front" ? change(() => setStage("back")) : stage === "open" ? unfold() : undefined
              }
              onKeyDown={activate(() =>
                stage === "front" ? change(() => setStage("back")) : stage === "open" ? unfold() : undefined,
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
                        onTransitionEnd={ringFilled}
                      />
                    </svg>
                  </button>
                }
              />
            </div>
          </div>
          <div className="ritual-hint" key={`hint-${hint.join()}`}>
            {hint[0] && (
              <div className="hint-main">
                {stage === "open" && unfoldNext && (
                  <span className="hint-phone" aria-hidden>
                    <span />
                    <span />
                  </span>
                )}
                {hint[0]}
              </div>
            )}
            {hint[1] && <div className="hint-sub">{hint[1]}</div>}
          </div>
        </section>
      )}

      {(stage === "unfold" || stage === "read") && letter && (
        <section className="reading">
          {stage === "unfold" ? (
            <div className="fold" ref={fold} aria-hidden>
              {(["top", "mid", "bot"] as const).map((panel, i) => (
                <div key={panel} className={`panel panel-${panel}`}>
                  <div className="face face-front">
                    <div className="window" style={{ top: `calc(var(--panel) * ${-i})` }}>
                      <SheetContent letter={letter} initial={initial} theme={theme} seed={seed} />
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
                <SheetContent letter={letter} initial={initial} theme={theme} seed={seed} />
              </article>
              <div className="sealed-line">{delivery.sealedLine}</div>
              <section className="end">
                <div className="keep">
                  <div className="keep-words">
                    <div className="keep-seal" aria-hidden>
                      <HalfSeal
                        theme={theme}
                        initial={initial}
                        seed={seed}
                        side="left"
                        className="keep-half keep-left"
                      />
                      <HalfSeal
                        theme={theme}
                        initial={initial}
                        seed={seed}
                        side="right"
                        className="keep-half keep-right"
                      />
                    </div>
                    <h2 className="keep-title">Yours to keep.</h2>
                    <p className="keep-text">
                      {address.from} sealed this letter for you on {delivery.sealedOn}. Only people with this link can
                      open it.
                    </p>
                  </div>
                  <div className="keep-actions">
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
                  </div>
                </div>
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
              </section>
            </>
          )}
        </section>
      )}
    </main>
  );
}
