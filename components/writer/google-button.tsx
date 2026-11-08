"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

export const GoogleButton = ({ children }: { children: ReactNode }) => {
  const next = useSearchParams().get("next");

  const href = next?.startsWith("/letters")
    ? `/auth/google?next=${encodeURIComponent(next)}`
    : "/auth/google";

  return (
    <a className="w-google" href={href}>
      {children}
    </a>
  );
};
