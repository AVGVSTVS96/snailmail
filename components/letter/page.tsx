import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { Experience } from "@/components/mail/experience";
import { toDelivery } from "@/lib/delivery";
import type { OpenedLetter } from "@/lib/letters";
import { absolute } from "@/lib/site";
import { resolveTheme } from "@/lib/theme";

const description = "Sealed with wax. It opens like real mail.";

const unindexed = {
  index: false,
  follow: false,
  noarchive: true,
  nosnippet: true,
  noimageindex: true,
  nocache: true,
};

export const letterMetadata = (letter: OpenedLetter | null, url: string): Metadata => {
  if (!letter) {
    notFound();
  }

  const title = `A letter for ${letter.to}`;
  const media = `/l/${letter.token}`;
  const image = letter.image ? absolute(`${media}/envelope.jpg?v=${letter.image}`) : null;
  const video = letter.video ? absolute(`${media}/envelope.mp4?v=${letter.video}`) : null;

  return {
    title,
    description,
    robots: { ...unindexed, googleBot: unindexed },
    referrer: "no-referrer",
    openGraph: {
      type: "website",
      siteName: "snailmail",
      title,
      description,
      url,
      images: image
        ? [
            {
              url: image,
              secureUrl: image,
              type: "image/jpeg",
              width: 1200,
              height: 630,
              alt: `A sealed envelope addressed to ${letter.to}`,
            },
          ]
        : undefined,
      videos: video
        ? [{ url: video, secureUrl: video, type: "video/mp4", width: 1200, height: 630 }]
        : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
};

export const letterViewport = (letter: OpenedLetter | null): Viewport => {
  const theme = resolveTheme(letter?.theme ?? "keepsake", letter?.style ?? {});

  return { themeColor: theme.surface, viewportFit: "cover" };
};

export const LetterView = ({ letter }: { letter: OpenedLetter | null }) => {
  if (!letter) {
    notFound();
  }

  return <Experience delivery={toDelivery(letter)} />;
};
