import { serveMedia } from "@/lib/media";

export const GET = async (
  request: Request,
  { params }: RouteContext<"/l/[token]/envelope.jpg">,
) => {
  const { token } = await params;

  return await serveMedia(request, token, "image");
};

export const HEAD = GET;
