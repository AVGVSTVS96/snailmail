import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Experience } from "@/components/mail/experience";
import { getLetter, toDelivery } from "@/lib/letters";
import { keepsake } from "@/lib/theme";
import { themeStyle } from "@/lib/texture";

export async function generateMetadata({ params }: PageProps<"/l/[token]">): Promise<Metadata> {
  const { token } = await params;
  const letter = await getLetter(token);

  if (!letter) notFound();
  const title = `A letter for ${letter.to}`;
  const description = "Sealed with wax. It opens like real mail.";
  const url = `/l/${token}`;

  return {
    title,
    description,
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
    referrer: "no-referrer",
    openGraph: {
      type: "website",
      siteName: "snailmail",
      title,
      description,
      url,
      images: letter.image
        ? [
            {
              url: `${url}/envelope.jpg?v=${letter.image}`,
              secureUrl: `${url}/envelope.jpg?v=${letter.image}`,
              type: "image/jpeg",
              width: 1200,
              height: 630,
              alt: `A sealed envelope addressed to ${letter.to}`,
            },
          ]
        : undefined,
      videos: letter.video
        ? [
            {
              url: `${url}/envelope.mp4?v=${letter.video}`,
              secureUrl: `${url}/envelope.mp4?v=${letter.video}`,
              type: "video/mp4",
              width: 1200,
              height: 630,
            },
          ]
        : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function LetterPage({ params }: PageProps<"/l/[token]">) {
  return (
    <Suspense fallback={<main className="desk" style={themeStyle(keepsake)} />}>
      {params.then(({ token }) => (
        <Letter token={token} />
      ))}
    </Suspense>
  );
}

async function Letter({ token }: { token: string }) {
  const letter = await getLetter(token);

  if (!letter) notFound();

  return <Experience delivery={toDelivery(letter)} />;
}
