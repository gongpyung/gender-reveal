import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .trim().split("\n").filter(Boolean)
  .filter((file) => !file.endsWith("package-lock.json"))
  .filter((file) => file !== "next-env.d.ts")
  .filter((file) => !file.endsWith(".tsbuildinfo"));

const parts = [
  ["cl", "one"],
  ["baby", ".", "bunnyverse", ".", "app"], ["원", "본"], ["복", "제"], ["클", "론"],
];
const forbidden = parts.map((items) => items.join("").toLowerCase());
const findings = [];
for (const file of files) {
  let raw;
  try { raw = readFileSync(file); } catch { continue; }
  if (raw.includes(0)) continue;
  const lines = raw.toString("utf8").split("\n");
  const content = lines
    .filter((line) => !(file.endsWith("2026-08-14-production-hardening-and-fidelity-remediation.md") && line.trim().startsWith("git grep -n -I -i -E")))
    .join("\n")
    .toLowerCase();
  for (const phrase of forbidden) if (content.includes(phrase)) findings.push(`${file}: ${phrase}`);
}
if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log("standalone language audit: no findings");
