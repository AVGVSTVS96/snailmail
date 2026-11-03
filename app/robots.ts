import type { MetadataRoute } from "next";
import { scrapers } from "@/lib/crawlers";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: scrapers, disallow: "/" },
      { userAgent: "*", allow: "/", disallow: "/api/" },
    ],
  };
}
