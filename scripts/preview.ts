import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const [token, ...flags] = process.argv.slice(2);

if (!token)
  throw new Error("Usage: bun scripts/preview.ts <token> [--prod] [--base http://localhost:3000] [--keep dir]");

const prod = flags.includes("--prod");
const option = (name: string) => (flags.includes(name) ? flags[flags.indexOf(name) + 1] : null);
const base = option("--base") ?? "http://localhost:3000";
const keep = option("--keep");

const fps = 30;
const seconds = 5;
const posterAt = 1500;

function run(command: string, args: string[], input?: NodeJS.ReadableStream) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { stdio: [input ? "pipe" : "ignore", "pipe", "inherit"] });
    let out = "";
    child.stdout?.on("data", (chunk) => (out += chunk));

    if (input && child.stdin) input.pipe(child.stdin);
    child.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error(`${command} exited ${code}`))));
  });
}

const dir = keep ?? (await mkdtemp(join(tmpdir(), "snailmail-")));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

await page.goto(`${base}/l/${token}/film`, { waitUntil: "networkidle" });

await page.evaluate(() => document.fonts.ready);

const seek = (ms: number) =>
  page.evaluate((t) => {
    for (const animation of document.getAnimations()) {
      animation.pause();
      animation.currentTime = t;
    }
  }, ms);

await seek(posterAt);

await page.screenshot({ path: join(dir, "envelope.jpg"), type: "jpeg", quality: 90 });

const ffmpeg = spawn(
  "ffmpeg",
  [
    "-y",
    "-loglevel",
    "error",
    "-f",
    "image2pipe",
    "-framerate",
    String(fps),
    "-i",
    "-",
    "-c:v",
    "libx264",
    "-profile:v",
    "high",
    "-preset",
    "slow",
    "-crf",
    "24",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    join(dir, "envelope.mp4"),
  ],
  { stdio: ["pipe", "inherit", "inherit"] },
);

const done = new Promise<void>((resolve, reject) =>
  ffmpeg.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)))),
);

for (let frame = 0; frame < fps * seconds; frame++) {
  await seek((frame * 1000) / fps);
  ffmpeg.stdin.write(await page.screenshot({ type: "png" }));
}

ffmpeg.stdin.end();

await done;

await browser.close();

type FunctionArgs = { token?: string; image?: string; video?: string };

const convex = (fn: string, args: FunctionArgs) =>
  run("bunx", ["convex", "run", ...(prod ? ["--prod"] : []), fn, JSON.stringify(args)]).then((out) =>
    out.trim() === "" ? null : JSON.parse(out),
  );

async function upload(file: string, type: string) {
  const url: string = await convex("letters:uploadUrl", {});
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": type }, body: await readFile(file) });
  const { storageId } = await response.json();

  return storageId;
}

const image = await upload(join(dir, "envelope.jpg"), "image/jpeg");
const video = await upload(join(dir, "envelope.mp4"), "video/mp4");

await convex("letters:attachMedia", { token, image, video });

console.log(`Attached envelope.jpg and envelope.mp4 to ${token}${keep ? ` (kept in ${dir})` : ""}`);

if (!keep) await rm(dir, { recursive: true });
