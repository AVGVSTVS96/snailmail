import { execFile } from "node:child_process";
import { promisify } from "node:util";

const [token, ...flags] = process.argv.slice(2);

if (!token) throw new Error("Usage: bun scripts/preview.ts <token> [--prod] [--base http://localhost:3000]");

const prod = flags.includes("--prod");
const base = flags.includes("--base") ? flags[flags.indexOf("--base") + 1] : "http://localhost:3000";

const { stdout } = await promisify(execFile)("bunx", [
  "convex",
  "env",
  "get",
  ...(prod ? ["--prod"] : []),
  "SNAILMAIL_RENDER_SECRET",
]);

const response = await fetch(new URL(`/api/render/${encodeURIComponent(token)}`, base), {
  method: "POST",
  headers: { Authorization: `Bearer ${stdout.trim()}` },
});

if (!response.ok) throw new Error(`Render failed with ${response.status}: ${await response.text()}`);

console.log(await response.json());
