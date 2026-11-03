import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
