import { fetchMutation } from "convex/nextjs";
import { cacheLife } from "next/cache";
import { api } from "@/convex/_generated/api";
import { door } from "./letters";

async function stored(_id: string, url: string) {
  "use cache";
  cacheLife("max");
  const response = await fetch(url);

  if (!response.ok) throw new Error(`Storage answered ${response.status}`);

  return new Uint8Array(await response.arrayBuffer());
}

function byteRange(header: string | null, size: number) {
  const match = header?.match(/^bytes=(\d*)-(\d*)$/);

  if (!match || (match[1] === "" && match[2] === "")) return null;
  const start = match[1] === "" ? Math.max(0, size - Number(match[2])) : Number(match[1]);
  const end = match[1] === "" || match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);

  return start <= end && start < size ? { start, end } : "unsatisfiable";
}

export async function serveMedia(request: Request, token: string, kind: "image" | "video") {
  const args = await door(token);
  const found = args ? await fetchMutation(api.letters.preview, { ...args, kind }) : null;

  if (found === "limited")
    return new Response("Too many requests", { status: 429, headers: { "Retry-After": "3600" } });

  if (!found) return new Response("Not found", { status: 404 });
  const bytes = await stored(found.id, found.url);
  const current = new URL(request.url).searchParams.get("v") === found.id;

  const headers = new Headers({
    "Content-Type": kind === "image" ? "image/jpeg" : "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": current ? "public, max-age=31536000, immutable" : "public, max-age=300",
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
