import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const themes = v.union(
  v.literal("keepsake"),
  v.literal("parAvion"),
  v.literal("pressed"),
  v.literal("midnight"),
);

export const style = v.object({
  paper: v.union(
    v.literal("cotton"),
    v.literal("ivory"),
    v.literal("onionskin"),
    v.literal("kraft"),
    v.literal("bone"),
    v.literal("black"),
  ),
  finish: v.union(v.literal("plain"), v.literal("laid"), v.literal("ruled"), v.literal("deckle")),
  ink: v.union(
    v.literal("ironGall"),
    v.literal("navy"),
    v.literal("oxblood"),
    v.literal("moss"),
    v.literal("sepia"),
    v.literal("pale"),
  ),
  typeface: v.union(
    v.literal("handwritten"),
    v.literal("letterpress"),
    v.literal("clean"),
    v.literal("typewriter"),
    v.literal("book"),
  ),
  wax: v.union(
    v.literal("oxblood"),
    v.literal("navy"),
    v.literal("moss"),
    v.literal("gold"),
    v.literal("blush"),
    v.literal("black"),
  ),
  emblem: v.union(
    v.literal("initial"),
    v.literal("heart"),
    v.literal("star"),
    v.literal("flower"),
    v.literal("moon"),
    v.literal("snail"),
  ),
  stamp: v.union(
    v.literal("snail"),
    v.literal("swallow"),
    v.literal("poppy"),
    v.literal("moon"),
    v.literal("heart"),
    v.literal("bridge"),
  ),
  liner: v.union(
    v.literal("none"),
    v.literal("dots"),
    v.literal("stripes"),
    v.literal("sprigs"),
    v.literal("stars"),
    v.literal("marble"),
  ),
});

export const status = v.union(v.literal("draft"), v.literal("published"));

export default defineSchema({
  letters: defineTable({
    token: v.string(),
    owner: v.optional(v.string()),
    status: v.optional(status),
    theme: themes,
    style: v.optional(style),
    to: v.string(),
    toPlace: v.string(),
    from: v.string(),
    initial: v.optional(v.string()),
    city: v.string(),
    openWhen: v.optional(v.string()),
    body: v.string(),
    signature: v.optional(v.string()),
    voice: v.optional(v.object({ file: v.id("_storage"), seconds: v.number() })),
    slug: v.optional(v.string()),
    key: v.optional(v.string()),
    sealedAt: v.number(),
    timeZone: v.string(),
    updatedAt: v.optional(v.number()),
    opens: v.optional(v.number()),
    openedAt: v.optional(v.number()),
    notify: v.optional(v.boolean()),
    image: v.optional(v.id("_storage")),
    video: v.optional(v.id("_storage")),
    rerender: v.optional(v.id("_scheduled_functions")),
  })
    .index("by_token", ["token"])
    .index("by_owner", ["owner", "updatedAt"])
    .index("by_slug", ["slug"]),
  misses: defineTable({
    visitor: v.string(),
    count: v.number(),
    since: v.number(),
  }).index("by_visitor", ["visitor"]),
});
