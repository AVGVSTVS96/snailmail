# snailmail

A letter, sent as a link, that opens like real mail.

The person you write to gets an envelope with a stamp and a postmark. They turn it over, press and hold the wax seal until it breaks, take the letter out and unfold it, then read it on paper. At the end they can keep a copy as a PDF.

The mail art is inspired by *The Art of Snail Mail* by Martina Calvi (Quadrille, 2026).

## How it works

- **Letters** live in [Convex](https://convex.dev). Each one has an unguessable token, and its page is `/l/<token>`. Nothing lists letters, and every letter page is `noindex`.
- **The opening** is a single client component (`components/mail/experience.tsx`) that steps through envelope → seal → flap → unfold → read. The envelope, seal, stamp and postmark are inline SVG; the paper grain is SVG noise. It respects `prefers-reduced-motion`.
- **Link previews**: each letter has an og:image (a still of the sealed envelope) and an og:video (a 5-second, silent H.264 clip of the envelope opening itself, never showing the letter's text). `scripts/preview.ts` films `/l/<token>/film` frame by frame in headless Chromium, encodes it with ffmpeg and stores both files in Convex. The app serves them from `/l/<token>/envelope.jpg` and `/l/<token>/envelope.mp4` with range support.

## Develop

Requires [Bun](https://bun.sh), ffmpeg, and a Convex account.

```sh
bun install
bunx convex dev          # creates a dev deployment and writes .env.local
bun run dev
```

Seal a letter (functions that write are internal, so only the deployment's admin can call them):

```sh
bunx convex run letters:seal '{"theme":"keepsake","to":"June","toPlace":"Brooklyn, New York","from":"Avery","city":"San Francisco","openWhen":"you have a quiet minute","body":"…","sealedAt":1793664000000,"timeZone":"America/Los_Angeles"}'
bun run preview <token> --base http://localhost:3000
```

Paragraphs in `body` are separated by blank lines.

`bun run check` runs oxlint (with [anti-slop](https://github.com/dmmulroy/anti-slop)'s rules, vendored in `tools/oxlint/anti-slop`), oxfmt and TypeScript.

## Deploy

On Vercel, set `CONVEX_DEPLOY_KEY` (production) and `NEXT_PUBLIC_SITE_URL`; the build runs `convex deploy --cmd 'next build'`. Render previews for production letters with `bun run preview <token> --prod --base https://your-site`.

## License

MIT
