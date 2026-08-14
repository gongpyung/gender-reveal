import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .trim().split("\n").filter(Boolean)
  .filter((file) => !file.endsWith("package-lock.json"))
  .filter((file) => file !== "next-env.d.ts")
  .filter((file) => !file.endsWith("2026-08-14-production-hardening-and-fidelity-remediation.md"))
  .filter((file) => !file.endsWith(".tsbuildinfo"));

const parts = [
  ["cl", "one"], ["ref", "erence"], ["in", "spiration"],
  ["baby", ".", "bunnyverse", ".", "app"], ["원", "본"], ["복", "제"], ["클", "론"],
];
const forbidden = parts.map((items) => items.join("").toLowerCase());
const findings = [];
for (const file of files) {
  let content;
  try { content = readFileSync(file, "utf8").toLowerCase(); } catch { continue; }
  for (const phrase of forbidden) if (content.includes(phrase)) findings.push(`${file}: ${phrase}`);
}
if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log("standalone language audit: no findings");
