import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Envelope } from "@/components/mail/envelope";
import { toDelivery } from "@/lib/delivery";
import { getLetter } from "@/lib/letters";
import { deskProps } from "@/lib/texture";

import "./film.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true, noimageindex: true },
};

const FilmPage = ({ params }: PageProps<"/l/[token]/film">) => (
  <Suspense>
    {params.then(({ token }) => (
      <Film token={token} />
    ))}
  </Suspense>
);

export default FilmPage;

const Film = async ({ token }: { token: string }) => {
  const letter = await getLetter(token);

  if (!letter) {
    notFound();
  }

  const { theme, address, seed, initial } = toDelivery(letter);

  return (
    <main className="desk film" {...deskProps(theme)}>
      <div className="film-stage">
        <div className="film-envelope">
          <Envelope
            theme={theme}
            address={address}
            seed={seed}
            initial={initial}
            seal={
              <svg viewBox="0 0 112 112" className="film-ring" aria-hidden>
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  fill="none"
                  stroke={theme.ink}
                  strokeOpacity="0.28"
                  strokeWidth="1.5"
                />
                <circle
                  className="film-ring-fill"
                  cx="56"
                  cy="56"
                  r="46"
                  fill="none"
                  stroke={theme.ink}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  pathLength="1"
                  strokeDasharray="1"
                  transform="rotate(-90 56 56)"
                />
              </svg>
            }
          />
        </div>
      </div>
      <div className="film-mark">snailmail</div>
    </main>
  );
};
