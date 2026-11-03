import { fetchMutation } from "convex/nextjs";
import { headers } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { api } from "@/convex/_generated/api";
import { serverSecret } from "@/convex/secret";
import { scraperAgent } from "./crawlers";

export { toDelivery } from "./delivery";

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

async function visitor() {
  await connection();
  const request = await headers();

  if (scraperAgent.test(request.get("user-agent") ?? "")) return null;
  const ip = request.get("x-real-ip") ?? request.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  return { secret: serverSecret(), visitor: network(ip) };
}

export async function door(token: string) {
  const guest = linkToken.test(token) ? await visitor() : null;

  return guest && { ...guest, token };
}

export const getLetter = cache(async (token: string) => {
  const args = await door(token);
  const letter = args ? await fetchMutation(api.letters.envelope, args) : null;

  return letter === "limited" ? null : letter;
});

export async function readLetter(token: string, reader: string | undefined) {
  const args = await door(token);

  return args ? await fetchMutation(api.letters.read, { ...args, reader }) : null;
}

const slugName = /^[a-z0-9-]{1,40}$/;
const linkKey = /^[a-z0-9]{0,8}$/;

export const getLetterAt = cache(async (slug: string, key: string) => {
  const guest = slugName.test(slug) && linkKey.test(key) ? await visitor() : null;
  const letter = guest ? await fetchMutation(api.letters.envelopeAt, { ...guest, slug, key }) : null;

  return letter === "limited" ? null : letter;
});

export type OpenedLetter = NonNullable<Awaited<ReturnType<typeof getLetter>>>;
