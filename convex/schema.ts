import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const themes = v.literal("keepsake");

export default defineSchema({
  letters: defineTable({
    token: v.string(),
    theme: themes,
    to: v.string(),
    toPlace: v.string(),
    from: v.string(),
    city: v.string(),
    openWhen: v.optional(v.string()),
    body: v.string(),
    sealedAt: v.number(),
    timeZone: v.string(),
    image: v.optional(v.id("_storage")),
    video: v.optional(v.id("_storage")),
  }).index("by_token", ["token"]),
  misses: defineTable({
    visitor: v.string(),
    count: v.number(),
    since: v.number(),
  }).index("by_visitor", ["visitor"]),
});
