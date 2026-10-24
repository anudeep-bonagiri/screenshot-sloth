// Tests the rename, sort, collision and undo logic of the page in headless
// Chromium. There is no GPU here, so the model's answers are filled in by hand;
// the folder is the browser's private file system (OPFS), which uses the same
// File System Access API as a real folder.
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
const { chromium } = createRequire(import.meta.url)("playwright");

const server = spawn("python3", ["-m", "http.server", "8766"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:8766/index.html");
await page.waitForFunction(() => window.__sloth);

const result = await page.evaluate(async () => {
  const root = await navigator.storage.getDirectory();
  for await (const [n] of root.entries()) await root.removeEntry(n, { recursive: true });
  const png = await (await fetch("samples/t01-python-keyerror.png")).blob();
  const put = async (name) => { const h = await root.getFileHandle(name, { create: true }); const w = await h.createWritable(); await w.write(png); await w.close(); };
  for (const n of ["Screenshot 2026-10-09 at 10.12.33 PM.png", "Screenshot 2026-10-09 at 10.13.01 PM.png", "IMG_4977.PNG", "Screenshot_20261020-081500.png", "vacation.jpg", "notes.txt"]) await put(n);
  // A file that already has the name the first screenshot will get.
  await root.getDirectoryHandle("Errors", { create: true }).then(async (d) => { const h = await d.getFileHandle("2026-10-09 KeyError in Python traceback.png", { create: true }); const w = await h.createWritable(); await w.write("x"); await w.close(); });

  const S = window.__sloth;
  await S.openFolder(root);
  const found = S.state.entries.map((e) => e.oldName);
  const answers = [
    { title: "KeyError in Python traceback", category: "error", private: false },
    { title: "KeyError in Python traceback", category: "error", private: false },
    { title: "Pinewood debit card: details", category: "account", private: true },
    { title: 'Hill Country "loop" map / route?', category: "travel", private: false },
  ];
  S.state.ready = false; // keep the (GPU-less) model out of it
  S.state.entries.forEach((e, i) => { e.result = answers[i]; e.status = "ready"; S.updateTarget(e); });
  const planned = S.state.entries.map((e) => (e.folder ? e.folder + "/" : "") + e.newName);
  await S.applyRenames(S.state.entries);
  const tree = async (dir, pre = "") => { const out = []; for await (const [n, h] of dir.entries()) { if (h.kind === "directory") out.push(...(await tree(h, pre + n + "/"))); else out.push(pre + n); } return out.sort(); };
  const after = await tree(root);
  const log = await (await (await root.getFileHandle("screenshot-sloth-log.csv")).getFile()).text();
  document.getElementById("undoBtn").click();
  await new Promise((r) => setTimeout(r, 500));
  const undone = await tree(root);
  return { found, planned, after, log, undone, statuses: S.state.entries.map((e) => e.status + (e.error ? ":" + e.error : "")) };
});
console.log(JSON.stringify(result, null, 1));
console.log("page errors:", errors);
await browser.close();
server.kill();
