import { Emboss } from "./stationery";

export type Letter = {
  body: string;
  from: string;
  date: string;
};

export function paragraphs(body: string) {
  return body.split(/\n\s*\n/).filter((p) => p.trim() !== "");
}

export function SheetContent({ letter, initial }: { letter: Letter; initial: string }) {
  return (
    <div className="sheet-content">
      <div className="sheet-head">
        <Emboss initial={initial} />
        <div className="sheet-date font-caveat">{letter.date}</div>
      </div>
      {paragraphs(letter.body).map((p, i) => (
        <p key={i} className="sheet-p font-caveat">
          {p}
        </p>
      ))}
      <div className="sheet-sign font-delafield">{letter.from}</div>
    </div>
  );
}
