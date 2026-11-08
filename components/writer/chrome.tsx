import Link from "next/link";

import { SealedEnvelope } from "@/components/mail/sealed";
import { resolveTheme } from "@/lib/theme";
import type { Style, ThemeKey } from "@/lib/theme";

export const bookUrl = "https://www.penguin.co.uk/books/481503";

export const Wordmark = ({ size = 19 }: { size?: number }) => (
  <Link href="/" className="w-wordmark" style={{ fontSize: size }}>
    <span className="w-dot" />
    snailmail
  </Link>
);

export const MiniEnvelope = ({
  theme,
  style,
  initial,
  seed,
}: {
  theme: ThemeKey;
  style: Style | null;
  initial: string;
  seed: number;
}) => (
  <SealedEnvelope
    theme={resolveTheme(theme, style ?? {})}
    from={null}
    initial={initial}
    seed={seed}
    className="w-mini"
  />
);

export const Credit = () => (
  <span className="w-credit">
    Inspired by{" "}
    <a href={bookUrl} target="_blank" rel="noreferrer">
      <em>The Art of Snail Mail</em>
    </a>{" "}
    by Martina Calvi
  </span>
);
