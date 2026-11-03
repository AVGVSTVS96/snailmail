import { v } from "convex/values";
import { internalMutation, type MutationCtx, mutation } from "./_generated/server";
import { themes } from "./schema";
import { authorize } from "./secret";

const missWindow = 60 * 60 * 1000;
const missesAllowed = 20;

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

const door = { secret: v.string(), token: v.string(), visitor: v.string() };

async function find(ctx: MutationCtx, secret: string, token: string, visitor: string) {
  authorize(secret);

  const misses = await ctx.db
    .query("misses")
    .withIndex("by_visitor", (q) => q.eq("visitor", visitor))
    .unique();

  const now = Date.now();
  const recent = misses && now - misses.since < missWindow ? misses.count : 0;

  if (recent >= missesAllowed) return "limited";

  const letter = await ctx.db
    .query("letters")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (letter) return letter;

  if (!misses) await ctx.db.insert("misses", { visitor, count: 1, since: now });
  else await ctx.db.patch(misses._id, recent ? { count: recent + 1 } : { count: 1, since: now });

  return null;
}

export const envelope = mutation({
  args: door,
  handler: async (ctx, { secret, token, visitor }) => {
    const letter = await find(ctx, secret, token, visitor);

    if (letter === null || letter === "limited") return letter;

    return {
      token: letter.token,
      theme: letter.theme,
      to: letter.to,
      toPlace: letter.toPlace,
      from: letter.from,
      city: letter.city,
      openWhen: letter.openWhen ?? null,
      sealedAt: letter.sealedAt,
      image: letter.image ?? null,
      video: letter.video ?? null,
      timeZone: letter.timeZone,
    };
  },
});

export const read = mutation({
  args: door,
  handler: async (ctx, { secret, token, visitor }) => {
    const letter = await find(ctx, secret, token, visitor);

    if (letter === null || letter === "limited") return letter;

    return { body: letter.body };
  },
});

export const media = mutation({
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
