import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { WriterProviders } from "@/components/writer/providers";
import { hosts } from "@/lib/links";

import "./writer.css";
import "./motion.css";

export const metadata: Metadata = {
  title: "Letters · snailmail",
  robots: { index: false, follow: false },
};

const Writer = async ({ children }: { children: React.ReactNode }) => {
  await connection();

  return <WriterProviders hosts={hosts}>{children}</WriterProviders>;
};

const WriterLayout = ({ children }: LayoutProps<"/letters">) => (
  <Suspense fallback={<div className="writer w-loading" />}>
    <Writer>{children}</Writer>
  </Suspense>
);

export default WriterLayout;
