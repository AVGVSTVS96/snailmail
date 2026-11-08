import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

const effects = {
  importNames: ["useEffect", "useLayoutEffect", "useInsertionEffect"],
  message:
    "Derive in render, act in the event handler, or use useSubscription, useImperative or useBeforePaint from @/lib/outside.",
  name: "react",
};

export default defineConfig({
  extends: [core, react, next, antiSlop],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    ".agents/**",
    ".claude/**",
    "convex/_generated/**",
    "next-env.d.ts",
  ],
  jsPlugins: [{ name: "no-comments", specifier: "./tools/oxlint/no-comments.ts" }],
  options: { reportUnusedDisableDirectives: "error", typeAware: true },
  overrides: [
    {
      files: ["lib/delivery.ts", "components/mail/seal.tsx"],
      rules: { "eslint/no-bitwise": "off" },
    },
    {
      files: ["lib/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [effects],
            patterns: [
              {
                group: ["@/components/*", "@/app/*"],
                message:
                  "lib/ owns the domain; components and app import from it, never the reverse.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["lib/outside.ts"],
      rules: { "no-restricted-imports": "off", "react/exhaustive-deps": "off" },
    },
  ],
  rules: {
    "eslint/no-await-in-loop": "off",
    "eslint/sort-keys": "off",
    "import/no-cycle": "error",
    "no-comments/no-comments": "error",
    "no-restricted-imports": ["error", { paths: [effects] }],
    "oxc/no-accumulating-spread": "error",
  },
});
