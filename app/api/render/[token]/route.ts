import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { film } from "@/lib/film";
import { present } from "@/lib/site";
import { Uploaded } from "@/lib/upload";

export const maxDuration = 300;

const upload = async (secret: string, bytes: Buffer, type: string) => {
  const url = await fetchMutation(api.render.uploadUrl, { secret });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": type },
    body: new Uint8Array(bytes),
  });

  if (!response.ok) {
    throw new Error(`Upload failed with ${response.status}`);
  }

  const uploaded = Uploaded.parse(await response.json());

  return uploaded.storageId;
};

export const POST = async (request: Request, { params }: RouteContext<"/api/render/[token]">) => {
  const secret = present(process.env.SNAILMAIL_RENDER_SECRET);

  if (secret === null || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { token } = await params;

  if (!/^[\w-]+$/u.test(token)) {
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
