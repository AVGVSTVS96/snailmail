import { fetchMutation } from "convex/nextjs";
import { headers } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { api } from "@/convex/_generated/api";
import { serverSecret } from "@/convex/secret";
import type { Delivery } from "@/components/mail/experience";
import { seedFrom } from "@/components/mail/seal";
import { scraperAgent } from "./crawlers";
import { themes } from "./theme";

const linkToken = /^[\w-]{22}$/;

function network(ip: string) {
  if (!ip.includes(":")) return ip;

  if (ip.includes(".")) return ip.slice(ip.lastIndexOf(":") + 1);
  const [head = "", tail = ""] = ip.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = [...left, ...Array.from({ length: 8 - left.length - right.length }, () => "0"), ...right];

  return `${groups
    .slice(0, 4)
    .map((group) => Number.parseInt(group, 16).toString(16))
    .join(":")}::/64`;
}

export async function door(token: string) {
  await connection();
  const request = await headers();

  if (!linkToken.test(token) || scraperAgent.test(request.get("user-agent") ?? "")) return null;
  const ip = request.get("x-real-ip") ?? request.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  return { secret: serverSecret(), token, visitor: network(ip) };
}

export const getLetter = cache(async (token: string) => {
  const args = await door(token);
  const letter = args ? await fetchMutation(api.letters.envelope, args) : null;

  return letter === "limited" ? null : letter;
});

export async function readLetter(token: string) {
  const args = await door(token);

  return args ? await fetchMutation(api.letters.read, args) : null;
}

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
    letter: { from: letter.from, date: `${day} ${month} ${year}` },
    seed: seedFrom(letter.token),
    initial: letter.from.slice(0, 1).toUpperCase(),
    arrived: `A LETTER ARRIVED · ${day} ${short}`,
    signedFrom: `from ${letter.from}, sealed in ${letter.city}`,
    sealedLine: `SEALED ${day} ${short} ${year} · ${city}`,
    sealedOn: `${day} ${month} ${year}`,
  };
}
