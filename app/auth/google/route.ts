import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");

  redirect(await getSignInUrl({ returnTo: next?.startsWith("/letters") ? next : "/letters" }));
}
