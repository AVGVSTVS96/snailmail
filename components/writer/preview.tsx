"use client";

import { useEffect, useState } from "react";

import { Experience } from "@/components/mail/experience";
import type { Delivery, Stage } from "@/components/mail/experience";

export interface PreviewMessage {
  kind: "snailmail-preview";
  delivery: Delivery;
  stage: Stage;
  end: boolean;
  run: number;
}

export const Preview = () => {
  const [message, setMessage] = useState<PreviewMessage | null>(null);

  useEffect(() => {
    const receive = (event: MessageEvent<PreviewMessage>) => {
      if (event.origin !== location.origin || event.data?.kind !== "snailmail-preview") {
        return;
      }

      setMessage(event.data);
    };

    addEventListener("message", receive);
    parent.postMessage({ kind: "snailmail-preview-ready" }, location.origin);

    return () => {
      removeEventListener("message", receive);
    };
  }, []);

  useEffect(() => {
    if (!message?.end) {
      return;
    }

    const timer = setTimeout(
      () => document.querySelector(".keep")?.scrollIntoView({ block: "center" }),
      120,
    );

    return () => {
      clearTimeout(timer);
    };
  }, [message]);

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
