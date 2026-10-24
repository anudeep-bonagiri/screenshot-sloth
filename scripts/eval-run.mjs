// Runs Gemma 4 on the labeled screenshots with onnxruntime on the CPU and
// saves the raw answers. Usage:
//   node scripts/eval-run.mjs <dev|test|holdout|all> [softTokens=280] [prompt=v1|v2] [tag]
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { AutoProcessor, Gemma4ForConditionalGeneration, RawImage } from "@huggingface/transformers";
import { ALL_FIXTURES as FIXTURES } from "../eval/fixtures-holdout.mjs";
import { messages, parseAnswer, PROMPTS } from "../src/core.js";

const at = (p) => fileURLToPath(new URL("../" + p, import.meta.url));
const split = process.argv[2] || "dev";
const soft = Number(process.argv[3] || 280);
const version = process.argv[4] || "v1";
const tag = process.argv[5] || `e2b-${soft}-${version}-${split}`;
const id = "onnx-community/gemma-4-E2B-it-ONNX";

const processor = await AutoProcessor.from_pretrained(id);
processor.image_processor.max_soft_tokens = soft;
const model = await Gemma4ForConditionalGeneration.from_pretrained(id, {
  dtype: { embed_tokens: "q4", vision_encoder: "q4", decoder_model_merged: "q4", audio_encoder: "q4" }, device: "cpu",
});
const prompt = processor.apply_chat_template(messages(version), { add_generation_prompt: true });

const out = { model: id, dtype: "q4", runtime: "node/onnxruntime CPU (2 cores)", softTokens: soft, promptVersion: version, prompt: PROMPTS[version], shots: [] };
for (const f of FIXTURES.filter((x) => split === "all" || x.split === split)) {
  const image = await RawImage.read(at(`samples/${f.id}.png`));
  const t0 = Date.now();
  const inputs = await processor(prompt, image, null, { add_special_tokens: false });
  const gen = await model.generate({ ...inputs, max_new_tokens: 48, do_sample: false });
  const raw = processor.batch_decode(gen.slice(null, [inputs.input_ids.dims.at(-1), null]), { skip_special_tokens: true })[0];
  const seconds = (Date.now() - t0) / 1000;
  out.shots.push({ id: f.id, split: f.split, raw, ...parseAnswer(raw), seconds, inputTokens: inputs.input_ids.dims.at(-1) });
  console.log(f.id, seconds.toFixed(1) + "s", JSON.stringify(raw));
  fs.writeFileSync(at(`eval/results/${tag}.json`), JSON.stringify(out, null, 1));
}
