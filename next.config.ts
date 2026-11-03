import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: false,
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
