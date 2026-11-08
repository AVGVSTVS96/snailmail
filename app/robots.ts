import type { MetadataRoute } from "next";

import { scrapers } from "@/lib/crawlers";

const robots = (): MetadataRoute.Robots => ({
  rules: [
    { userAgent: scrapers, disallow: "/" },
    { userAgent: "*", allow: "/", disallow: "/api/" },
  ],
});

export default robots;
