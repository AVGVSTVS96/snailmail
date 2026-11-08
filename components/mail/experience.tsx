"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import type { Ref } from "react";
import { flushSync } from "react-dom";

import { Words } from "@/lib/delivery";
import type { Delivery, Letter } from "@/lib/delivery";
import { looksFoldable, watchFold } from "@/lib/fold";
import { tap } from "@/lib/haptics";
import {
  useBeforePaint,
  useImperative,
  useListener,
  useResize,
  useSubscription,
  useTimeout,
} from "@/lib/outside";
import { deskProps } from "@/lib/texture";

import { Envelope } from "./envelope";
import { HalfSeal } from "./seal";
import { SheetContent } from "./sheet";

export type Stage = "front" | "back" | "open" | "unfold" | "read";

const holdMs = 900;
const ringLength = 2 * Math.PI * 46;

const tableQuery = "(min-width: 600px) and (min-height: 480px)";
const foldableKey = "snailmail:foldable";

const useMedia = (query: string) =>
  useSyncExternalStore(
    (onChange) => {
      const list = matchMedia(query);
      list.addEventListener("change", onChange);

      return () => {
        list.removeEventListener("change", onChange);
      };
    },
    () => matchMedia(query).matches,
    () => false,
  );

const subscribeStorage = (onChange: () => void) => {
  addEventListener("storage", onChange);

  return () => {
    removeEventListener("storage", onChange);
  };
};

const fetchWords = async (token: string) => {
  const response = await fetch(`/l/${token}/letter`, { method: "POST", cache: "no-store" });

  return response.ok ? Words.parse(await response.json()) : null;
};

const hintFor = ({
  stage,
  holding,
  reduced,
  unfoldNext,
  unfoldLast,
  signedFrom,
}: {
  stage: Stage;
  holding: boolean;
  reduced: boolean;
  unfoldNext: boolean;
  unfoldLast: boolean;
  signedFrom: string;
}): [string?, string?] => {
  if (stage === "front") {
    return ["Tap to turn it over", signedFrom];
  }

  if (stage === "back") {
    if (holding) {
      return ["Keep holding…"];
    }

    const first = reduced ? "Tap the seal to break it" : "Press and hold the seal";

    if (unfoldNext) {
      return [first, "then unfold your phone to read it"];
    }

    return [first, reduced ? "" : "it breaks the way real wax does"];
  }

  if (unfoldLast) {
    return ["Now unfold your phone", "or tap the letter to read it here"];
  }

  return stage === "open" ? ["Tap the letter to unfold it"] : [];
};

const labels: Partial<Record<Stage, string>> = { back: "SEALED WITH WAX" };

const envelopeLabel = (stage: Stage, from: string) => {
  if (stage === "front") {
    return `Envelope from ${from}. Turn over.`;
  }

  return stage === "open" ? "Folded letter. Unfold it." : "Envelope";
};

const pageWidth = () => document.documentElement.clientWidth;

const activates = (event: React.KeyboardEvent) => event.key === "Enter" || event.key === " ";

const keepLineThroughRewrap = (active: boolean) => {
  const parts = ".sheet-head, .sheet-p, .sheet-close > *, .sealed-line, .keep, .credit";
  let place: { part: Element; into: number; width: number } | null = null;

  const remember = () => {
    if (place && place.width !== pageWidth()) {
      return;
    }

    place = null;

    if (scrollY < 1) {
      return;
    }

    for (const part of document.querySelectorAll(parts)) {
      const { top, height } = part.getBoundingClientRect();

      if (top + height <= 0) {
        continue;
      }

      place = { part, into: height > 0 ? -top / height : 0, width: pageWidth() };

      return;
    }
  };

  const restore = () => {
    if (!place || place.width === pageWidth()) {
      return;
    }

    const { top, height } = place.part.getBoundingClientRect();
    scrollBy(0, top + place.into * height);
    place.width = pageWidth();
  };

  if (active) {
    remember();
    addEventListener("scroll", remember, { passive: true });
    addEventListener("resize", restore);
  }

  return () => {
    removeEventListener("scroll", remember);
    removeEventListener("resize", restore);
  };
};

const Folding = ({
  ref,
  letter,
  delivery: { theme, initial, seed, address },
}: {
  ref: Ref<HTMLDivElement>;
  letter: Letter;
  delivery: Delivery;
}) => (
  <div className="fold" ref={ref} aria-hidden>
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
);

const Read = ({
  letter,
  delivery: { theme, initial, seed, address, sealedLine, sealedOn },
  onAgain,
}: {
  letter: Letter;
  delivery: Delivery;
  onAgain: () => void;
}) => (
  <>
    <article className="sheet" aria-label={`A letter from ${address.from}`}>
      <SheetContent letter={letter} initial={initial} theme={theme} seed={seed} />
    </article>
    <div className="sealed-line">{sealedLine}</div>
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
            {address.from} sealed this letter for you on {sealedOn}. Only people with this link can
            open it.
          </p>
        </div>
        <div className="keep-actions">
          <button
            type="button"
            className="keep-primary"
            onClick={() => {
              window.print();
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14" />
            </svg>
            Keep a copy
          </button>
          <button type="button" className="keep-secondary" onClick={onAgain}>
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
);

const SealButton = ({
  ref,
  ink,
  tapToOpen,
  disabled,
  onPress,
  onRelease,
  onRingFilled,
}: {
  ref: Ref<SVGCircleElement>;
  ink: string;
  tapToOpen: boolean;
  disabled: boolean;
  onPress: () => void;
  onRelease: () => void;
  onRingFilled: (event: React.TransitionEvent<SVGCircleElement>) => void;
}) => (
  <button
    type="button"
    className="seal-button"
    aria-label={tapToOpen ? "Wax seal. Tap to open." : "Wax seal. Press and hold to open."}
    disabled={disabled}
    onPointerDown={(event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      onPress();
    }}
    onPointerUp={onRelease}
    onPointerCancel={onRelease}
    onContextMenu={(event) => {
      event.preventDefault();
    }}
    onKeyDown={(event) => {
      if (activates(event) && !event.repeat) {
        event.preventDefault();
        onPress();
      }
    }}
    onKeyUp={onRelease}
  >
    <svg viewBox="0 0 112 112" className="seal-ring" aria-hidden>
      <circle
        cx="56"
        cy="56"
        r="46"
        fill="none"
        stroke={ink}
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <circle
        ref={ref}
        cx="56"
        cy="56"
        r="46"
        fill="none"
        stroke={ink}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={ringLength}
        strokeDashoffset={ringLength}
        transform="rotate(-90 56 56)"
        onTransitionEnd={onRingFilled}
      />
    </svg>
  </button>
);

const autoUnfoldAfter = (stage: Stage, unfoldLast: boolean, table: boolean) => {
  if (stage !== "open" || (unfoldLast && !table)) {
    return null;
  }

  return unfoldLast ? 2000 : 4200;
};

const readAfter = (stage: Stage, reduced: boolean) => {
  if (stage !== "unfold") {
    return null;
  }

  return reduced ? 350 : 1550;
};

const flag = (on: boolean) => (on ? "" : undefined);

const Hint = ({ hint: [main, sub], phone }: { hint: [string?, string?]; phone: boolean }) => (
  <div className="ritual-hint">
    {main !== undefined && main !== "" && (
      <div className="hint-main">
        {phone && (
          <span className="hint-phone" aria-hidden>
            <span />
            <span />
          </span>
        )}
        {main}
      </div>
    )}
    {sub !== undefined && sub !== "" && <div className="hint-sub">{sub}</div>}
  </div>
);

export const Experience = ({
  delivery,
  start = "front",
}: {
  delivery: Delivery;
  start?: Stage;
}) => {
  const { theme, address, seed, initial, token } = delivery;
  const [stage, setStage] = useState<Stage>(start);
  const [words, setWords] = useState(delivery.words ?? null);
  const loading = useRef<Promise<boolean> | null>(null);
  const [run, setRun] = useState(0);
  const [holding, setHolding] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const table = useMedia(tableQuery);
  const [unfoldedHere, setUnfoldedHere] = useState(false);
  const [unfoldLast, setUnfoldLast] = useState(false);
  const ring = useRef<SVGCircleElement>(null);
  const source = useRef<DOMRect | null>(null);
  const fold = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLElement>(null);
  const stageArea = useRef<HTMLDivElement>(null);

  const foldableBefore = useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem(foldableKey) !== null || looksFoldable(),
    () => false,
  );

  const unfoldNext = (unfoldedHere || foldableBefore) && !table;
  const unfolding = stage === "unfold" || (stage === "open" && unfoldLast && table);

  const load = async () => {
    const pending =
      loading.current ??
      fetchWords(token).then(
        (written) => {
          if (written === null) {
            loading.current = null;

            return false;
          }

          setWords(written);

          return true;
        },
        () => {
          loading.current = null;

          return false;
        },
      );

    loading.current = pending;

    return await pending;
  };

  const withWords = async (action: () => void) => {
    if (words !== null || (await load())) {
      action();
    }
  };

  const change = (update: () => void, crossfade = reduced) => {
    if (!crossfade || !("startViewTransition" in document)) {
      update();

      return;
    }

    document
      .startViewTransition(() => {
        flushSync(update);
      })
      .ready.catch(() => null);
  };

  const fillRing = (full: boolean) => {
    const circle = ring.current;

    if (!circle) {
      return;
    }

    // oxlint-disable-next-line unicorn/prefer-number-coercion -- the computed value carries a px unit, which Number() turns into NaN
    const left = Number.parseFloat(getComputedStyle(circle).strokeDashoffset) / ringLength;

    circle.style.transition = full
      ? `stroke-dashoffset ${Math.round(holdMs * left)}ms linear`
      : "stroke-dashoffset 200ms cubic-bezier(0.23, 1, 0.32, 1)";
    circle.style.strokeDashoffset = full ? "0" : String(ringLength);
  };

  const fitOpenEnvelope = () => {
    const room = stageArea.current?.clientHeight ?? 0;
    const width = stageArea.current?.querySelector(".ritual-envelope")?.clientWidth ?? 0;
    const openHeight = width * 1.088;
    const scale = openHeight > 0 ? Math.min(1, (room - 12) / openHeight) : 1;

    scene.current?.style.setProperty("--open-scale", String(scale));
  };

  const crack = () => {
    void load();
    fitOpenEnvelope();
    setHolding(false);
    setUnfoldLast(unfoldNext);
    tap(12);
    change(() => {
      setStage("open");
    });
  };

  const ringFilled = (event: React.TransitionEvent<SVGCircleElement>) => {
    if (!holding || event.propertyName !== "stroke-dashoffset") {
      return;
    }

    // oxlint-disable-next-line unicorn/prefer-number-coercion -- the computed value carries a px unit, which Number() turns into NaN
    if (Number.parseFloat(getComputedStyle(event.currentTarget).strokeDashoffset) < 1) {
      crack();
    }
  };

  const press = () => {
    if (stage !== "back" || holding) {
      return;
    }

    if (reduced) {
      crack();

      return;
    }

    void load();
    tap(6);
    setHolding(true);
    fillRing(true);
  };

  const release = () => {
    if (!holding) {
      return;
    }

    setHolding(false);
    fillRing(false);
  };

  const unfold = () => {
    if (stage !== "open") {
      return;
    }

    void withWords(() => {
      source.current =
        stageArea.current?.querySelector(".env-letter")?.getBoundingClientRect() ?? null;
      change(() => {
        setStage("unfold");
      });
    });
  };

  const again = () => {
    window.scrollTo({ top: 0 });
    change(() => {
      setStage("front");
      setRun((n) => n + 1);
    });
  };

  useImperative(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.surface);
  }, [theme.surface]);

  useTimeout(unfold, autoUnfoldAfter(stage, unfoldLast, table), [stage, table]);

  useResize(stageArea, fitOpenEnvelope, stage === "open");

  useTimeout(
    () => {
      change(() => {
        setStage("read");
      });
    },
    readAfter(stage, reduced),
    [stage],
  );

  useListener(
    watchFold,
    (folded) => {
      if (folded === "unfold") {
        localStorage.setItem(foldableKey, "1");
        setUnfoldedHere(true);
        unfold();
      }
    },
    [],
  );

  useSubscription(() => keepLineThroughRewrap(stage === "read"), [stage]);

  useSubscription(() => {
    const below =
      stage === "read" && !reduced
        ? [
            ...document.querySelectorAll<HTMLElement | SVGElement>(
              ".sheet-sign, .sheet-drawn, .keep",
            ),
          ].filter((element) => element.getBoundingClientRect().top > innerHeight)
        : [];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const shown = below.find((element) => element === entry.target);

          if (!entry.isIntersecting || shown === undefined) {
            continue;
          }

          shown.dataset.shown = "";
          observer.unobserve(shown);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    for (const element of below) {
      element.dataset.waiting = "";
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [stage, reduced]);

  useBeforePaint(() => {
    const from = source.current;
    const target = fold.current?.querySelector(".panel-mid")?.getBoundingClientRect();

    if (stage !== "unfold" || !from || !target || !fold.current || reduced) {
      return;
    }

    const scaleX = from.width / target.width;
    const scaleY = from.height / target.height;
    const x = from.left + from.width / 2 - (target.left + target.width / 2);
    const y = from.top + from.height / 2 - (target.top + target.height / 2);
    const timing = { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };

    fold.current.animate(
      [
        { transform: `translate(${x}px, ${y}px) rotate(-1deg) scale(${scaleX}, ${scaleY})` },
        { transform: "none" },
      ],
      timing,
    );
    fold.current
      .querySelector(".env-letter-note")
      ?.animate([{ transform: `scaleY(${scaleX / scaleY})` }, { transform: "none" }], timing);
  }, [stage, reduced]);

  const letter = words && { ...delivery.letter, ...words };
  const flipped = stage !== "front";
  const opened = stage === "open" || stage === "unfold";
  const ritual = stage !== "read";
  const label = stage === "front" ? delivery.arrived : (labels[stage] ?? "");

  const hint = hintFor({
    stage,
    holding,
    reduced,
    unfoldNext,
    unfoldLast,
    signedFrom: delivery.signedFrom,
  });

  const tapEnvelope = () => {
    if (stage === "front") {
      change(() => {
        setStage("back");
      });
    } else if (stage === "open") {
      unfold();
    }
  };

  return (
    <main className="desk" {...deskProps(theme)} data-stage={stage}>
      {ritual && (
        <section
          ref={scene}
          className="ritual"
          data-flipped={flag(flipped)}
          data-opened={flag(opened)}
          data-holding={flag(holding)}
          data-unfolding={flag(unfolding)}
        >
          <div className="ritual-label" key={`label-${label}`}>
            {label}
          </div>
          <div className="ritual-stage" ref={stageArea}>
            <div
              key={run}
              className="ritual-envelope"
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- the envelope holds the seal's <button>, and a <button> can't contain another
              role="button"
              tabIndex={0}
              aria-label={envelopeLabel(stage, address.from)}
              onClick={tapEnvelope}
              onKeyDown={(event) => {
                if (activates(event)) {
                  event.preventDefault();
                  tapEnvelope();
                }
              }}
            >
              <Envelope
                theme={theme}
                address={address}
                seed={seed}
                initial={initial}
                seal={
                  <SealButton
                    ref={ring}
                    ink={theme.ink}
                    tapToOpen={reduced}
                    disabled={stage !== "back"}
                    onPress={press}
                    onRelease={release}
                    onRingFilled={ringFilled}
                  />
                }
              />
            </div>
          </div>
          <Hint key={`hint-${hint.join(",")}`} hint={hint} phone={unfoldLast} />
        </section>
      )}

      {(stage === "unfold" || stage === "read") && letter && (
        <section className="reading">
          {stage === "unfold" ? (
            <Folding ref={fold} letter={letter} delivery={delivery} />
          ) : (
            <Read letter={letter} delivery={delivery} onAgain={again} />
          )}
        </section>
      )}
    </main>
  );
};
