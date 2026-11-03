import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { themes } from "./schema";

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export const open = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const letter = await ctx.db
      .query("letters")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!letter) return null;

    return {
      token: letter.token,
      theme: letter.theme,
      to: letter.to,
      toPlace: letter.toPlace,
      from: letter.from,
      city: letter.city,
      openWhen: letter.openWhen ?? null,
      body: letter.body,
      sealedAt: letter.sealedAt,
      image: letter.image ?? null,
      video: letter.video ?? null,
      timeZone: letter.timeZone,
    };
  },
});

export const media = query({
  args: { token: v.string(), kind: v.union(v.literal("image"), v.literal("video")) },
  handler: async (ctx, { token, kind }) => {
    const letter = await ctx.db
      .query("letters")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    const id = letter?.[kind];

    return id ? await ctx.storage.getUrl(id) : null;
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
