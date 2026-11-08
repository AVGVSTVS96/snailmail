import Link from "next/link";
import type { ReactNode } from "react";

import { themeStyle } from "@/lib/texture";
import { keepsake } from "@/lib/theme";

export const Policy = ({ title, children }: { title: string; children: ReactNode }) => (
  <main className="desk policy" style={themeStyle(keepsake)}>
    <h1 className="keep-title">{title}</h1>
    {children}
    <Link className="credit-site" href="/">
      snailmail
    </Link>
  </main>
);
