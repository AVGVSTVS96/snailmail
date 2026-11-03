import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { LetterView, letterMetadata, letterViewport } from "@/components/letter/page";
import { letterLink } from "@/lib/links";
import { getLetterAt } from "@/lib/letters";
import { keepsake } from "@/lib/theme";
import { deskProps } from "@/lib/texture";

type Props = PageProps<"/s/[slug]/[[...key]]">;

async function find(params: Props["params"]) {
  const { slug, key } = await params;

  return { slug, key: key?.[0] ?? "", letter: await getLetterAt(slug, key?.[0] ?? "") };
}

export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, key, letter } = await find(params);

  return letterMetadata(letter, letterLink({ token: letter?.token ?? "", slug, key }));
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
  return letterViewport((await find(params)).letter);
}

export default function SlugPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="desk" {...deskProps(keepsake)} />}>
      {find(params).then(({ letter }) => (
        <LetterView letter={letter} />
      ))}
    </Suspense>
  );
}
