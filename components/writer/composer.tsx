"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import type { Stage } from "@/components/mail/experience";
import { seedFrom } from "@/components/mail/seal";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toDelivery } from "@/lib/delivery";
import { deskProps } from "@/lib/texture";
import { defaultStyle, resolveTheme } from "@/lib/theme";
import type { Style, ThemeKey } from "@/lib/theme";

import { Options } from "./options";
import type { Fields } from "./options";
import { PaperEditor, words } from "./paper-editor";
import { PreviewFrame } from "./preview-frame";
import { PublishDialog } from "./publish-dialog";
import { ago } from "./time";
import { VoiceRecorder } from "./voice-recorder";

type Saved = NonNullable<ReturnType<typeof useQuery<typeof api.writer.letter>>>;

type Draft = Fields & { body: string };

const steps: readonly { name: string; stage: Stage; end: boolean }[] = [
  { name: "Envelope", stage: "front", end: false },
  { name: "Seal", stage: "back", end: false },
  { name: "Letter", stage: "read", end: false },
  { name: "End", stage: "read", end: true },
];

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

export const Composer = ({ id }: { id: Id<"letters"> }) => {
  const saved = useQuery(api.writer.letter, { id });

  if (saved === undefined) {
    return <div className="writer w-loading" />;
  }

  return <Editor key={id} saved={saved} />;
};

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
      await save({
        id: saved.id,
        ...patch,
        signature: patch.signature === "" ? null : patch.signature,
      });
      setSavedAt(Date.now());
      setProblem("");
    } catch (error) {
      setProblem(
        error instanceof Error
          ? error.message.replace(/^.*ConvexError: /, "")
          : "That didn't save.",
      );
    }

    setSaving(false);
  };

  const flushLater = useEffectEvent(() => void flush());

  const change = (patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    Object.assign(pending.current, patch);

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(flushLater, 600);
  };

  useEffect(() => {
    const beat = setInterval(() => {
      setTick((n) => n + 1);
    }, 5000);

    const leave = () => {
      flushLater();
    };

    addEventListener("pagehide", leave);

    return () => {
      clearInterval(beat);
      removeEventListener("pagehide", leave);
      flushLater();
    };
  }, []);

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
          sealedAt: published ? saved.sealedAt : Date.now(),
          timeZone: saved.timeZone,
        },
        {
          body: draft.body || "Your letter appears here as you write it.",
          signature: draft.signature || null,
          voice: saved.voice?.url ? { url: saved.voice.url, seconds: saved.voice.seconds } : null,
        },
      ),
    [draft, saved.token, saved.voice, saved.sealedAt, saved.timeZone, published],
  );

  const current = steps[step.index];
  const count = words(draft.body);
  const minutes = Math.max(1, Math.round(count / 200));

  const state = saving
    ? "Saving…"
    : published
      ? `Published · changes go live as you type`
      : `Draft · saved ${ago(savedAt)}`;

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
              <button
                key={kind}
                type="button"
                role="radio"
                aria-checked={device === kind}
                className={device === kind ? "w-on" : ""}
                onClick={() => {
                  setDevice(kind);
                }}
              >
                {kind === "phone" ? "Phone" : "Desktop"}
              </button>
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
          <button type="button" className="w-button w-accent" onClick={seal}>
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
              onClick={async () => {
                if (!confirm("Delete this letter? Its link stops working.")) {
                  return;
                }

                await remove({ id: saved.id });
                router.push("/letters");
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
            stage={current.stage}
            end={current.end}
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
                  setStep((current) => ({ index, run: current.run + 1 }));
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
