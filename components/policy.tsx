import Link from "next/link";
import type { ReactNode } from "react";
import { keepsake } from "@/lib/theme";
import { themeStyle } from "@/lib/texture";

export function Policy({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="desk policy" style={themeStyle(keepsake)}>
      <h1 className="keep-title">{title}</h1>
      {children}
      <Link className="credit-site" href="/">
        snailmail
      </Link>
    </main>
  );
}
