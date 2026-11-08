import { authkit, handleAuthkitProxy } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { unindexed } from "@/lib/crawlers";
import { rootDomain } from "@/lib/links";

const root = rootDomain?.toLowerCase() ?? null;

const letterSlug = (host: string | null) => {
  const name = host?.toLowerCase();

  if (root === null || name?.endsWith(`.${root}`) !== true) {
    return null;
  }

  const slug = name.slice(0, -root.length - 1);

  return /^[a-z0-9-]+$/u.test(slug) && slug !== "www" ? slug : null;
};

const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const slug = letterSlug(request.headers.get("host"));

  if (slug !== null) {
    const key = /^\/(?<key>[a-z0-9]{0,12})$/u.exec(pathname)?.groups?.key;

    const url = request.nextUrl.clone();
    url.pathname = key === undefined || key === "" ? `/s/${slug}` : `/s/${slug}/${key}`;
    const response = key === undefined ? NextResponse.next() : NextResponse.rewrite(url);
    response.headers.set("X-Robots-Tag", unindexed);

    return response;
  }

  if (!pathname.startsWith("/letters")) {
    return NextResponse.next();
  }

  const { session, headers } = await authkit(request);

  if (!session.user) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", pathname);

    return handleAuthkitProxy(request, headers, { redirect: signIn });
  }

  return handleAuthkitProxy(request, headers);
};

export default proxy;

export const config = {
  matcher: ["/((?!_next/|api/|.*\\.(?:svg|png|jpg|mp4|ico|webmanifest|txt)$).*)"],
};
