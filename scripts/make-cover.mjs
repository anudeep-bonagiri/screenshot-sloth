// Draws docs/images/cover.png from real answers in the v1 test run.
import fs from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { ALL_FIXTURES } from "../eval/fixtures-holdout.mjs";
import { newName, folderFor, shotDate } from "../src/core.js";
const { chromium } = createRequire(import.meta.url)("playwright");
const at = (p) => fileURLToPath(new URL("../" + p, import.meta.url));
const run = JSON.parse(fs.readFileSync(at("eval/results/e2b-280-v1-test.json"), "utf8"));
const pick = ["t01-python-keyerror", "t09-map-directions", "t07-grocery-receipt", "t21-pull-request", "t11-hack-day-event", "t22-card-details"];
const rows = pick.map((id) => {
  const f = ALL_FIXTURES.find((x) => x.id === id), s = run.shots.find((x) => x.id === id);
  const date = shotDate(f.original, Date.parse("2026-10-18T12:00:00"));
  return { old: f.original, folder: folderFor(s, { sortIntoFolders: true, privateFolder: true }), name: newName({ title: s.title, date, ext: ".png" }) };
});
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;width:1000px;height:420px;background:#15140f;color:#f2efe4;font:16px system-ui,sans-serif;display:flex;align-items:center;gap:26px;padding:0 34px;box-sizing:border-box">
<div style="flex:1"><div style="color:#aaa591;font-size:13px;letter-spacing:1px;margin-bottom:10px">BEFORE</div>${rows.map((r) => `<div style="font:13.5px Menlo,monospace;padding:7px 10px;margin:6px 0;background:#26251d;border-radius:6px;color:#c9c4b0">${esc(r.old)}</div>`).join("")}</div>
<div style="font-size:40px;color:#b5d96a">→</div>
<div style="flex:1.35"><div style="color:#aaa591;font-size:13px;letter-spacing:1px;margin-bottom:10px">AFTER, NAMED AND SORTED BY GEMMA 4 E2B</div>${rows.map((r) => `<div style="font:13.5px Menlo,monospace;padding:7px 10px;margin:6px 0;background:#26251d;border-radius:6px"><span style="color:${r.folder === "Private" ? "#e8a54b" : "#b5d96a"}">${esc(r.folder)}/</span>${esc(r.name)}</div>`).join("")}</div></body>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 420 }, deviceScaleFactor: 2 });
await p.setContent(html); await p.screenshot({ path: at("docs/images/cover.png") }); await b.close();
console.log(rows);
