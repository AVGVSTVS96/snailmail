import { resolveTheme } from "./theme";
import type { Style, Theme, ThemeKey } from "./theme";

export interface Address {
  to: string;
  toPlace: string;
  from: string;
  openWhen: string | null;
  postmark: { city: string; date: string; year: string };
}

export interface Letter {
  body: string;
  from: string;
  date: string;
  signature?: string | null;
  voice?: { url: string; seconds: number } | null;
}

export type Words = Pick<Letter, "body" | "signature" | "voice">;

export interface Delivery {
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
}

export const seedFrom = (text: string) => {
  let h = 2_166_136_261;

  for (const char of text) {
    h = Math.imul(h ^ char.charCodeAt(0), 16_777_619);
  }

  return h >>> 0;
};

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
