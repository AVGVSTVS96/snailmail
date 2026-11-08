import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import { LetterView, letterMetadata, letterViewport } from "@/components/letter/page";
import { getLetterAt } from "@/lib/letters";
import { letterLink } from "@/lib/links";
import { deskProps } from "@/lib/texture";
import { keepsake } from "@/lib/theme";

type Props = PageProps<"/s/[slug]/[[...key]]">;

const find = async (params: Props["params"]) => {
  const { slug, key } = await params;

  return { slug, key: key?.[0] ?? "", letter: await getLetterAt(slug, key?.[0] ?? "") };
};

export const instant = false;

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug, key, letter } = await find(params);

  return letterMetadata(letter, letterLink({ token: letter?.token ?? "", slug, key }));
};

export const generateViewport = async ({ params }: Props): Promise<Viewport> => {
  const { letter } = await find(params);

  return letterViewport(letter);
};

const SlugPage = ({ params }: Props) => (
  <Suspense fallback={<main className="desk" {...deskProps(keepsake)} />}>
    {find(params).then(({ letter }) => (
      <LetterView letter={letter} />
    ))}
  </Suspense>
);

export default SlugPage;
