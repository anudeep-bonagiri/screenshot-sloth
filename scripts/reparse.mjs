// Re-parses saved answers with the current parseAnswer() in place. No model is run.
import fs from "node:fs";
import { parseAnswer } from "../src/core.js";
for (const f of process.argv.slice(2)) {
  const r = JSON.parse(fs.readFileSync(f, "utf8"));
  r.shots = r.shots.map((s) => ({ ...s, ...parseAnswer(s.raw) }));
  fs.writeFileSync(f, JSON.stringify(r, null, 1));
}
