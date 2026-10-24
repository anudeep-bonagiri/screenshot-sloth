// In-browser benchmark: same screenshots, prompt and scoring as the Node
// evaluation, but the model runs on WebGPU exactly as it does in the app.
import { startWorker } from "./app.js";
import { score } from "./score.js";
import { ALL_FIXTURES as FIXTURES } from "../eval/fixtures-holdout.mjs";

const $ = (id) => document.getElementById(id);
const log = (s) => { $("bLog").textContent += s + "\n"; $("bLog").scrollTop = 1e9; };
const runs = [];
window.__bench = { runs, done: false, running: false };
const qs = new URLSearchParams(location.search);
if (qs.get("soft")) $("bSoft").value = qs.get("soft");
if (qs.get("split")) $("bSplit").value = qs.get("split");

let worker = null, info = null;
const next = (type) => new Promise((resolve, reject) => {
  const h = (e) => {
    if (e.data.type === type) { worker.removeEventListener("message", h); resolve(e.data); }
    else if (e.data.type === "error") { worker.removeEventListener("message", h); reject(new Error(e.data.message)); }
  };
  worker.addEventListener("message", h);
});

async function run(soft, split) {
  Object.assign(window.__bench, { running: true, done: false, error: null });
  $("bRun").disabled = true;
  try {
    if (!worker) {
      worker = await startWorker();
      worker.addEventListener("message", (e) => { if (e.data.type === "progress") $("bStatus").textContent = `Downloading ${(e.data.loaded / 1e6).toFixed(0)} of ${(e.data.total / 1e6).toFixed(0)} MB`; });
      const ready = next("ready");
      worker.postMessage({ type: "load", softTokens: soft });
      info = await ready;
      log(`loaded ${info.repo} ${info.dtype} on ${info.device} in ${info.loadSeconds.toFixed(1)} s`);
    }
    worker.postMessage({ type: "detail", softTokens: soft });
    const res = { model: info.repo, dtype: info.dtype, runtime: "browser/webgpu", userAgent: navigator.userAgent, softTokens: soft, shots: [] };
    const list = FIXTURES.filter((f) => split === "all" || f.split === split);
    // One warm-up call so shader compilation is not counted against the first screenshot.
    const warm = await (await fetch(new URL(`../samples/${list[0].id}.png`, import.meta.url))).blob();
    const w = next("described"); worker.postMessage({ type: "describe", id: "warmup", blob: warm }); await w;
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      $("bStatus").textContent = `${soft} image tokens: screenshot ${i + 1} of ${list.length} (${f.id})`;
      const blob = await (await fetch(new URL(`../samples/${f.id}.png`, import.meta.url))).blob();
      const done = next("described");
      worker.postMessage({ type: "describe", id: f.id, blob, prompt: qs.get("prompt") || "v1" });
      const d = await done;
      res.shots.push({ id: f.id, split: f.split, title: d.title, category: d.category, private: d.private, seconds: d.seconds });
      log(`${f.id} ${d.seconds.toFixed(1)} s ${d.title} [${d.category}${d.private ? ", private" : ""}]`);
      $("bBar").style.width = (((i + 1) / list.length) * 100).toFixed(0) + "%";
    }
    runs.push(res);
    const s = score(res);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>Gemma 4 E2B ${info.dtype}, ${soft} tokens, ${split}</td><td>${s.named} of ${s.n}</td><td>${s.typed} of ${s.n}</td><td>${s.privateCaught} of ${s.privatePos}</td><td>${s.privateFalse}</td><td>${s.secondsEach.toFixed(1)}</td>`;
    $("bTable").querySelector("tbody").appendChild(tr);
    window.__bench.json = JSON.stringify(runs);
    $("bDownload").href = URL.createObjectURL(new Blob([window.__bench.json], { type: "application/json" }));
    $("bStatus").textContent = `Finished ${soft} tokens.`;
  } catch (e) {
    window.__bench.error = String(e.message || e);
    $("bStatus").textContent = "Failed: " + window.__bench.error;
    log("ERROR " + window.__bench.error);
  }
  $("bRun").disabled = false;
  Object.assign(window.__bench, { running: false, done: true });
}

$("bRun").addEventListener("click", () => run(Number($("bSoft").value), $("bSplit").value));
if (qs.get("autorun")) run(Number($("bSoft").value), $("bSplit").value);
