import { present, siteUrl } from "./site";

export const rootDomain = present(process.env.SNAILMAIL_ROOT_DOMAIN);

export interface Hosts {
  root: string | null;
  site: string;
}

export const hosts: Hosts = { root: rootDomain, site: siteUrl };

export const letterLink = (
  { token, slug, key }: { token: string; slug: string | null; key: string | null },
  { root, site }: Hosts = hosts,
) => {
  if (root === null || slug === null || slug === "") {
    return new URL(`/l/${token}`, site).href;
  }

  const scheme = root.startsWith("localhost") ? "http" : "https";

  return `${scheme}://${slug}.${root}/${key ?? ""}`;
};
