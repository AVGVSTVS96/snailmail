import type { Metadata } from "next";
import { Preview } from "@/components/writer/preview";

export const metadata: Metadata = { title: "Preview · snailmail", robots: { index: false, follow: false } };

export default function PreviewPage() {
  return <Preview />;
}
