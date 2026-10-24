// Model worker. Loads Google's open-weight Gemma 4 E2B with Transformers.js and
// runs it on the GPU through WebGPU. The page starts this file from a blob URL
// so that it inherits the page's Content Security Policy.
import { AutoProcessor, Gemma4ForConditionalGeneration, RawImage, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1";
import { messages, parseAnswer, PROMPTS } from "__BASE__core.js";

env.allowLocalModels = false;
const MODEL_ID = "onnx-community/gemma-4-E2B-it-ONNX";

let processor = null;
let model = null;
let prompts = null;
let info = null;

async function hasGpu() {
  try {
    if (!self.navigator.gpu) return null;
    const adapter = await self.navigator.gpu.requestAdapter();
    if (!adapter) return null;
    return { f16: adapter.features.has("shader-f16") };
  } catch {
    return null;
  }
}

async function load(softTokens) {
  const gpu = await hasGpu();
  // The 4-bit weights need an operator (GatherBlockQuantized) that the
  // WebAssembly backend does not have, so there is no CPU fallback in the browser.
  if (!gpu) throw new Error("This needs WebGPU, and this browser did not offer a GPU. Use Chrome or Edge on a laptop or desktop.");
  const q = gpu.f16 ? "q4f16" : "q4";
  const files = new Map();
  const t0 = performance.now();
  processor = await AutoProcessor.from_pretrained(MODEL_ID);
  model = await Gemma4ForConditionalGeneration.from_pretrained(MODEL_ID, {
    device: "webgpu",
    dtype: { embed_tokens: q, vision_encoder: q, decoder_model_merged: q, audio_encoder: q },
    progress_callback: (p) => {
      if (p.status === "progress" && p.total) {
        files.set(p.file, [p.loaded, p.total]);
        let l = 0, t = 0;
        for (const [a, b] of files.values()) { l += a; t += b; }
        self.postMessage({ type: "progress", loaded: l, total: t });
      }
    },
  });
  setDetail(softTokens);
  prompts = Object.fromEntries(Object.keys(PROMPTS).map((v) => [v, processor.apply_chat_template(messages(v), { add_generation_prompt: true })]));
  info = { repo: MODEL_ID, device: "webgpu", dtype: q, loadSeconds: (performance.now() - t0) / 1000 };
  self.postMessage({ type: "ready", ...info });
}

// How many image tokens the vision encoder may use. 280 is the model's default.
function setDetail(softTokens) {
  if (processor) processor.image_processor.max_soft_tokens = softTokens || 280;
}

async function describe(id, blob, version) {
  const t0 = performance.now();
  const image = await RawImage.fromBlob(blob);
  const inputs = await processor(prompts[version] || prompts.v1, image, null, { add_special_tokens: false });
  const out = await model.generate({ ...inputs, max_new_tokens: 48, do_sample: false });
  const raw = processor.batch_decode(out.slice(null, [inputs.input_ids.dims.at(-1), null]), { skip_special_tokens: true })[0];
  const { title, category, private: isPrivate } = parseAnswer(raw); // the copied secret itself is dropped here
  self.postMessage({ type: "described", id, title, category, private: isPrivate, seconds: (performance.now() - t0) / 1000 });
}

// Used by the privacy test button: try to reach a server that the page's
// Content Security Policy does not allow. It only passes if the browser reports
// a policy violation, so being offline cannot fake a pass.
async function leakTest() {
  const violation = new Promise((resolve) => {
    self.addEventListener("securitypolicyviolation", (e) => { if (String(e.blockedURI).includes("example.com")) resolve(true); });
    setTimeout(() => resolve(false), 2000);
  });
  let threw = false;
  try { await fetch("https://example.com/?screenshot-sloth-privacy-test", { mode: "no-cors", cache: "no-store" }); } catch { threw = true; }
  return { blocked: threw && (await violation) };
}

self.onmessage = async (e) => {
  const msg = e.data;
  try {
    if (msg.type === "load") await load(msg.softTokens);
    else if (msg.type === "detail") setDetail(msg.softTokens);
    else if (msg.type === "describe") await describe(msg.id, msg.blob, msg.prompt);
    else if (msg.type === "leaktest") self.postMessage({ type: "leak", ...(await leakTest()) });
  } catch (err) {
    self.postMessage({ type: "error", during: msg.type, id: msg.id, message: String((err && err.message) || err) });
  }
};
self.postMessage({ type: "booted" });
