import type { Delivery } from "@/components/mail/experience";
import { seedFrom } from "@/components/mail/seal";
import type { Words } from "@/components/mail/sheet";

import { resolveTheme } from "./theme";
import type { Style, ThemeKey } from "./theme";

export interface LetterFields {
  token: string;
  theme: ThemeKey;
  style: Style | null;
  to: string;
  toPlace: string;
  from: string;
  initial: string | null;
  city: string;
  openWhen: string | null;
  sealedAt: number;
  timeZone: string;
}

const dateParts = (at: number, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).formatToParts(at);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return { day: part("day"), month: part("month"), year: part("year") };
};

export const toDelivery = (letter: LetterFields, words?: Words): Delivery => {
  const { day, month, year } = dateParts(letter.sealedAt, letter.timeZone);
  const short = month.slice(0, 3).toUpperCase();
  const city = letter.city.toUpperCase();

  return {
    token: letter.token,
    theme: resolveTheme(letter.theme, letter.style ?? {}),
    address: {
      to: letter.to,
      toPlace: letter.toPlace,
      from: letter.from,
      openWhen: letter.openWhen || null,
      postmark: { city, date: `${short} ${day}`, year },
    },
    letter: { from: letter.from, date: `${day} ${month} ${year}` },
    words,
    seed: seedFrom(letter.token),
    initial: (letter.initial || letter.from.trim().slice(0, 1) || "S").toUpperCase(),
    arrived: `A LETTER ARRIVED · ${day} ${short}`,
    signedFrom: city ? `from ${letter.from}, sealed in ${letter.city}` : `from ${letter.from}`,
    sealedLine: city
      ? `SEALED ${day} ${short} ${year} · ${city}`
      : `SEALED ${day} ${short} ${year}`,
    sealedOn: `${day} ${month} ${year}`,
  };
};
