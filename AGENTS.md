# snailmail

A letter, sent as a link, that opens like real mail. Next 16 + Convex on Vercel, WorkOS AuthKit sign-in. Public, MIT.

## Commands

- `bun run check`: oxlint, oxfmt, `tsc` for the app and for `convex/`, `bun test`. Lefthook runs it before each commit, CI on each push.
- `bun run fix`: oxlint's fixes, then oxfmt.
- `bunx convex dev` then `bun run dev`: local app; README's Develop section lists the env it needs.
- `bun run preview <token> [--prod] --base <site>`: re-renders a letter's link preview.
- Deploy is Vercel's build: `bunx convex deploy --cmd 'bun run build'`.

## Map

| Folder               | Job                                                                   | Imports              |
| -------------------- | --------------------------------------------------------------------- | -------------------- |
| `app/`               | routes: read, derive, render                                          | components, lib      |
| `components/mail/`   | what the reader sees: envelope, seal, sheet, the opening (Experience) | lib                  |
| `components/writer/` | the writer: letter list, composer, options, publish dialog            | components/mail, lib |
| `components/letter/` | a letter page's metadata and view                                     | components/mail, lib |
| `lib/`               | domain and adapters: delivery, theme, fold, links, film, media        | nothing in the app   |
| `lib/outside.ts`     | the only home of React effects                                        | react                |
| `convex/`            | the backend: schema, letters (readers), writer, render, notify        | its own files        |
| `test/`              | `bun test` for lib and convex rules                                   | lib, convex          |

## Rules and what enforces them

| Rule                                                                                                                                                              | Enforced by                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `lib/` never imports `components/` or `app/`                                                                                                                      | `oxlint.config.ts` override                    |
| No raw effects: derive in render, act in handlers, the named hooks in `lib/outside.ts`                                                                            | `oxlint.config.ts`                             |
| No `as` or `any`; comments only for a decision or fact the code can't show (one `WHY:` line or a link); outside input (JSON, env, ids) is parsed where it arrives | `oxlint.config.ts`, zod, Convex validators     |
| The Chromium/ffmpeg path and the render secret never reach a client bundle                                                                                        | `import "server-only"` in film, letters, media |

## Privacy

- A letter's page carries only the envelope. Its words load when the reader breaks the seal (`POST /l/<token>/letter`, never cached), so crawlers and link previews never see them.
- Nothing lists letters; a letter opens only by its unguessable token, or its name plus key. Convex answers letter lookups only for the app's server, and a network that misses 20 tokens in an hour is shut out for the rest of it.
- Every letter route sends `X-Robots-Tag: noindex…` and `robots.txt` shuts out AI crawlers.
- Opening a letter while signed out counts as the reader's open and can send its writer the one email; test real letters signed in, or reset with `letters:resetOpens`.
- The repo is public: no names, emails, tokens or keys in code, fixtures or screenshots.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
