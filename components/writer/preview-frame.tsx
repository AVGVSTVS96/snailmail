"use client";

import { useEffect, useRef, useState } from "react";

import type { Stage } from "@/components/mail/experience";
import type { Delivery } from "@/lib/delivery";

import type { PreviewMessage } from "./preview";

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

  useEffect(() => {
    const hello = (event: MessageEvent<{ kind?: string }>) => {
      if (event.origin === location.origin && event.data?.kind === "snailmail-preview-ready") {
        setReady(true);
      }
    };

    addEventListener("message", hello);

    return () => {
      removeEventListener("message", hello);
    };
  }, []);

  useEffect(() => {
    const element = box.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const message: PreviewMessage = { kind: "snailmail-preview", delivery, stage, end, run };
    frame.current?.contentWindow?.postMessage(message, location.origin);
  }, [ready, delivery, stage, end, run]);

  if (device === "fill") {
    return <iframe ref={frame} src="/preview" title="Letter preview" className="w-frame-fill" />;
  }

  const [w, h] = sizes[device];
  const scale = width / w;

  return (
    <div ref={box} className={`w-frame w-frame-${device}`} style={{ height: h * scale }}>
      <iframe
        ref={frame}
        src="/preview"
        title="Letter preview"
        width={w}
        height={h}
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
};
