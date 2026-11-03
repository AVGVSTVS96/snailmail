import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, type QueryCtx, query } from "./_generated/server";
import { newToken } from "./letters";
import { style, themes } from "./schema";

const reserved = new Set(["www", "app", "api", "admin", "mail", "letters", "snailmail", "dashboard", "static"]);
const keyAlphabet = "abcdefghjkmnpqrstuvwxyz23456789";

async function writer(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) throw new ConvexError("Sign in to write letters");

  return identity.subject;
}

async function own(ctx: QueryCtx, id: Id<"letters">) {
  const owner = await writer(ctx);
  const letter = await ctx.db.get(id);

  if (!letter || letter.owner !== owner) throw new ConvexError("No such letter");

  return letter;
}

export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

async function slugTaken(ctx: QueryCtx, slug: string, id: Id<"letters">) {
  const holders = await ctx.db
    .query("letters")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .take(2);

  return reserved.has(slug) || holders.some((letter) => letter._id !== id);
}

function newKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(4));

  return Array.from(bytes, (byte) => keyAlphabet[byte % keyAlphabet.length]).join("");
}

function summary(letter: Doc<"letters">) {
  return {
    id: letter._id,
    token: letter.token,
    status: letter.status ?? "published",
    theme: letter.theme,
    style: letter.style ?? null,
    to: letter.to,
    from: letter.from,
    initial: letter.initial ?? null,
    slug: letter.slug ?? null,
    key: letter.key ?? null,
    opens: letter.opens ?? 0,
    openedAt: letter.openedAt ?? null,
    updatedAt: letter.updatedAt ?? letter._creationTime,
    sealedAt: letter.sealedAt,
    previewReady: letter.image !== undefined,
  };
}

export const letters = query({
  args: {},
  handler: async (ctx) => {
    const owner = await writer(ctx);

    const mine = await ctx.db
      .query("letters")
      .withIndex("by_owner", (q) => q.eq("owner", owner))
      .order("desc")
      .take(200);

    return mine.map(summary);
  },
});

export const letter = query({
  args: { id: v.id("letters") },
  handler: async (ctx, { id }) => {
    const letter = await own(ctx, id);

    return {
      ...summary(letter),
      toPlace: letter.toPlace,
      city: letter.city,
      openWhen: letter.openWhen ?? "",
      body: letter.body,
      signature: letter.signature ?? null,
      timeZone: letter.timeZone,
      voice: letter.voice ? { url: await ctx.storage.getUrl(letter.voice.file), seconds: letter.voice.seconds } : null,
    };
  },
});

export const slugFree = query({
  args: { id: v.id("letters"), slug: v.string() },
  handler: async (ctx, { id, slug }) => {
    await own(ctx, id);
    const clean = slugify(slug);

    return { slug: clean, free: clean !== "" && !(await slugTaken(ctx, clean, id)) };
  },
});

export const create = mutation({
  args: { from: v.string(), timeZone: v.string() },
  handler: async (ctx, { from, timeZone }) => {
    const owner = await writer(ctx);

    const last = await ctx.db
      .query("letters")
      .withIndex("by_owner", (q) => q.eq("owner", owner))
      .order("desc")
      .first();

    const now = Date.now();

    return await ctx.db.insert("letters", {
      token: newToken(),
      owner,
      status: "draft",
      theme: "keepsake",
      to: "",
      toPlace: "",
      from: last?.from ?? from,
      city: last?.city ?? "",
      body: "",
      sealedAt: now,
      timeZone,
      updatedAt: now,
    });
  },
});

const edits = {
  theme: v.optional(themes),
  style: v.optional(style),
  to: v.optional(v.string()),
  toPlace: v.optional(v.string()),
  from: v.optional(v.string()),
  initial: v.optional(v.string()),
  city: v.optional(v.string()),
  openWhen: v.optional(v.string()),
  body: v.optional(v.string()),
  signature: v.optional(v.union(v.string(), v.null())),
};

function fits(text: string | null | undefined, max: number) {
  if (text && text.length > max) throw new ConvexError(`Keep it under ${max} characters.`);
}

export const save = mutation({
  args: { id: v.id("letters"), ...edits },
  handler: async (ctx, { id, signature, ...changes }) => {
    const letter = await own(ctx, id);

    fits(changes.to, 60);
    fits(changes.toPlace, 80);
    fits(changes.from, 60);
    fits(changes.initial, 1);
    fits(changes.city, 40);
    fits(changes.openWhen, 40);
    fits(changes.body, 20000);
    fits(signature, 40000);

    const envelope = [changes.theme, changes.style, changes.to, changes.toPlace, changes.from, changes.initial];
    const looksDifferent = [...envelope, changes.city, changes.openWhen].some((value) => value !== undefined);
    let rerender = letter.rerender;

    if (letter.status === "published" && looksDifferent) {
      if (rerender) await ctx.scheduler.cancel(rerender);
      rerender = await ctx.scheduler.runAfter(20_000, internal.render.request, { token: letter.token });
    }

    await ctx.db.patch(id, {
      ...changes,
      signature: signature === null ? undefined : signature,
      updatedAt: Date.now(),
      rerender,
    });
  },
});

async function claimSlug(ctx: MutationCtx, letter: Doc<"letters">, wanted: string, exact: boolean) {
  const slug = slugify(wanted);

  if (slug === "") return undefined;

  if (!(await slugTaken(ctx, slug, letter._id))) return slug;

  if (exact) throw new ConvexError(`${slug} is taken. Try another name.`);

  for (let n = 2; n < 100; n++) {
    const next = `${slug.slice(0, 36)}-${n}`;

    if (!(await slugTaken(ctx, next, letter._id))) return next;
  }

  return `${slug.slice(0, 30)}-${newKey()}`;
}

export const publish = mutation({
  args: { id: v.id("letters"), slug: v.string(), private: v.boolean(), exact: v.boolean() },
  handler: async (ctx, args) => {
    const letter = await own(ctx, args.id);

    if (letter.to.trim() === "") throw new ConvexError("Who is it for? Add a name on the envelope.");

    if (letter.from.trim() === "") throw new ConvexError("Add who it's from.");

    if (letter.body.trim() === "") throw new ConvexError("Write the letter first.");

    const slug = await claimSlug(ctx, letter, args.slug, args.exact);
    const key = args.private ? (letter.key ?? newKey()) : undefined;
    const first = letter.status === "draft";
    const now = Date.now();

    await ctx.db.patch(letter._id, {
      status: "published",
      slug,
      key,
      sealedAt: first ? now : letter.sealedAt,
      updatedAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.render.request, { token: letter.token });

    return { token: letter.token, slug: slug ?? null, key: key ?? null };
  },
});

export const unpublish = mutation({
  args: { id: v.id("letters") },
  handler: async (ctx, { id }) => {
    await own(ctx, id);
    await ctx.db.patch(id, { status: "draft", updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("letters") },
  handler: async (ctx, { id }) => {
    const letter = await own(ctx, id);

    for (const file of [letter.image, letter.video, letter.voice?.file]) if (file) await ctx.storage.delete(file);
    await ctx.db.delete(id);
  },
});

export const voiceUploadUrl = mutation({
  args: { id: v.id("letters") },
  handler: async (ctx, { id }) => {
    await own(ctx, id);

    return await ctx.storage.generateUploadUrl();
  },
});

export const setVoice = mutation({
  args: { id: v.id("letters"), file: v.union(v.id("_storage"), v.null()), seconds: v.number() },
  handler: async (ctx, { id, file, seconds }) => {
    const letter = await own(ctx, id);

    if (file !== null) {
      const meta = await ctx.db.system.get(file);

      if (!meta || !meta.contentType?.startsWith("audio/") || meta.size > 12_000_000 || seconds > 181) {
        await ctx.storage.delete(file);

        throw new ConvexError("Voice notes are audio up to 3 minutes.");
      }
    }

    if (letter.voice) await ctx.storage.delete(letter.voice.file);
    await ctx.db.patch(id, {
      voice: file === null ? undefined : { file, seconds: Math.round(seconds) },
      updatedAt: Date.now(),
    });
  },
});
