"use client";

import { useEffect, useState } from "react";
import { watchFold } from "@/lib/fold";

function reading(event: string) {
  const { clientWidth, clientHeight } = document.documentElement;

  return {
    event,
    t: Math.round(performance.now()),
    client: `${clientWidth}x${clientHeight}`,
    inner: `${innerWidth}x${innerHeight}`,
    visual: visualViewport
      ? `${Math.round(visualViewport.width)}x${Math.round(visualViewport.height)}@${visualViewport.scale}`
      : null,
    screen: `${screen.width}x${screen.height}`,
    avail: `${screen.availWidth}x${screen.availHeight}`,
    dpr: devicePixelRatio,
    orientation: screen.orientation?.type ?? null,
    posture: navigator.devicePosture?.type ?? null,
    segments: window.viewport?.segments?.map((s) => `${s.width}x${s.height}`).join("|") ?? null,
    coarse: matchMedia("(pointer: coarse)").matches,
  };
}

export default function FoldCheck() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const id = Math.random().toString(36).slice(2, 8);
    const log = (event: string) => {
      const entry = reading(event);
      setLines((old) => [JSON.stringify(entry), ...old].slice(0, 40));
      navigator.sendBeacon("/api/fold", JSON.stringify({ id, ua: navigator.userAgent, ...entry }));
    };

    log("load");

    const onResize = () => log("resize");
    const onVisual = () => log("visual");
    addEventListener("resize", onResize);
    addEventListener("orientationchange", () => log("orientation"));
    visualViewport?.addEventListener("resize", onVisual);
    const stop = watchFold((fold) => log(`DETECTED ${fold}`));

    return () => {
      stop();
      removeEventListener("resize", onResize);
      visualViewport?.removeEventListener("resize", onVisual);
    };
  }, []);

  return (
    <main style={{ padding: 16, font: "12px ui-monospace, monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
      <h1 style={{ font: "600 18px system-ui" }}>Fold check</h1>
      <p style={{ font: "15px system-ui" }}>
        Fold and unfold the phone a few times, then rotate it. Readings are sent automatically.
      </p>
      {lines.map((line, n) => (
        <div key={lines.length - n} style={{ borderTop: "1px solid #ddd", padding: "4px 0" }}>
          {line}
        </div>
      ))}
    </main>
  );
}
