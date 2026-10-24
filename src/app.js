// Screenshot Sloth page logic. Everything here runs in the browser tab.
// Files are read and renamed through the File System Access API; the images
// go to the model worker in this tab and nowhere else.
import { isScreenshotName, IMAGE_EXT, shotDate, newName, folderFor, CATEGORIES } from "./core.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export const SAMPLE_SHOTS = [
  ["t01-python-keyerror.png", "Screenshot 2026-10-09 at 10.12.33 PM.png"],
  ["t06-chat-wifi-password.png", "IMG_4920.PNG"],
  ["t09-map-directions.png", "Screenshot 2026-10-17 at 7.05.48 AM.png"],
  ["t17-budget-sheet.png", "Screenshot 2026-10-04 at 6.26.58 PM.png"],
  ["t21-pull-request.png", "Screenshot 2026-10-12 at 11.48.07 PM.png"],
  ["t22-card-details.png", "IMG_4977.PNG"],
];

// ---------------------------------------------------------------------------
// Worker. Started from a blob URL on purpose: a blob worker inherits this
// page's Content Security Policy, so the model code is bound by the same
// network rules as the page.
// ---------------------------------------------------------------------------
export async function startWorker() {
  const base = new URL("./", import.meta.url).href;
  const src = (await (await fetch(new URL("./worker.js", import.meta.url))).text()).replaceAll("__BASE__", base);
  const worker = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })), { type: "module" });
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("The model worker did not start.")), 60000);
    worker.addEventListener("message", function once(e) {
      if (e.data.type === "booted") { clearTimeout(t); worker.removeEventListener("message", once); resolve(); }
    });
    worker.addEventListener("error", (e) => { clearTimeout(t); reject(new Error(e.message || "Worker failed to start.")); });
  });
  return worker;
}

if ($("loadBtn")) main();

async function main() {
  const state = {
    worker: null, ready: false, loading: null,
    root: null, sample: false,
    entries: [], seen: new Set(), queue: [], working: false,
    lastBatch: [], watchTimer: null, totalSeconds: 0, described: 0,
  };
  const opt = () => ({
    onlyShots: $("optShots").checked,
    sortIntoFolders: $("optFolders").checked,
    privateFolder: $("optPrivate").checked,
    auto: $("optAuto").checked,
  });

  if ("serviceWorker" in navigator && (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname))) {
    navigator.serviceWorker.register(new URL("../sw.js", import.meta.url)).catch(() => {});
  }
  if (!("showDirectoryPicker" in window)) {
    $("pickBtn").disabled = true;
    $("pickNote").textContent = "This browser cannot open folders for writing. Chrome or Edge on a laptop or desktop can. You can still try the sample screenshots.";
  }

  try { const pm = localStorage.getItem("ss-privacyMode"); if (pm) $("privacyMode").value = pm; } catch {}
  $("privacyMode").addEventListener("change", () => { try { localStorage.setItem("ss-privacyMode", $("privacyMode").value); } catch {} });
  for (const id of ["optShots", "optFolders", "optPrivate", "optAuto"]) {
    try { const v = localStorage.getItem("ss-" + id); if (v !== null) $(id).checked = v === "1"; } catch {}
    $(id).addEventListener("change", () => {
      try { localStorage.setItem("ss-" + id, $(id).checked ? "1" : "0"); } catch {}
      state.entries.forEach(updateTarget);
      render();
    });
  }

  function setStatus(msg, cls) { const s = $("modelStatus"); s.textContent = msg; s.className = "status" + (cls ? " " + cls : ""); }

  // ------------------------------------------------------------------ model
  async function ensureModel() {
    if (state.ready) return;
    if (state.loading) return state.loading;
    state.loading = (async () => {
      $("loadBtn").disabled = true;
      $("loadProgress").hidden = false;
      setStatus("Starting the model worker...");
      if (!state.worker) {
        state.worker = await startWorker();
        state.worker.addEventListener("message", onWorker);
      }
      setStatus("Downloading Gemma 4 E2B. This happens once; after that it loads from this browser's storage.");
      const ready = new Promise((resolve, reject) => {
        const h = (e) => {
          if (e.data.type === "ready") { state.worker.removeEventListener("message", h); resolve(e.data); }
          if (e.data.type === "error" && e.data.during === "load") { state.worker.removeEventListener("message", h); reject(new Error(e.data.message)); }
        };
        state.worker.addEventListener("message", h);
      });
      state.worker.postMessage({ type: "load", softTokens: Number($("detail").value) });
      const info = await ready;
      state.ready = true;
      $("loadBar").style.width = "100%";
      $("loadBtn").textContent = "Model loaded";
      setStatus(`Gemma 4 E2B (${info.dtype}) is running on this computer's GPU. Loaded in ${info.loadSeconds.toFixed(1)} s.`, "ok");
      pump();
    })().catch((err) => {
      setStatus("Could not load the model: " + err.message, "bad");
      $("loadBtn").disabled = false;
      state.loading = null;
      throw err;
    });
    return state.loading;
  }
  $("loadBtn").addEventListener("click", () => ensureModel().catch(() => {}));
  $("detail").addEventListener("change", () => { if (state.worker) state.worker.postMessage({ type: "detail", softTokens: Number($("detail").value) }); });

  function onWorker(e) {
    const m = e.data;
    if (m.type === "progress") {
      $("loadBar").style.width = ((m.loaded / m.total) * 100).toFixed(1) + "%";
      setStatus(`Downloading Gemma 4 E2B: ${(m.loaded / 1e6).toFixed(0)} of ${(m.total / 1e6).toFixed(0)} MB. This happens once.`);
    } else if (m.type === "described") {
      const en = state.entries.find((x) => x.id === m.id);
      if (!en) return;
      en.result = { title: m.title, category: m.category, private: m.private };
      en.seconds = m.seconds;
      state.totalSeconds += m.seconds; state.described++;
      en.status = "ready";
      updateTarget(en);
      state.working = false;
      render();
      if (opt().auto && state.root) applyRenames([en]);
      pump();
    } else if (m.type === "error" && m.during === "describe") {
      const en = state.entries.find((x) => x.id === m.id);
      if (en) { en.status = "error"; en.error = m.message; }
      state.working = false;
      render();
      pump();
    }
  }

  function pump() {
    if (!state.ready || state.working) return;
    const en = state.entries.find((x) => x.status === "waiting");
    if (!en) { renderStats(); return; }
    state.working = true;
    en.status = "thinking";
    render();
    state.worker.postMessage({ type: "describe", id: en.id, blob: en.file, prompt: $("privacyMode").value });
  }

  // ------------------------------------------------------------------ files
  function addEntry({ file, handle, name }) {
    const id = state.entries.length;
    const en = { id, file, handle, oldName: name, date: shotDate(name, file.lastModified), ext: (name.match(/\.[^.]+$/) || [".png"])[0].toLowerCase(), url: URL.createObjectURL(file), status: "waiting", edited: false };
    state.entries.push(en);
    state.seen.add(name);
    return en;
  }

  function updateTarget(en) {
    if (!en.result || en.status === "done") return;
    en.folder = folderFor(en.result, opt());
    if (!en.edited) en.newName = newName({ title: en.result.title, date: en.date, ext: en.ext });
  }

  async function scanFolder() {
    const o = opt();
    const found = [];
    for await (const [name, handle] of state.root.entries()) {
      if (handle.kind !== "file" || state.seen.has(name)) continue;
      if (!IMAGE_EXT.test(name) || /\.heic$/i.test(name)) continue;
      if (o.onlyShots && !isScreenshotName(name)) continue;
      found.push([name, handle]);
    }
    found.sort((a, b) => a[0].localeCompare(b[0]));
    for (const [name, handle] of found) addEntry({ file: await handle.getFile(), handle, name });
    return found.length;
  }

  $("pickBtn").addEventListener("click", async () => {
    let dir;
    try { dir = await window.showDirectoryPicker({ id: "screenshots", mode: "readwrite", startIn: "desktop" }); }
    catch { return; } // cancelled
    openFolder(dir);
  });

  async function openFolder(dir) {
    resetList();
    state.root = dir; state.sample = false;
    const n = await scanFolder();
    $("folderName").textContent = dir.name;
    $("pickNote").textContent = n
      ? `Found ${n} screenshot${n === 1 ? "" : "s"} in "${dir.name}".`
      : `No files named like screenshots in "${dir.name}". Untick "Only files named like screenshots" to include every image.`;
    $("watchRow").hidden = false;
    render();
    ensureModel().catch(() => {});
    pump();
  }

  $("sampleBtn").addEventListener("click", async () => {
    resetList();
    state.root = null; state.sample = true;
    for (const [file, name] of SAMPLE_SHOTS) {
      const blob = await (await fetch(new URL(`../samples/${file}`, import.meta.url))).blob();
      addEntry({ file: new File([blob], name, { type: "image/png", lastModified: Date.now() }), handle: null, name });
    }
    $("pickNote").textContent = "Six made-up screenshots from the test set. Nothing is renamed in sample mode.";
    $("watchRow").hidden = true;
    render();
    ensureModel().catch(() => {});
    pump();
  });

  function resetList() {
    stopWatch();
    state.entries.forEach((e) => URL.revokeObjectURL(e.url));
    state.entries = []; state.seen = new Set(); state.lastBatch = []; state.totalSeconds = 0; state.described = 0;
    $("undoBtn").hidden = true;
  }

  // ------------------------------------------------------------------ rename
  async function moveFile(handle, fromDir, toDir, name) {
    if (typeof handle.move === "function") {
      try { await handle.move(toDir, name); return handle; } catch (e) { if (e.name === "NotAllowedError") throw e; }
    }
    // Fallback for browsers without FileSystemHandle.move(): copy, then delete.
    const file = await handle.getFile();
    const out = await toDir.getFileHandle(name, { create: true });
    const w = await out.createWritable();
    await w.write(file);
    await w.close();
    await fromDir.removeEntry(handle.name);
    return out;
  }

  async function namesIn(dir) {
    const s = new Set();
    for await (const [n] of dir.entries()) s.add(n.toLowerCase());
    return s;
  }

  async function applyRenames(list) {
    if (!state.root) return;
    const batch = [];
    const taken = new Map();
    for (const en of list) {
      if (en.status !== "ready") continue;
      try {
        const dir = en.folder ? await state.root.getDirectoryHandle(en.folder, { create: true }) : state.root;
        if (!taken.has(en.folder)) taken.set(en.folder, await namesIn(dir));
        const set = taken.get(en.folder);
        const base = en.newName.replace(/\.[^.]+$/, "");
        let name = en.newName, n = 2;
        while (set.has(name.toLowerCase())) name = `${base} (${n++})${en.ext}`;
        en.handle = await moveFile(en.handle, state.root, dir, name);
        set.add(name.toLowerCase());
        state.seen.add(name);
        en.finalPath = (en.folder ? en.folder + "/" : "") + name;
        en.status = "done";
        batch.push({ en, dir, name });
      } catch (err) {
        en.status = "error"; en.error = "Rename failed: " + err.message;
      }
    }
    if (batch.length) {
      state.lastBatch = batch;
      $("undoBtn").hidden = false;
      await writeLog(batch).catch(() => {});
    }
    render();
  }

  // A plain CSV in the folder, so every rename can be traced or undone by hand.
  async function writeLog(batch) {
    const fh = await state.root.getFileHandle("screenshot-sloth-log.csv", { create: true });
    const old = await (await fh.getFile()).text();
    const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const rows = batch.map(({ en }) => [new Date().toISOString(), en.oldName, en.finalPath, en.result.category, en.result.private ? "private" : ""].map(q).join(","));
    const w = await fh.createWritable();
    await w.write((old || "time,old name,new path,type,private\n") + rows.join("\n") + "\n");
    await w.close();
  }

  $("applyBtn").addEventListener("click", () => applyRenames(state.entries));
  $("undoBtn").addEventListener("click", async () => {
    for (const { en, dir } of state.lastBatch.reverse()) {
      try {
        en.handle = await moveFile(en.handle, dir, state.root, en.oldName);
        en.status = "ready"; en.finalPath = null;
      } catch (err) { en.error = "Undo failed: " + err.message; }
    }
    state.lastBatch = [];
    $("undoBtn").hidden = true;
    render();
  });

  // ------------------------------------------------------------------ watch
  function stopWatch() {
    if (state.watchTimer) clearInterval(state.watchTimer);
    state.watchTimer = null;
    $("optWatch").checked = false;
    $("watchNote").textContent = "";
  }
  $("optWatch").addEventListener("change", () => {
    if (!$("optWatch").checked) return stopWatch();
    const tick = async () => {
      try {
        const n = await scanFolder();
        const t = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        $("watchNote").textContent = n ? `Found ${n} new at ${t}.` : `Checked at ${t}. Nothing new.`;
        if (n) { render(); pump(); }
      } catch (err) { $("watchNote").textContent = "Stopped: " + err.message; stopWatch(); }
    };
    state.watchTimer = setInterval(tick, 15000);
    tick();
  });

  // ------------------------------------------------------------------ render
  function render() {
    const list = $("shots");
    $("results").hidden = state.entries.length === 0;
    const ready = state.entries.filter((e) => e.status === "ready").length;
    const done = state.entries.filter((e) => e.status === "done").length;
    $("shotCount").textContent = state.entries.length;
    $("applyBtn").hidden = !state.root;
    $("applyBtn").disabled = ready === 0;
    $("applyBtn").textContent = ready ? `Rename ${ready} file${ready === 1 ? "" : "s"}` : done ? "All renamed" : "Rename";
    list.innerHTML = state.entries.map((en) => {
      const r = en.result;
      const pills = [];
      if (r) {
        pills.push(`<span class="pill">${esc(r.category)}</span>`);
        if (r.private) pills.push(`<span class="pill lock">private</span>`);
        if (en.folder) pills.push(`<span class="pill">→ ${esc(en.folder)}/</span>`);
      }
      if (en.status === "done") pills.push(`<span class="pill done">renamed</span>`);
      const body = en.status === "waiting" ? `<div class="think">Waiting</div>`
        : en.status === "thinking" ? `<div class="think">Gemma is looking at it...</div>`
        : en.status === "error" ? `<div class="think" style="color:var(--bad)">${esc(en.error)}</div>`
        : en.status === "done" ? `<div class="new" style="font:14px/1.4 var(--mono);margin-top:4px">${esc(en.finalPath)}</div>`
        : `<input class="new" data-id="${en.id}" value="${esc(en.newName)}" spellcheck="false" aria-label="New name">`;
      return `<div class="shot ${en.status === "waiting" ? "waiting" : ""} ${r && r.private ? "private" : ""}">
        <img src="${en.url}" alt="">
        <div><div class="old">${esc(en.oldName)}</div>${body}<div class="meta">${pills.join("")}</div></div>
        <div class="side">${en.seconds ? `<span class="hint">${en.seconds.toFixed(1)} s</span>` : ""}</div>
      </div>`;
    }).join("");
    list.querySelectorAll("input.new").forEach((inp) => inp.addEventListener("change", () => {
      const en = state.entries[Number(inp.dataset.id)];
      en.newName = inp.value.trim() || en.newName; en.edited = true;
    }));
    renderStats();
  }

  function renderStats() {
    if (!state.described) { $("stats").textContent = ""; return; }
    const priv = state.entries.filter((e) => e.result && e.result.private).length;
    $("stats").textContent = `${state.described} described · ${(state.totalSeconds / state.described).toFixed(1)} s each on this GPU · ${priv} marked private · 0 bytes uploaded`;
  }

  // Handles for the automated tests in scripts/test-app.mjs.
  window.__sloth = { state, openFolder, applyRenames, updateTarget, render };

  // ------------------------------------------------------------------ privacy test
  $("leakBtn").addEventListener("click", async () => {
    const out = $("leakOut");
    out.textContent = "Testing...";
    let pageBlocked = false;
    const v = new Promise((res) => {
      const h = (e) => { if (String(e.blockedURI).includes("example.com")) { document.removeEventListener("securitypolicyviolation", h); res(true); } };
      document.addEventListener("securitypolicyviolation", h);
      setTimeout(() => res(false), 2000);
    });
    try { await fetch("https://example.com/?screenshot-sloth-privacy-test", { mode: "no-cors", cache: "no-store" }); } catch { pageBlocked = true; }
    pageBlocked = pageBlocked && (await v);
    if (!state.worker) { state.worker = await startWorker(); state.worker.addEventListener("message", onWorker); }
    const w = await new Promise((res) => {
      const h = (e) => { if (e.data.type === "leak") { state.worker.removeEventListener("message", h); res(e.data.blocked); } };
      state.worker.addEventListener("message", h);
      state.worker.postMessage({ type: "leaktest" });
    });
    out.innerHTML = pageBlocked && w
      ? `<span style="color:var(--ok)">Passed.</span> The browser blocked both requests (page and model worker).`
      : `<span style="color:var(--bad)">Did not pass.</span> Page blocked: ${pageBlocked}. Worker blocked: ${w}.`;
  });
}
