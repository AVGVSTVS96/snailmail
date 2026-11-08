import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const next = request.nextUrl.searchParams.get("next");

  const url = new URL(
    await getSignInUrl({ returnTo: next?.startsWith("/letters") === true ? next : "/letters" }),
  );

  url.searchParams.set("provider", "GoogleOAuth");
  url.searchParams.delete("screen_hint");
  redirect(url.href);
};
