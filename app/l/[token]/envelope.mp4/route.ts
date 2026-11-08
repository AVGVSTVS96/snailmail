import { serveMedia } from "@/lib/media";

export const GET = async (
  request: Request,
  { params }: RouteContext<"/l/[token]/envelope.mp4">,
) => {
  const { token } = await params;

  return await serveMedia(request, token, "video");
};

export const HEAD = GET;
