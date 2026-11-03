import type { ReactNode } from "react";
import type { Theme } from "@/lib/theme";
import { WaxSeal } from "./seal";
import { Emboss, Sprig } from "./stationery";
import { VoiceNote } from "./voice-note";

export type Letter = {
  body: string;
  from: string;
  date: string;
  signature?: string | null;
  voice?: { url: string; seconds: number } | null;
};

export type Words = Pick<Letter, "body" | "signature" | "voice">;

export function paragraphs(body: string) {
  return body.split(/\n\s*\n/).filter((p) => p.trim() !== "");
}

export function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
      return <strong key={i}>{part.slice(2, -2)}</strong>;

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;

    return part;
  });
}

function Letterhead({ theme, initial, seed }: { theme: Theme; initial: string; seed: number }) {
  if (theme.letterhead === "airmail")
    return (
      <div className="airmail-label" aria-hidden>
        PAR AVION
      </div>
    );

  if (theme.letterhead === "seal") return <WaxSeal theme={theme} initial={initial} seed={seed} className="head-seal" />;

  return <Emboss initial={initial} />;
}

type SheetProps = { letter: Letter; initial: string; theme: Theme; seed?: number };

const closingLength = 90;

export function SheetContent({ letter, initial, theme, seed = 7 }: SheetProps) {
  const all = paragraphs(letter.body);
  const last = all.at(-1);
  const closing = last !== undefined && last.length <= closingLength ? last : null;
  const body = closing === null ? all : all.slice(0, -1);

  const signature = letter.signature ? (
    <svg className="sheet-drawn" viewBox="0 0 300 120" role="img" aria-label={letter.from}>
      <path d={letter.signature} />
    </svg>
  ) : (
    <div className="sheet-sign">{letter.from}</div>
  );

  return (
    <div className="sheet-content">
      {theme.airmail && <div className="airmail-stripe" aria-hidden />}
      <div className="sheet-head">
        <Letterhead theme={theme} initial={initial} seed={seed} />
        <div className="sheet-date">{letter.date}</div>
      </div>
      {letter.voice && <VoiceNote url={letter.voice.url} seconds={letter.voice.seconds} />}
      <div className="sheet-body">
        {body.map((p, i) => (
          <p key={i} className="sheet-p">
            {inline(p)}
          </p>
        ))}
      </div>
      <div className="sheet-close">
        {closing !== null && <p className="sheet-p">{inline(closing)}</p>}
        {signature}
        {theme.sprig && <Sprig className="sheet-sprig" />}
      </div>
    </div>
  );
}
