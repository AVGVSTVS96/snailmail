import { expect, test } from "bun:test";

import { newToken } from "@/convex/letters";
import { slugify } from "@/convex/writer";
import { letterLink } from "@/lib/links";

test("a letter token is 22 URL-safe characters", () => {
  for (let i = 0; i < 50; i += 1) {
    expect(newToken()).toMatch(/^[\w-]{22}$/u);
  }
});

test("a name becomes a lowercase subdomain", () => {
  expect(slugify("Grandma Rosé")).toBe("grandma-rose");
  expect(slugify("  --June!!  ")).toBe("june");
  expect(slugify(`${"a".repeat(39)} b`)).toBe("a".repeat(39));
});

test("a letter with a name opens on its subdomain, with its key", () => {
  const hosts = { root: "example.com", site: "https://snailmail.example" };

  expect(letterLink({ token: "t", slug: "june", key: "ab12" }, hosts)).toBe(
    "https://june.example.com/ab12",
  );
  expect(letterLink({ token: "t", slug: null, key: null }, hosts)).toBe(
    "https://snailmail.example/l/t",
  );
  expect(
    letterLink({ token: "t", slug: "june", key: null }, { ...hosts, root: "localhost:3000" }),
  ).toBe("http://june.localhost:3000/");
});
