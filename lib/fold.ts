export type Fold = "unfold" | "fold";

type Viewport = { short: number; sideways: boolean; screen: string; outgrows: boolean };

const jump = 1.3;
const settleMs = 250;
const burstMs = 1500;
const turnMs = 1200;

function measure(): Viewport {
  const { clientWidth, clientHeight } = document.documentElement;
  const screenSides = [screen.width, screen.height].toSorted((a, b) => a - b);

  return {
    short: Math.min(clientWidth, clientHeight),
    sideways: clientWidth > clientHeight,
    screen: screenSides.join("x"),
    outgrows: Math.max(clientWidth, clientHeight) > screenSides[1] + 1,
  };
}

// The page changed screens when the screen's size changes (Chrome on Android), or when the page outgrows or fits back
// into a screen size the browser never updates (Safari on the iPhone Duo reports the cover's size on both screens).
// Only sizes count, never fold or hinge APIs. Rotations keep the short side and keyboards keep the screen.
function classify(from: Viewport, to: Viewport): Fold | null {
  const moved = from.screen !== to.screen || from.outgrows !== to.outgrows;

  if (!moved) return null;

  if (to.short >= from.short * jump) return "unfold";

  if (to.short * jump <= from.short) return "fold";

  return null;
}

// Safari on an iPhone Duo reports the cover's screen on both screens, so the page fits neither of its sides. On other
// iPhones the page spans one side of the screen it reports.
export function looksFoldable() {
  const { clientWidth } = document.documentElement;

  return (
    /iPhone/.test(navigator.userAgent) &&
    [screen.width, screen.height].every((side) => Math.abs(side - clientWidth) > 1)
  );
}

export function watchFold(onFold: (fold: Fold) => void) {
  if (!matchMedia("(pointer: coarse)").matches) return () => {};

  let from = measure();
  let settle: ReturnType<typeof setTimeout> | undefined;
  let burst: ReturnType<typeof setTimeout> | undefined;
  let turn: ReturnType<typeof setTimeout> | undefined;

  const report = (to: Viewport, fold: Fold) => {
    clearTimeout(turn);
    turn = undefined;
    from = to;
    onFold(fold);
  };

  // Unfolded on its side, the iPhone Duo first shows the open screen still sideways and turns it upright about a second
  // later, so an unfold that keeps the page sideways counts once the page has turned, or once it clearly won't.
  const check = () => {
    const to = measure();
    const fold = classify(from, to);

    if (!fold) return;

    if (fold === "unfold" && from.sideways && to.sideways) {
      turn ??= setTimeout(() => {
        turn = undefined;
        const now = measure();

        if (classify(from, now) === "unfold") report(now, "unfold");
      }, turnMs);

      return;
    }

    report(to, fold);
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
    clearTimeout(turn);
  };
}
