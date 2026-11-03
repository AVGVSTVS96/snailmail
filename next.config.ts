import type { NextConfig } from "next";

const unindexed = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" }];

const nextConfig: NextConfig = {
  headers: async () => [
    { source: "/l/:path*", headers: unindexed },
    { source: "/s/:path*", headers: unindexed },
    { source: "/letters/:path*", headers: unindexed },
    { source: "/preview", headers: unindexed },
    { source: "/api/:path*", headers: unindexed },
  ],
  cacheComponents: true,
  devIndicators: false,
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: {
    "/api/render/*": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/ffmpeg-static/ffmpeg",
      "./node_modules/playwright-core/**",
    ],
  },
  partialPrefetching: true,
  htmlLimitedBots:
    /facebookexternalhit|Facebot|Twitterbot|TelegramBot|WhatsApp|Slackbot|Discordbot|LinkedInBot|SkypeUriPreview|redditbot|vkShare|Applebot|Googlebot|Google-|bingbot|DuckDuckBot|Embedly|Iframely|bot\b/i,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
