// Renders the made-up screenshots in eval/fixtures.mjs to PNG files in samples/,
// at the pixel density a Mac (2x) or an iPhone (3x) would save them.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { ALL_FIXTURES as FIXTURES } from "../eval/fixtures-holdout.mjs";
const { chromium } = createRequire(import.meta.url)("playwright");
const at = (p) => fileURLToPath(new URL("../" + p, import.meta.url));
const browser = await chromium.launch();
for (const f of FIXTURES) {
  const isPhone = f.viewport.width < 500;
  const page = await browser.newPage({ viewport: f.viewport, deviceScaleFactor: isPhone ? 3 : 2 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;font:15px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:#1f2328;background:#fff}</style></head>${f.html}</html>`);
  await page.screenshot({ path: at(`samples/${f.id}.png`) });
  await page.close();
}
await browser.close();
console.log("wrote", FIXTURES.length, "screenshots");
