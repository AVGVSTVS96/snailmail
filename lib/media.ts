import { fetchQuery } from "convex/nextjs";
import { cacheLife } from "next/cache";
import { api } from "@/convex/_generated/api";

async function fetchMedia(token: string, kind: "image" | "video") {
  const url = await fetchQuery(api.letters.media, { token, kind });

  if (!url) return null;
  const response = await fetch(url);

  if (!response.ok) return null;

  return new Uint8Array(await response.arrayBuffer());
}

async function fetchVersion(token: string, kind: "image" | "video", _version: string) {
  "use cache";
  cacheLife("max");

  return await fetchMedia(token, kind);
}

function byteRange(header: string | null, size: number) {
  const match = header?.match(/^bytes=(\d*)-(\d*)$/);

  if (!match || (match[1] === "" && match[2] === "")) return null;
  const start = match[1] === "" ? Math.max(0, size - Number(match[2])) : Number(match[1]);
  const end = match[1] === "" || match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);

  return start <= end && start < size ? { start, end } : "unsatisfiable";
}

export async function serveMedia(request: Request, token: string, kind: "image" | "video") {
  const version = new URL(request.url).searchParams.get("v");
  const bytes = version === null ? await fetchMedia(token, kind) : await fetchVersion(token, kind, version);

  if (!bytes) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "Content-Type": kind === "image" ? "image/jpeg" : "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": version === null ? "public, max-age=300" : "public, max-age=31536000, immutable",
    "X-Robots-Tag": "noindex",
  });

  const range = byteRange(request.headers.get("range"), bytes.length);

  if (range === "unsatisfiable") {
    headers.set("Content-Range", `bytes */${bytes.length}`);

    return new Response(null, { status: 416, headers });
  }

  if (!range) {
    headers.set("Content-Length", String(bytes.length));

    return new Response(request.method === "HEAD" ? null : bytes, { headers });
  }

  const slice = bytes.subarray(range.start, range.end + 1);
  headers.set("Content-Range", `bytes ${range.start}-${range.end}/${bytes.length}`);
  headers.set("Content-Length", String(slice.length));

  return new Response(request.method === "HEAD" ? null : slice, { status: 206, headers });
}
