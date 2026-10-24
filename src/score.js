// Scoring shared by the browser benchmark and the Node script.
import { ALL_FIXTURES as FIXTURES } from "../eval/fixtures-holdout.mjs";
import { cleanTitle, folderFor } from "./core.js";
const OPTS = { sortIntoFolders: true, privateFolder: true };

export function nameHits(title, keys) {
  const t = " " + cleanTitle(title).toLowerCase().replace(/[^a-z0-9]+/g, " ") + " ";
  return keys.every((group) => group.some((k) => {
    const w = k.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    return w.length <= 3 ? t.includes(" " + w + " ") || t.includes(" " + w + "s ") : t.includes(w);
  }));
}

export function score(result, split) {
  const gold = Object.fromEntries(FIXTURES.map((f) => [f.id, f]));
  const shots = result.shots.filter((s) => !split || gold[s.id].split === split);
  let named = 0, typed = 0, tp = 0, fp = 0, fn = 0, secs = 0;
  const misses = [];
  for (const s of shots) {
    const g = gold[s.id];
    const n = nameHits(s.title, g.keys), c = folderFor(s, OPTS) === folderFor(g, OPTS);
    named += n; typed += c; secs += s.seconds || 0;
    if (s.private && g.private) tp++; else if (s.private) fp++; else if (g.private) fn++;
    if (!n || !c || s.private !== g.private) misses.push(`${s.id}: "${s.title}" [${s.category}${s.private ? ", private" : ""}]  want ${g.category}${g.private ? ", private" : ""} + ${JSON.stringify(g.keys)}`);
  }
  const pos = shots.filter((s) => gold[s.id].private).length;
  return { n: shots.length, named, typed, privateCaught: tp, privatePos: pos, privateFalse: fp, secondsEach: secs / shots.length, misses };
}

