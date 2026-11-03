import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { siteUrl } from "@/lib/site";
import "./globals.css";
import "./mail.css";
import "./looks.css";
import "./print.css";

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
