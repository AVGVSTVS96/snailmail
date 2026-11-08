import { Suspense } from "react";

import { Composer } from "@/components/writer/composer";

const ComposerPage = ({ params }: PageProps<"/letters/[id]">) => (
  <Suspense fallback={<div className="writer w-loading" />}>
    {params.then(({ id }) => (
      <Composer id={id} />
    ))}
  </Suspense>
);

export default ComposerPage;
