import "server-only";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import chromium from "@sparticuz/chromium";
import ffmpeg from "ffmpeg-static";
import { chromium as playwright } from "playwright-core";
import type { Page } from "playwright-core";

import { present } from "./site";

const fps = 30;
const seconds = 5;
const posterAt = 1500;

const launch = async () => {
  if (present(process.env.VERCEL) === null) {
    return await playwright.launch();
  }

  return await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  });
};

const seek = async (page: Page, ms: number) => {
  await page.evaluate((t) => {
    for (const animation of document.getAnimations()) {
      animation.pause();
      animation.currentTime = t;
    }
  }, ms);
};

const encode = async (page: Page) => {
  if (ffmpeg === null) {
    throw new Error("No ffmpeg binary for this platform");
  }

  const dir = await mkdtemp(path.join(tmpdir(), "snailmail-"));
  const file = path.join(dir, "envelope.mp4");

  try {
    const encoder = spawn(
      ffmpeg,
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
        file,
      ],
      { stdio: ["pipe", "ignore", "inherit"] },
    );

    const closed = once(encoder, "close");

    for (let frame = 0; frame < fps * seconds; frame += 1) {
      await seek(page, (frame * 1000) / fps);
      encoder.stdin.write(await page.screenshot({ type: "jpeg", quality: 95 }));
    }

    encoder.stdin.end();
    await closed;

    if (encoder.exitCode !== 0) {
      throw new Error(`ffmpeg exited ${String(encoder.exitCode)}`);
    }

    return await readFile(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

export const film = async (url: string) => {
  const browser = await launch();

  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });

    const response = await page.goto(url, { waitUntil: "networkidle" });

    if (response?.ok() !== true) {
      throw new Error(`${url} answered ${response?.status()}`);
    }

    await page.evaluate(async () => await document.fonts.ready);

    await seek(page, posterAt);
    const image = await page.screenshot({ type: "jpeg", quality: 90 });
    const video = await encode(page);

    return { image, video };
  } finally {
    await browser.close();
  }
};
