import { execFileSync } from "node:child_process";

const [token, ...flags] = process.argv.slice(2);

if (token === undefined || token === "") {
  throw new Error("Usage: bun scripts/preview.ts <token> [--prod] [--base http://localhost:3000]");
}

const prod = flags.includes("--prod");

const base = flags.includes("--base")
  ? flags[flags.indexOf("--base") + 1]
  : "http://localhost:3000";

const secret = execFileSync(
  "bunx",
  ["convex", "env", "get", ...(prod ? ["--prod"] : []), "SNAILMAIL_RENDER_SECRET"],
  { encoding: "utf-8" },
).trim();

const response = await fetch(new URL(`/api/render/${encodeURIComponent(token)}`, base), {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` },
});

if (!response.ok) {
  throw new Error(`Render failed with ${response.status}: ${await response.text()}`);
}

console.log(await response.json());
