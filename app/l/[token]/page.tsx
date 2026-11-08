import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import { LetterView, letterMetadata, letterViewport } from "@/components/letter/page";
import { getLetter } from "@/lib/letters";
import { absolute } from "@/lib/site";
import { deskProps } from "@/lib/texture";
import { keepsake } from "@/lib/theme";

export const instant = false;

export const generateMetadata = async ({ params }: PageProps<"/l/[token]">): Promise<Metadata> => {
  const { token } = await params;

  return letterMetadata(await getLetter(token), absolute(`/l/${token}`));
};

export const generateViewport = async ({ params }: PageProps<"/l/[token]">): Promise<Viewport> => {
  const { token } = await params;

  return letterViewport(await getLetter(token));
};

const LetterPage = ({ params }: PageProps<"/l/[token]">) => (
  <Suspense fallback={<main className="desk" {...deskProps(keepsake)} />}>
    {params.then(async ({ token }) => (
      <LetterView letter={await getLetter(token)} />
    ))}
  </Suspense>
);

export default LetterPage;
