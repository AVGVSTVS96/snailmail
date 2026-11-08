import { describe, expect, test } from "bun:test";

import { classify } from "@/lib/fold";
import type { Viewport } from "@/lib/fold";

const cover: Viewport = { short: 390, sideways: false, screen: "390x844", outgrows: false };

describe("classify", () => {
  test("an unfold on Chrome for Android changes the screen's size", () => {
    expect(classify(cover, { ...cover, short: 700, screen: "700x844" })).toBe("unfold");
  });

  test("Safari on the iPhone Duo keeps reporting the cover's screen, so outgrowing it is the unfold", () => {
    expect(classify(cover, { ...cover, short: 700, outgrows: true })).toBe("unfold");
  });

  test("fitting back into the reported screen is the fold", () => {
    expect(classify({ ...cover, short: 700, outgrows: true }, cover)).toBe("fold");
  });

  test("a rotation keeps the short side, so it isn't a fold", () => {
    expect(classify(cover, { ...cover, sideways: true, screen: "844x390" })).toBeNull();
  });

  test("a keyboard shrinks the page but keeps the screen", () => {
    expect(classify(cover, { ...cover, short: 300 })).toBeNull();
  });

  test("a small size change on a new screen is neither", () => {
    expect(classify(cover, { ...cover, short: 420, screen: "420x844" })).toBeNull();
  });
});
