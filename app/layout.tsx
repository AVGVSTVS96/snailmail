import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";
import "./mail.css";

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? (productionHost ? `https://${productionHost}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "snailmail",
  description: "A letter, sent as a link, that opens like real mail.",
};

export const viewport: Viewport = {
  themeColor: "#2B2320",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
