"use client";

import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import type { Stage } from "@/components/mail/experience";
import { api } from "@/convex/_generated/api";
import { seedFrom, toDelivery } from "@/lib/delivery";
import { useListener, useSubscription } from "@/lib/outside";
import { deskProps } from "@/lib/texture";
import { defaultStyle, resolveTheme } from "@/lib/theme";
import type { Style, ThemeKey } from "@/lib/theme";

import { Choice, Options } from "./options";
import type { Fields } from "./options";
import { PaperEditor, words } from "./paper-editor";
import { PreviewFrame } from "./preview-frame";
import { PublishDialog } from "./publish-dialog";
import { ago } from "./time";
import { VoiceRecorder } from "./voice-recorder";

type Saved = FunctionReturnType<typeof api.writer.byId>;

type Draft = Fields & { body: string };

const steps = [
  { name: "Envelope", stage: "front", end: false },
  { name: "Seal", stage: "back", end: false },
  { name: "Letter", stage: "read", end: false },
  { name: "End", stage: "read", end: true },
] as const satisfies readonly { name: string; stage: Stage; end: boolean }[];

const stateLine = (saving: boolean, published: boolean, savedAt: number) => {
  if (saving) {
    return "Saving…";
  }

  return published ? "Published · changes go live as you type" : `Draft · saved ${ago(savedAt)}`;
};

const fromSaved = (saved: Saved): Draft => ({
  theme: saved.theme,
  style: saved.style ?? defaultStyle(saved.theme),
  to: saved.to,
  toPlace: saved.toPlace,
  from: saved.from,
  initial: saved.initial ?? "",
  city: saved.city,
  openWhen: saved.openWhen,
  signature: saved.signature,
  body: saved.body,
});

const Editor = ({ saved }: { saved: Saved }) => {
  const save = useMutation(api.writer.save);
  const remove = useMutation(api.writer.remove);
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => fromSaved(saved));
  const [savedAt, setSavedAt] = useState(saved.updatedAt);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState("");
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  const [step, setStep] = useState({ index: 0, run: 0 });
  const [full, setFull] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [, setTick] = useState(0);
  const pending = useRef<Partial<Draft>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seed = seedFrom(saved.token);
  const look = resolveTheme(draft.theme, draft.style);
  const published = saved.status === "published";

  const flush = async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = null;
    const patch = pending.current;
    pending.current = {};

    if (Object.keys(patch).length === 0) {
      return;
    }

    setSaving(true);

    try {
      const { signature, ...fields } = patch;

      await save(
        signature === undefined
          ? { id: saved.id, ...fields }
          : { id: saved.id, ...fields, signature: signature === "" ? null : signature },
      );
      setSavedAt(Date.now());
      setProblem("");
    } catch (error) {
      setProblem(
        error instanceof Error
          ? error.message.replace(/^.*ConvexError: /u, "")
          : "That didn't save.",
      );
    }

    setSaving(false);
  };

  const flushSoon = () => {
    void flush();
  };

  const change = (patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    Object.assign(pending.current, patch);

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(flushSoon, 600);
  };

  useSubscription(() => {
    const beat = setInterval(() => {
      setTick((n) => n + 1);
    }, 5000);

    return () => {
      clearInterval(beat);
    };
  }, []);

  useListener(
    (leave) => {
      addEventListener("pagehide", leave);

      return () => {
        removeEventListener("pagehide", leave);
        leave();
      };
    },
    flushSoon,
    [],
  );

  const delivery = useMemo(
    () =>
      toDelivery(
        {
          token: saved.token,
          theme: draft.theme,
          style: draft.style,
          to: draft.to || "June",
          toPlace: draft.toPlace,
          from: draft.from || "Avery",
          initial: draft.initial || null,
          city: draft.city,
          openWhen: draft.openWhen || null,
          sealedAt: published ? saved.sealedAt : saved.updatedAt,
          timeZone: saved.timeZone,
        },
        {
          body: draft.body || "Your letter appears here as you write it.",
          signature: draft.signature === "" ? null : draft.signature,
          voice:
            saved.voice === null || saved.voice.url === null
              ? null
              : { url: saved.voice.url, seconds: saved.voice.seconds },
        },
      ),
    [draft, saved.token, saved.voice, saved.sealedAt, saved.timeZone, published, saved.updatedAt],
  );

  const shownStep = steps[step.index] ?? steps[0];
  const count = words(draft.body);
  const minutes = Math.max(1, Math.round(count / 200));

  const state = stateLine(saving, published, savedAt);

  const deleteLetter = async () => {
    // oxlint-disable-next-line no-alert -- deleting is rare and can't be undone, and the browser's own confirm is the clearest check
    if (!confirm("Delete this letter? Its link stops working.")) {
      return;
    }

    await remove({ id: saved.id });
    router.push("/letters");
  };

  const seal = async () => {
    await flush();
    setPublishing(true);
  };

  return (
    <div className="writer w-composer">
      <header className="w-bar">
        <div className="w-crumbs">
          <Link href="/letters" className="w-back" aria-label="Back to letters">
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M10 3L5 8l5 5" />
            </svg>
            Letters
          </Link>
          <span className="w-slash">/</span>
          <span className="w-strong">To {draft.to || "…"}</span>
          <span className="w-state">{problem || state}</span>
        </div>
        <div className="w-bar-actions">
          <div className="w-segments w-device" role="radiogroup" aria-label="Preview size">
            {(["phone", "desktop"] as const).map((kind) => (
              <Choice
                key={kind}
                on={device === kind}
                onPick={() => {
                  setDevice(kind);
                }}
              >
                {kind === "phone" ? "Phone" : "Desktop"}
              </Choice>
            ))}
          </div>
          <button
            type="button"
            className="w-button"
            onClick={() => {
              setFull(true);
            }}
          >
            Preview
          </button>
          <button
            type="button"
            className="w-button w-accent"
            onClick={() => {
              void seal();
            }}
          >
            {published ? "Share" : "Seal and publish"}
          </button>
        </div>
      </header>

      <div className="w-columns">
        <aside className="w-rail">
          <Options
            fields={draft}
            look={look}
            seed={seed}
            onTheme={(theme: ThemeKey) => {
              change({ theme, style: defaultStyle(theme) });
            }}
            onStyle={(style: Partial<Style>) => {
              change({ style: { ...draft.style, ...style } });
            }}
            onField={(field) => {
              change(field);
            }}
          />
          <section className="w-section">
            <h2 className="w-label">Extras</h2>
            <VoiceRecorder id={saved.id} voice={saved.voice} />
          </section>
          <section className="w-section">
            <button
              type="button"
              className="w-text-button w-danger"
              onClick={() => {
                void deleteLetter();
              }}
            >
              Delete this letter
            </button>
          </section>
        </aside>

        <main className="w-desk">
          <div className="w-paper-wrap">
            <div className="w-paper" {...deskProps(look)}>
              <div className="w-paper-sheet">
                <div className="w-paper-head">
                  <span className="w-paper-mark">{delivery.initial}</span>
                  <span className="sheet-date">{delivery.letter.date}</span>
                </div>
                <PaperEditor
                  body={draft.body}
                  onChange={(body) => {
                    change({ body });
                  }}
                />
              </div>
            </div>
            <div className="w-paper-foot">
              <span>
                {count} {count === 1 ? "word" : "words"} · about{" "}
                {minutes === 1 ? "a minute" : `${minutes} minutes`} to read
              </span>
              <span>Paste text or write here · ⌘B bold · ⌘I italic</span>
            </div>
          </div>
        </main>

        <aside className="w-live">
          <div className="w-live-head">
            <h2 className="w-label">Live preview</h2>
          </div>
          <PreviewFrame
            delivery={delivery}
            stage={shownStep.stage}
            end={shownStep.end}
            run={step.run}
            device={device}
          />
          <div className="w-segments w-steps" role="tablist" aria-label="Step through the opening">
            {steps.map((s, index) => (
              <button
                key={s.name}
                type="button"
                role="tab"
                aria-selected={index === step.index}
                className={index === step.index ? "w-on" : ""}
                onClick={() => {
                  setStep((previous) => ({ index, run: previous.run + 1 }));
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
          <p className="w-soft w-live-note">
            Every change shows here as {draft.to || "they"} will see it. Step through the opening to
            check the seal and the liner.
          </p>
        </aside>
      </div>

      {full && (
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a full-window layer the page draws itself; a <dialog> would bring its own modal styles and top layer
        <div className="w-full-preview" role="dialog" aria-label="Preview">
          <PreviewFrame
            delivery={delivery}
            stage="front"
            end={false}
            run={step.run}
            device="fill"
          />
          <button
            type="button"
            className="w-button w-full-close"
            onClick={() => {
              setFull(false);
            }}
          >
            Close preview
          </button>
        </div>
      )}

      {publishing && (
        <PublishDialog
          id={saved.id}
          token={saved.token}
          to={draft.to}
          from={draft.from}
          look={look}
          initial={delivery.initial}
          seed={seed}
          wasPublished={published}
          savedSlug={saved.slug}
          savedKey={saved.key}
          previewReady={saved.previewReady}
          notify={saved.notify}
          onClose={() => {
            setPublishing(false);
          }}
        />
      )}
    </div>
  );
};

export const Composer = ({ id }: { id: string }) => {
  const saved = useQuery(api.writer.byId, { id });

  if (saved === undefined) {
    return <div className="writer w-loading" />;
  }

  return <Editor key={id} saved={saved} />;
};
