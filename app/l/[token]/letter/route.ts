import { authkit } from "@workos-inc/authkit-nextjs";
import type { NextRequest } from "next/server";

import { readLetter } from "@/lib/letters";

const headers = { "Cache-Control": "private, no-store" };

const signedIn = async (request: NextRequest) => {
  if (!request.cookies.has("wos-session")) {
    return null;
  }

  try {
    const { session } = await authkit(request);

    return session.user?.id ?? null;
  } catch {
    return null;
  }
};

export const POST = async (request: NextRequest, { params }: RouteContext<"/l/[token]/letter">) => {
  const { token } = await params;
  const words = await readLetter(token, await signedIn(request));

  if (words === "limited") {
    return new Response("Too many requests", {
      status: 429,
      headers: { ...headers, "Retry-After": "3600" },
    });
  }

  if (!words) {
    return new Response("Not found", { status: 404, headers });
  }

  return Response.json(words, { headers });
};
