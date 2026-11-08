export const present = (value: string | undefined) =>
  value === undefined || value === "" ? null : value;

const productionHost = present(process.env.VERCEL_PROJECT_PRODUCTION_URL);

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (productionHost === null ? "http://localhost:3000" : `https://${productionHost}`);

export const absolute = (path: string) => new URL(path, siteUrl).href;
