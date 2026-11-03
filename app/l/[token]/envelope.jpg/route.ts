import { serveMedia } from "@/lib/media";

export async function GET(request: Request, { params }: RouteContext<"/l/[token]/envelope.jpg">) {
  const { token } = await params;

  return serveMedia(request, token, "image");
}

export const HEAD = GET;
