import { v } from "convex/values";

import { internalAction, mutation } from "./_generated/server";
import { authorize, serverSecret, setting } from "./secret";

export const uploadUrl = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    authorize(args.secret);

    return await ctx.storage.generateUploadUrl();
  },
});

export const attach = mutation({
  args: { secret: v.string(), token: v.string(), image: v.string(), video: v.string() },
  handler: async (ctx, { token, ...args }) => {
    authorize(args.secret);

    const image = ctx.db.system.normalizeId("_storage", args.image);
    const video = ctx.db.system.normalizeId("_storage", args.video);

    if (image === null || video === null) {
      throw new Error("Not a stored file");
    }

    const letter = await ctx.db
      .query("letters")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (letter === null) {
      throw new Error("No letter with that token");
    }

    for (const old of [letter.image, letter.video]) {
      if (old !== undefined) {
        await ctx.storage.delete(old);
      }
    }

    await ctx.db.patch(letter._id, { image, video });
  },
});

export const request = internalAction({
  args: { token: v.string() },
  handler: async (_ctx, { token }) => {
    const site = setting("SNAILMAIL_SITE_URL");

    if (site === null) {
      throw new Error("SNAILMAIL_SITE_URL is not set");
    }

    const response = await fetch(new URL(`/api/render/${encodeURIComponent(token)}`, site), {
      method: "POST",
      headers: { Authorization: `Bearer ${serverSecret()}` },
    });

    if (!response.ok) {
      throw new Error(`Render failed with ${response.status}: ${await response.text()}`);
    }

    const rendered: unknown = await response.json();

    return rendered;
  },
});
