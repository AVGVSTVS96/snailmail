import { fetchQuery } from "convex/nextjs";
import { cache } from "react";
import { api } from "@/convex/_generated/api";
import type { Delivery } from "@/components/mail/experience";
import { seedFrom } from "@/components/mail/seal";
import { themes } from "./theme";

export const getLetter = cache(async (token: string) => await fetchQuery(api.letters.open, { token }));

export type OpenedLetter = NonNullable<Awaited<ReturnType<typeof getLetter>>>;

function dateParts(at: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).formatToParts(at);

  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";

  return { day: part("day"), month: part("month"), year: part("year") };
}

export function toDelivery(letter: OpenedLetter): Delivery {
  const { day, month, year } = dateParts(letter.sealedAt, letter.timeZone);
  const short = month.slice(0, 3).toUpperCase();
  const city = letter.city.toUpperCase();

  return {
    token: letter.token,
    theme: themes[letter.theme],
    address: {
      to: letter.to,
      toPlace: letter.toPlace,
      from: letter.from,
      openWhen: letter.openWhen,
      postmark: { city, date: `${short} ${day}`, year },
    },
    letter: { body: letter.body, from: letter.from, date: `${day} ${month} ${year}` },
    seed: seedFrom(letter.token),
    initial: letter.from.slice(0, 1).toUpperCase(),
    arrived: `A LETTER ARRIVED · ${day} ${short}`,
    signedFrom: `from ${letter.from}, sealed in ${letter.city}`,
    sealedLine: `SEALED ${day} ${short} ${year} · ${city}`,
    sealedOn: `${day} ${month} ${year}`,
  };
}
