import { v } from "convex/values";
import { internalAction, mutation } from "./_generated/server";
import { authorize, serverSecret } from "./secret";

export const uploadUrl = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    authorize(args.secret);

    return await ctx.storage.generateUploadUrl();
  },
});

export const attach = mutation({
  args: { secret: v.string(), token: v.string(), image: v.id("_storage"), video: v.id("_storage") },
  handler: async (ctx, { token, image, video, ...args }) => {
    authorize(args.secret);

    const letter = await ctx.db
      .query("letters")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!letter) throw new Error("No letter with that token");

    for (const old of [letter.image, letter.video]) if (old) await ctx.storage.delete(old);
    await ctx.db.patch(letter._id, { image, video });
  },
});

export const request = internalAction({
  args: { token: v.string() },
  handler: async (_ctx, { token }) => {
    const site = process.env.SNAILMAIL_SITE_URL;

    if (!site) throw new Error("SNAILMAIL_SITE_URL is not set");

    const response = await fetch(new URL(`/api/render/${encodeURIComponent(token)}`, site), {
      method: "POST",
      headers: { Authorization: `Bearer ${serverSecret()}` },
    });

    if (!response.ok) throw new Error(`Render failed with ${response.status}: ${await response.text()}`);

    return await response.json();
  },
});
