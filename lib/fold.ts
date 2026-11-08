export type Fold = "unfold" | "fold";

export interface Viewport {
  short: number;
  sideways: boolean;
  screen: string;
  outgrows: boolean;
}

const jump = 1.3;
const settleMs = 250;
const burstMs = 1500;
const turnMs = 1200;

const measure = (): Viewport => {
  const { clientWidth, clientHeight } = document.documentElement;
  const screenSides = [screen.width, screen.height].toSorted((a, b) => a - b);

  return {
    short: Math.min(clientWidth, clientHeight),
    sideways: clientWidth > clientHeight,
    screen: screenSides.join("x"),
    outgrows: Math.max(clientWidth, clientHeight) > (screenSides[1] ?? 0) + 1,
  };
};

export const classify = (from: Viewport, to: Viewport): Fold | null => {
  const moved = from.screen !== to.screen || from.outgrows !== to.outgrows;

  if (!moved) {
    return null;
  }

  if (to.short >= from.short * jump) {
    return "unfold";
  }

  if (to.short * jump <= from.short) {
    return "fold";
  }

  return null;
};

export const looksFoldable = () => {
  const { clientWidth } = document.documentElement;

  return (
    navigator.userAgent.includes("iPhone") &&
    [screen.width, screen.height].every((side) => Math.abs(side - clientWidth) > 1)
  );
};

export const watchFold = (onFold: (fold: Fold) => void) => {
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

  const check = () => {
    const to = measure();
    const fold = classify(from, to);

    if (!fold) {
      return;
    }

    const unfoldStillSideways = fold === "unfold" && from.sideways && to.sideways;

    if (unfoldStillSideways) {
      turn ??= setTimeout(() => {
        turn = undefined;
        const now = measure();

        if (classify(from, now) === "unfold") {
          report(now, "unfold");
        }
      }, turnMs);

      return;
    }

    report(to, fold);
  };

  const resize = () => {
    clearTimeout(settle);
    clearTimeout(burst);
    settle = setTimeout(check, settleMs);
    burst = setTimeout(() => {
      from = measure();
    }, burstMs);
  };

  if (matchMedia("(pointer: coarse)").matches) {
    addEventListener("resize", resize);
  }

  return () => {
    removeEventListener("resize", resize);
    clearTimeout(settle);
    clearTimeout(burst);
    clearTimeout(turn);
  };
};
