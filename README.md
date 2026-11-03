# snailmail

A letter, sent as a link, that opens like real mail.

The person you write to gets an envelope with a stamp and a postmark. They turn it over, press and hold the wax seal until it breaks, take the letter out and unfold it, then read it on paper. At the end they can keep a copy as a PDF.

Writers sign in with Google, write on paper in the browser and watch a live preview of the opening as they go. Each letter picks one of four themes (Keepsake, Par Avion, Pressed, Midnight) and then any paper, finish, ink, typeface, wax, seal emblem, stamp and envelope liner, plus an optional drawn signature and voice note. Publishing gives a link; nobody needs an account to open it.

The mail art is inspired by _The Art of Snail Mail_ by Martina Calvi (Quadrille, 2026).

## How it works

- **Letters** live in [Convex](https://convex.dev). Each one has an unguessable token, and its page is `/l/<token>`. Nothing lists letters.
- **Writers** sign in through [WorkOS AuthKit](https://workos.com/docs/authkit) (Google). Convex checks the WorkOS token on every writer call (`convex/writer.ts`), so a writer only ever sees and edits their own letters. Drafts never open for anyone else.
- **Names**: when `SNAILMAIL_ROOT_DOMAIN` is set (say `example.com`, with a wildcard `*.example.com` pointed at the app), a published letter also opens at `https://<name>.example.com/<key>`. The name starts as the recipient's and the writer can change it; the 4-character key stays on unless the writer makes the link public, so a name alone opens nothing. `proxy.ts` rewrites those hosts to `/s/<name>/<key>`. Without the variable, every letter uses its `/l/<token>` link.
- **Privacy**: a letter's page carries only the envelope. Its words load when the reader breaks the seal (`POST /l/<token>/letter`, never cached), so a crawler or link-preview bot that fetches the link never sees them. Convex answers letter lookups only for the app's server, which passes the reader's network, and a network that misses 20 tokens in an hour gets nothing for the rest of it. Every letter route sends `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex`, and `robots.txt` shuts out AI crawlers entirely; search engines may still fetch a letter link, because that is how they read its noindex.
- **Opens**: a letter counts an open each time its words load, except when its own writer is signed in on that browser. With "Tell me when it's opened" on (the default), its first open sends the writer one email, through [AgentMail](https://agentmail.to) (`convex/notify.ts`).
- **The opening** is a single client component (`components/mail/experience.tsx`) that steps through envelope → seal → flap → unfold → read. The envelope, seal, stamp and postmark are inline SVG; the paper grain is SVG noise. It respects `prefers-reduced-motion`.
- **Link previews**: each letter has an og:image (a still of the sealed envelope) and an og:video (a 5-second, silent H.264 clip of the envelope opening itself, never showing the letter's text). When a letter is published, the Convex action `render:request` calls `/api/render/<token>`, which films `/l/<token>/film` frame by frame in headless Chromium ([@sparticuz/chromium](https://github.com/Sparticuz/chromium) on Vercel), encodes it with ffmpeg and stores both files in Convex, replacing any older ones. The app serves them from `/l/<token>/envelope.jpg` and `/l/<token>/envelope.mp4` with range support.

## Develop

Requires [Bun](https://bun.sh) and a Convex account.

```sh
bun install
bunx convex dev          # creates a dev deployment and writes .env.local
bunx playwright-core install chromium
bun run dev
```

Writer sign-in needs a WorkOS environment with Google turned on: add `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_COOKIE_PASSWORD` (32+ characters) and `NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback` to `.env.local`, and `bunx convex env set WORKOS_CLIENT_ID <id>`. `convex.json` registers the dev redirect URI with WorkOS. To try names locally, set `SNAILMAIL_ROOT_DOMAIN=localhost:3000` and open `http://<name>.localhost:3000/<key>`.

Link previews need a shared secret in both Convex and Next.js: run `bunx convex env set SNAILMAIL_RENDER_SECRET <secret>` and add the same `SNAILMAIL_RENDER_SECRET=<secret>` to `.env.local` (make one with `openssl rand -hex 32`).

Seal a letter (`letters:seal` is internal, so only the deployment's admin can call it):

```sh
bunx convex run letters:seal '{"theme":"keepsake","to":"June","toPlace":"Brooklyn, New York","from":"Avery","city":"San Francisco","openWhen":"you have a quiet minute","body":"…","sealedAt":1793664000000,"timeZone":"America/Los_Angeles"}'
bun run preview <token> --base http://localhost:3000   # renders its link preview
```

Paragraphs in `body` are separated by blank lines. After testing a letter's link yourself while signed out, `bunx convex run letters:resetOpens '{"token":"<token>"}'` sets its open count back to zero, so its first real open still sends the email.

`bun run check` runs oxlint (with [anti-slop](https://github.com/dmmulroy/anti-slop)'s rules, vendored in `tools/oxlint/anti-slop`), oxfmt and TypeScript.

## Deploy

On Vercel, set `CONVEX_DEPLOY_KEY`, `SNAILMAIL_RENDER_SECRET`, `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_COOKIE_PASSWORD`, `NEXT_PUBLIC_WORKOS_REDIRECT_URI` (`https://your-site/callback`, also added as a redirect URI in WorkOS) and, once a domain with a wildcard record is added, `SNAILMAIL_ROOT_DOMAIN` (production). In the production Convex deployment, set `WORKOS_CLIENT_ID`, the same `SNAILMAIL_RENDER_SECRET` and `SNAILMAIL_SITE_URL` (the site's address, which `render:request` calls). Open emails also need `WORKOS_API_KEY` (to look up the writer's address), `AGENTMAIL_API_KEY` and `SNAILMAIL_MAIL_FROM` (the AgentMail inbox they come from); without them, opens are still counted and no email goes out. Link previews use the project's production domain, or `NEXT_PUBLIC_SITE_URL` when set. The build runs `convex deploy --cmd 'next build'`. Re-render a production letter's preview with `bun run preview <token> --prod --base https://your-site`.

## License

MIT
