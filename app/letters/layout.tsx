import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { WriterProviders } from "@/components/writer/providers";
import { hosts } from "@/lib/links";
import "./writer.css";

export const metadata: Metadata = { title: "Letters · snailmail", robots: { index: false, follow: false } };

async function Writer({ children }: { children: React.ReactNode }) {
  await connection();

  return <WriterProviders hosts={hosts}>{children}</WriterProviders>;
}

export default function WriterLayout({ children }: LayoutProps<"/letters">) {
  return (
    <Suspense fallback={<div className="writer w-loading" />}>
      <Writer>{children}</Writer>
    </Suspense>
  );
}
