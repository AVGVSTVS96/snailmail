export type Fold = "unfold" | "fold";

declare global {
  interface Navigator {
    devicePosture?: { type: "continuous" | "folded" };
  }

  interface Window {
    viewport?: { segments: DOMRect[] | null };
  }
}

type Viewport = { short: number; screen: string; outgrows: boolean; folded: boolean };

const jump = 1.3;
const settleMs = 250;
const burstMs = 1500;

function measure(): Viewport {
  const { clientWidth, clientHeight } = document.documentElement;
  const screenSides = [screen.width, screen.height].toSorted((a, b) => a - b);

  return {
    short: Math.min(clientWidth, clientHeight),
    screen: screenSides.join("x"),
    outgrows: Math.max(clientWidth, clientHeight) > screenSides[1] + 1,
    folded: navigator.devicePosture?.type === "folded" || (window.viewport?.segments?.length ?? 1) > 1,
  };
}

// The page changed screens when the screen's size changes (Chrome on Android), when the page outgrows or fits back into
// a screen size the browser never updates (Safari on the iPhone Duo), or when Device Posture or Viewport Segments
// report a fold. Rotations keep the short side, and keyboards and toolbars keep the screen.
function classify(from: Viewport, to: Viewport): Fold | null {
  const moved = from.screen !== to.screen || from.outgrows !== to.outgrows || from.folded || to.folded;

  if (!moved) return null;

  if (to.short >= from.short * jump) return "unfold";

  if (to.short * jump <= from.short) return "fold";

  return null;
}

export function watchFold(onFold: (fold: Fold) => void) {
  if (!matchMedia("(pointer: coarse)").matches) return () => {};

  let from = measure();
  let settle: ReturnType<typeof setTimeout> | undefined;
  let burst: ReturnType<typeof setTimeout> | undefined;

  const check = () => {
    const to = measure();
    const fold = classify(from, to);

    if (!fold) return;
    from = to;
    onFold(fold);
  };

  const resize = () => {
    clearTimeout(settle);
    clearTimeout(burst);
    settle = setTimeout(check, settleMs);
    burst = setTimeout(() => (from = measure()), burstMs);
  };

  addEventListener("resize", resize);

  return () => {
    removeEventListener("resize", resize);
    clearTimeout(settle);
    clearTimeout(burst);
  };
}
