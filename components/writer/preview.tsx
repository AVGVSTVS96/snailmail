"use client";

import { useState } from "react";

import { Experience } from "@/components/mail/experience";
import type { Stage } from "@/components/mail/experience";
import type { Delivery } from "@/lib/delivery";
import { useListener, useTimeout } from "@/lib/outside";

export interface PreviewMessage {
  kind: "snailmail-preview";
  delivery: Delivery;
  stage: Stage;
  end: boolean;
  run: number;
}

export const Preview = () => {
  const [message, setMessage] = useState<PreviewMessage | null>(null);

  useListener(
    (receive: (event: MessageEvent<PreviewMessage>) => void) => {
      addEventListener("message", receive);
      parent.postMessage({ kind: "snailmail-preview-ready" }, location.origin);

      return () => {
        removeEventListener("message", receive);
      };
    },
    (event) => {
      if (event.origin === location.origin && event.data?.kind === "snailmail-preview") {
        setMessage(event.data);
      }
    },
    [],
  );

  useTimeout(
    () => {
      document.querySelector(".keep")?.scrollIntoView({ block: "center" });
    },
    message?.end === true ? 120 : null,
    [message],
  );

  if (!message) {
    return null;
  }

  return (
    <Experience
      key={`${message.stage}-${message.run}`}
      delivery={message.delivery}
      start={message.stage}
    />
  );
};
