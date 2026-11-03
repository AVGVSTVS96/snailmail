import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import chromium from "@sparticuz/chromium";
import ffmpeg from "ffmpeg-static";
import { type Browser, chromium as playwright, type Page } from "playwright-core";

const fps = 30;
const seconds = 5;
const posterAt = 1500;
const cameras = 3;

async function launch() {
  if (!process.env.VERCEL) return await playwright.launch();

  return await playwright.launch({ args: chromium.args, executablePath: await chromium.executablePath() });
}

function seek(page: Page, ms: number) {
  return page.evaluate((t) => {
    for (const animation of document.getAnimations()) {
      animation.pause();
      animation.currentTime = t;
    }
  }, ms);
}

async function frames(pages: Page[]) {
  const shots: Buffer[] = [];

  await Promise.all(
    pages.map(async (page, camera) => {
      for (let frame = camera; frame < fps * seconds; frame += pages.length) {
        await seek(page, (frame * 1000) / fps);
        shots[frame] = await page.screenshot({ type: "jpeg", quality: 95 });
      }
    }),
  );

  return shots;
}

async function encode(shots: Buffer[]) {
  if (!ffmpeg) throw new Error("No ffmpeg binary for this platform");
  const dir = await mkdtemp(join(tmpdir(), "snailmail-"));
  const file = join(dir, "envelope.mp4");

  try {
    const encoder = spawn(
      ffmpeg,
      [
        ...["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-"],
        ...["-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "24"],
        ...["-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", file],
      ],
      { stdio: ["pipe", "ignore", "inherit"] },
    );

    const done = new Promise<void>((resolve, reject) => {
      encoder.on("error", reject);
      encoder.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
    });

    for (const shot of shots) encoder.stdin.write(shot);
    encoder.stdin.end();
    await done;

    return await readFile(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function open(browser: Browser, url: string) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const response = await page.goto(url, { waitUntil: "networkidle" });

  if (!response?.ok()) throw new Error(`${url} answered ${response?.status()}`);
  await page.evaluate(() => document.fonts.ready);

  return page;
}

export async function film(url: string) {
  const browser = await launch();

  try {
    const pages = await Promise.all(Array.from({ length: cameras }, () => open(browser, url)));
    const shots = await frames(pages);

    await seek(pages[0], posterAt);
    const image = await pages[0].screenshot({ type: "jpeg", quality: 90 });

    return { image, video: await encode(shots) };
  } finally {
    await browser.close();
  }
}
