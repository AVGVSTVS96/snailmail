import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, type MutationCtx, mutation, type QueryCtx } from "./_generated/server";
import { themes } from "./schema";
import { authorize } from "./secret";

const missWindow = 60 * 60 * 1000;
const missesAllowed = 20;

export function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function sent(letter: Doc<"letters"> | null) {
  return letter && letter.status !== "draft" ? letter : null;
}

async function guarded(
  ctx: MutationCtx,
  secret: string,
  visitor: string,
  lookup: () => Promise<Doc<"letters"> | null>,
) {
  authorize(secret);

  const misses = await ctx.db
    .query("misses")
    .withIndex("by_visitor", (q) => q.eq("visitor", visitor))
    .unique();

  const now = Date.now();
  const recent = misses && now - misses.since < missWindow ? misses.count : 0;

  if (recent >= missesAllowed) return "limited";

  const letter = sent(await lookup());

  if (letter) return letter;

  if (!misses) await ctx.db.insert("misses", { visitor, count: 1, since: now });
  else await ctx.db.patch(misses._id, recent ? { count: recent + 1 } : { count: 1, since: now });

  return null;
}

function byToken(ctx: QueryCtx, token: string) {
  return ctx.db
    .query("letters")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();
}

function find(ctx: MutationCtx, secret: string, token: string, visitor: string) {
  return guarded(ctx, secret, visitor, () => byToken(ctx, token));
}

function outside(letter: Doc<"letters">) {
  return {
    token: letter.token,
    theme: letter.theme,
    style: letter.style ?? null,
    to: letter.to,
    toPlace: letter.toPlace,
    from: letter.from,
    initial: letter.initial ?? null,
    city: letter.city,
    openWhen: letter.openWhen ?? null,
    sealedAt: letter.sealedAt,
    image: letter.image ?? null,
    video: letter.video ?? null,
    timeZone: letter.timeZone,
  };
}

const door = { secret: v.string(), token: v.string(), visitor: v.string() };

export const envelope = mutation({
  args: door,
  handler: async (ctx, { secret, token, visitor }) => {
    const letter = await find(ctx, secret, token, visitor);

    if (letter === null || letter === "limited") return letter;

    return outside(letter);
  },
});

export const envelopeAt = mutation({
  args: { secret: v.string(), slug: v.string(), key: v.string(), visitor: v.string() },
  handler: async (ctx, { secret, slug, key, visitor }) => {
    const letter = await guarded(ctx, secret, visitor, async () => {
      const named = await ctx.db
        .query("letters")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      return named && (named.key ?? "") === key ? named : null;
    });

    if (letter === null || letter === "limited") return letter;

    return outside(letter);
  },
});

async function countOpen(ctx: MutationCtx, letter: Doc<"letters">) {
  const opens = letter.opens ?? 0;

  await ctx.db.patch(letter._id, { opens: opens + 1, openedAt: Date.now() });

  if (opens === 0 && letter.owner !== undefined && letter.notify !== false)
    await ctx.scheduler.runAfter(0, internal.notify.opened, { id: letter._id });
}

export const read = mutation({
  args: { ...door, reader: v.optional(v.string()) },
  handler: async (ctx, { secret, token, visitor, reader }) => {
    const letter = await find(ctx, secret, token, visitor);

    if (letter === null || letter === "limited") return letter;
    const voiceUrl = letter.voice ? await ctx.storage.getUrl(letter.voice.file) : null;

    if (reader === undefined || reader !== letter.owner) await countOpen(ctx, letter);

    return {
      body: letter.body,
      signature: letter.signature ?? null,
      voice: letter.voice && voiceUrl ? { url: voiceUrl, seconds: letter.voice.seconds } : null,
    };
  },
});

export const preview = mutation({
  args: { ...door, kind: v.union(v.literal("image"), v.literal("video")) },
  handler: async (ctx, { secret, token, visitor, kind }) => {
    const letter = await find(ctx, secret, token, visitor);

    if (letter === null || letter === "limited") return letter;
    const id = letter[kind];
    const url = id ? await ctx.storage.getUrl(id) : null;

    return id && url ? { id, url } : null;
  },
});

export const seal = internalMutation({
  args: {
    theme: themes,
    to: v.string(),
    toPlace: v.string(),
    from: v.string(),
    city: v.string(),
    openWhen: v.optional(v.string()),
    body: v.string(),
    sealedAt: v.number(),
    timeZone: v.string(),
  },
  handler: async (ctx, letter) => {
    const token = newToken();
    await ctx.db.insert("letters", { ...letter, token });

    return token;
  },
});
