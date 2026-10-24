// Re-parses saved v2 answers and applies the looksSecret() shape check to the
// SECRET line, then writes a new results file. No model is run.
// Usage: node scripts/rescore-v2.mjs <in.json> <out.json>
import fs from "node:fs";
import { parseAnswer, looksSecret } from "../src/core.js";
const r = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
r.shots = r.shots.map((s) => { const p = parseAnswer(s.raw); return { ...s, ...p, private: looksSecret(p.secret, p.category) }; });
r.parser = "v2 prompt + looksSecret() check";
fs.writeFileSync(process.argv[3], JSON.stringify(r, null, 1));
