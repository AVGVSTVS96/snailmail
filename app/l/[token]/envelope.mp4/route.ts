import { serveMedia } from "@/lib/media";

export async function GET(request: Request, { params }: RouteContext<"/l/[token]/envelope.mp4">) {
  const { token } = await params;

  return serveMedia(request, token, "video");
}

export const HEAD = GET;
