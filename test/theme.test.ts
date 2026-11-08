import { expect, test } from "bun:test";

import { contrast, inkFits, resolveTheme, themeKeys } from "@/lib/theme";

test("black on white is the full 21:1 contrast", () => {
  expect(contrast("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  expect(contrast("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
});

test("pale ink is too faint on cotton paper but fits black paper", () => {
  expect(inkFits("pale", "cotton")).toBe(false);
  expect(inkFits("pale", "black")).toBe(true);
});

test("a theme swaps an ink too faint for its paper for the first one that fits", () => {
  const theme = resolveTheme("keepsake", { ink: "pale", paper: "cotton" });

  expect(theme.style.ink).toBe("ironGall");
});

test("themes keep their order", () => {
  expect(themeKeys).toEqual(["keepsake", "parAvion", "pressed", "midnight"]);
});
