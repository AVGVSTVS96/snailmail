import { expect, test } from "bun:test";

import { initialOf, seedFrom, toDelivery } from "@/lib/delivery";
import type { LetterFields } from "@/lib/delivery";

const letter: LetterFields = {
  token: "AbCdEfGhIjKlMnOpQrStUv",
  theme: "keepsake",
  style: null,
  to: "June",
  toPlace: "Brooklyn, New York",
  from: "Avery",
  initial: null,
  city: "San Francisco",
  openWhen: "",
  sealedAt: Date.UTC(2026, 10, 3, 6),
  timeZone: "America/Los_Angeles",
};

test("a token always grows the same seal", () => {
  expect(seedFrom(letter.token)).toBe(seedFrom(letter.token));
  expect(seedFrom(letter.token)).not.toBe(seedFrom("another-token-entirely"));
});

test("the initial falls back from the chosen one to the writer's name to S", () => {
  expect(initialOf({ initial: "q", from: "Avery" })).toBe("Q");
  expect(initialOf({ initial: "", from: " avery" })).toBe("A");
  expect(initialOf({ initial: null, from: "" })).toBe("S");
});

test("the postmark uses the day in the writer's time zone", () => {
  const delivery = toDelivery(letter);

  expect(delivery.address.postmark).toEqual({ city: "SAN FRANCISCO", date: "NOV 2", year: "2026" });
  expect(delivery.sealedLine).toBe("SEALED 2 NOV 2026 · SAN FRANCISCO");
  expect(delivery.address.openWhen).toBeNull();
});

test("without a city the lines leave it out", () => {
  const delivery = toDelivery({ ...letter, city: "" });

  expect(delivery.sealedLine).toBe("SEALED 2 NOV 2026");
  expect(delivery.signedFrom).toBe("from Avery");
});
