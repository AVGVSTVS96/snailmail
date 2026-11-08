import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { film } from "@/lib/film";

export const maxDuration = 300;

const upload = async (secret: string, bytes: Buffer, type: string): Promise<Id<"_storage">> => {
  const url = await fetchMutation(api.render.uploadUrl, { secret });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": type },
    body: new Uint8Array(bytes),
  });

  if (!response.ok) {
    throw new Error(`Upload failed with ${response.status}`);
  }

  const { storageId } = await response.json();

  return storageId;
};

export const POST = async (request: Request, { params }: RouteContext<"/api/render/[token]">) => {
  const secret = process.env.SNAILMAIL_RENDER_SECRET;

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { token } = await params;

  if (!/^[\w-]+$/.test(token)) {
    return new Response("Bad token", { status: 400 });
  }

  const started = performance.now();
  const { image, video } = await film(new URL(`/l/${token}/film`, request.url).href);
  const filmed = performance.now();

  const [imageId, videoId] = await Promise.all([
    upload(secret, image, "image/jpeg"),
    upload(secret, video, "video/mp4"),
  ]);

  await fetchMutation(api.render.attach, { secret, token, image: imageId, video: videoId });

  return Response.json({
    seconds: { film: (filmed - started) / 1000, total: (performance.now() - started) / 1000 },
    bytes: { image: image.length, video: video.length },
  });
};
