// Scores saved answers against the labels in eval/fixtures.mjs.
// Usage: node scripts/score.mjs eval/results/<file>.json [dev|test]
import fs from "node:fs";
import { score } from "../src/score.js";

const r = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const s = score(r, process.argv[3]);
console.log(`${r.model} ${r.runtime || ""} softTokens=${r.softTokens}  n=${s.n}`);
console.log(`useful names ${s.named}/${s.n} | right folder (Private wins over type) ${s.typed}/${s.n} | private caught ${s.privateCaught}/${s.privatePos}, false alarms ${s.privateFalse} | ${s.secondsEach.toFixed(1)} s each`);
s.misses.forEach((m) => console.log("  - " + m));
