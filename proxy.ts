import { authkit, handleAuthkitProxy } from "@workos-inc/authkit-nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { unindexed } from "@/lib/crawlers";

const root = process.env.SNAILMAIL_ROOT_DOMAIN?.toLowerCase();

function letterSlug(host: string | null) {
  const name = host?.toLowerCase();

  if (!root || !name?.endsWith(`.${root}`)) return null;
  const slug = name.slice(0, -root.length - 1);

  return /^[a-z0-9-]+$/.test(slug) && slug !== "www" ? slug : null;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const slug = letterSlug(request.headers.get("host"));

  if (slug) {
    const key = pathname.match(/^\/([a-z0-9]{0,12})$/)?.[1];

    const url = request.nextUrl.clone();
    url.pathname = key ? `/s/${slug}/${key}` : `/s/${slug}`;
    const response = key === undefined ? NextResponse.next() : NextResponse.rewrite(url);
    response.headers.set("X-Robots-Tag", unindexed);

    return response;
  }

  if (!pathname.startsWith("/letters")) return NextResponse.next();
  const { session, headers } = await authkit(request);

  if (!session.user) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", pathname);

    return handleAuthkitProxy(request, headers, { redirect: signIn });
  }

  return handleAuthkitProxy(request, headers);
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\.(?:svg|png|jpg|mp4|ico|webmanifest|txt)$).*)"],
};
