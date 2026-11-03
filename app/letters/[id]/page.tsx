import { Suspense } from "react";
import { Composer } from "@/components/writer/composer";
import type { Id } from "@/convex/_generated/dataModel";

export default function ComposerPage({ params }: PageProps<"/letters/[id]">) {
  return (
    <Suspense fallback={<div className="writer w-loading" />}>
      {params.then(({ id }) => (
        // SAFETY: Convex validates the id and the writer's ownership before returning anything
        <Composer id={id as Id<"letters">} />
      ))}
    </Suspense>
  );
}
