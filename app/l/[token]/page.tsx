import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { LetterView, letterMetadata, letterViewport } from "@/components/letter/page";
import { getLetter } from "@/lib/letters";
import { absolute } from "@/lib/site";
import { keepsake } from "@/lib/theme";
import { deskProps } from "@/lib/texture";

export const instant = false;

export async function generateMetadata({ params }: PageProps<"/l/[token]">): Promise<Metadata> {
  const { token } = await params;

  return letterMetadata(await getLetter(token), absolute(`/l/${token}`));
}

export async function generateViewport({ params }: PageProps<"/l/[token]">): Promise<Viewport> {
  const { token } = await params;

  return letterViewport(await getLetter(token));
}

export default function LetterPage({ params }: PageProps<"/l/[token]">) {
  return (
    <Suspense fallback={<main className="desk" {...deskProps(keepsake)} />}>
      {params.then(async ({ token }) => (
        <LetterView letter={await getLetter(token)} />
      ))}
    </Suspense>
  );
}
