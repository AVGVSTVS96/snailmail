"use client";

import { useRef, useState } from "react";
import { z } from "zod/mini";

import type { Stage } from "@/components/mail/experience";
import type { Delivery } from "@/lib/delivery";
import { useImperative, useResize, useWindowEvent } from "@/lib/outside";

import type { PreviewMessage } from "./preview";

const PreviewReady = z.object({ kind: z.literal("snailmail-preview-ready") });

const sandbox = "allow-scripts allow-same-origin allow-popups allow-modals";

const sizes = { phone: [390, 844], desktop: [1280, 800] } as const;

interface Props {
  delivery: Delivery;
  stage: Stage;
  end: boolean;
  run: number;
  device: "phone" | "desktop" | "fill";
}

export const PreviewFrame = ({ delivery, stage, end, run, device }: Props) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [width, setWidth] = useState(332);

  useWindowEvent("message", (event: MessageEvent<unknown>) => {
    if (event.origin === location.origin && PreviewReady.safeParse(event.data).success) {
      setReady(true);
    }
  });

  useResize(box, (entry) => {
    setWidth(entry.contentRect.width);
  });

  useImperative(() => {
    if (!ready) {
      return;
    }

    const message: PreviewMessage = { kind: "snailmail-preview", delivery, stage, end, run };
    frame.current?.contentWindow?.postMessage(message, location.origin);
  }, [ready, delivery, stage, end, run]);

  if (device === "fill") {
    return (
      <iframe
        ref={frame}
        src="/preview"
        title="Letter preview"
        className="w-frame-fill"
        sandbox={sandbox}
      />
    );
  }

  const [w, h] = sizes[device];
  const scale = width / w;

  return (
    <div ref={box} className={`w-frame w-frame-${device}`} style={{ height: h * scale }}>
      <iframe
        ref={frame}
        src="/preview"
        title="Letter preview"
        sandbox={sandbox}
        width={w}
        height={h}
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
};
