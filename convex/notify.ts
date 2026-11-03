import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalQuery } from "./_generated/server";

export const opening = internalQuery({
  args: { id: v.id("letters") },
  handler: async (ctx, { id }) => {
    const letter = await ctx.db.get(id);

    return letter && { owner: letter.owner, to: letter.to, sealedAt: letter.sealedAt, timeZone: letter.timeZone };
  },
});

async function writerEmail(owner: string, apiKey: string) {
  const response = await fetch(`https://api.workos.com/user_management/users/${encodeURIComponent(owner)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) throw new Error(`WorkOS answered ${response.status} for the writer`);
  const user: { email: string } = await response.json();

  return user.email;
}

export const opened = internalAction({
  args: { id: v.id("letters") },
  handler: async (ctx, { id }) => {
    const { WORKOS_API_KEY, AGENTMAIL_API_KEY, SNAILMAIL_MAIL_FROM, SNAILMAIL_SITE_URL } = process.env;

    if (!WORKOS_API_KEY || !AGENTMAIL_API_KEY || !SNAILMAIL_MAIL_FROM || !SNAILMAIL_SITE_URL) {
      console.warn("Open emails need WORKOS_API_KEY, AGENTMAIL_API_KEY, SNAILMAIL_MAIL_FROM and SNAILMAIL_SITE_URL");

      return;
    }

    const letter = await ctx.runQuery(internal.notify.opening, { id });

    if (!letter?.owner) return;

    const sealed = new Date(letter.sealedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      timeZone: letter.timeZone,
    });

    const letters = new URL("/letters", SNAILMAIL_SITE_URL).href;
    const line = `${letter.to} opened the letter you sealed on ${sealed}.`;
    const footer = "You asked to hear when it was first opened. This is the only email about it.";

    const response = await fetch(
      `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(SNAILMAIL_MAIL_FROM)}/messages/send`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${AGENTMAIL_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          to: [await writerEmail(letter.owner, WORKOS_API_KEY)],
          subject: `${letter.to} opened your letter`,
          text: `${line}\n\nYour letters: ${letters}\n\n${footer}\n\nsnailmail`,
          html: `<div style="font:16px/1.5 -apple-system,system-ui,sans-serif;color:#111;max-width:480px">
<p>${escape(line)}</p>
<p><a href="${letters}" style="color:#111">Your letters</a></p>
<p style="color:#8a8a8a;font-size:13px">${footer}<br>snailmail</p>
</div>`,
        }),
      },
    );

    if (!response.ok) throw new Error(`AgentMail answered ${response.status}: ${await response.text()}`);
  },
});

function escape(text: string) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
