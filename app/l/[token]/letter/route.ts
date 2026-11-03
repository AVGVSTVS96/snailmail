import { readLetter } from "@/lib/letters";

const headers = { "Cache-Control": "private, no-store" };

export async function POST(_request: Request, { params }: RouteContext<"/l/[token]/letter">) {
  const { token } = await params;
  const words = await readLetter(token);

  if (words === "limited")
    return new Response("Too many requests", { status: 429, headers: { ...headers, "Retry-After": "3600" } });

  if (!words) return new Response("Not found", { status: 404, headers });

  return Response.json(words, { headers });
}
