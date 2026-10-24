"""Baseline with no language model: Tesseract OCR plus keyword rules.

Writes eval/results/ocr-baseline.json in the same shape as the model runs,
so scripts/score.mjs can score it.  Usage: python3 scripts/baseline_ocr.py
"""
import json, re, subprocess, time, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ids = re.findall(r'id: "([^"]+)", split: "(\w+)"', (ROOT / "eval/fixtures.mjs").read_text() + (ROOT / "eval/fixtures-holdout.mjs").read_text())

PRIVATE = re.compile(r"password|passcode|verification code|one-time|recovery code|api[_ ]?key|secret|token|\bsk-|\b(?:\d{4}[ -]){3}\d{4}\b|cvv|balance|driver licen[cs]e|\bdob\b", re.I)
RULES = {
    "error": r"error|exception|traceback|failed|not ejected|warning",
    "code": r"\bdef\b|\bimport\b|select\b.*\bfrom|=>|function|const |\.py\b|\.js\b|pull request|commit|merge",
    "chat": r"\byou:|typing|imessage|text message|\blol\b|\bbet\b",
    "receipt": r"receipt|order|invoice|subtotal|total|tax|qty",
    "travel": r"boarding|flight|gate|seat|hotel|check-in|check-out|route|\bmi\b|directions",
    "schedule": r"calendar|\bmon\b|\btue\b|\bwed\b|week of|rsvp|saturday|\bam\b.*\bpm\b",
    "article": r"wikipedia|docs\.|documentation|article|read more",
    "social": r"followers|retweet|repost|comments|likes|@\w+ ·|\d+h\b",
    "account": r"account|balance|sign[- ]in|settings|password|wi-fi|verification",
    "document": r"syllabus|form|license|spreadsheet|grading|\bid\b",
    "chart": r"dashboard|chart|users|retention|\d+%",
}

def title_from(text):
    for line in text.splitlines():
        words = re.findall(r"[A-Za-z][A-Za-z'\-]+", line)
        if len(words) >= 3:
            return " ".join(line.split()[:8])
    return "untitled"

out = {"model": "Tesseract 5 OCR + keyword rules (no model)", "softTokens": None, "shots": []}
for fid, split in ids:
    t0 = time.time()
    text = subprocess.run(["tesseract", str(ROOT / f"samples/{fid}.png"), "-", "--psm", "3"], capture_output=True, text=True).stdout
    scores = {k: len(re.findall(v, text, re.I)) for k, v in RULES.items()}
    cat = max(scores, key=scores.get) if max(scores.values()) > 0 else "other"
    out["shots"].append({"id": fid, "split": split, "title": title_from(text), "category": cat,
                         "private": bool(PRIVATE.search(text)), "seconds": time.time() - t0, "ocr": text})
(ROOT / "eval/results/ocr-baseline.json").write_text(json.dumps(out, indent=1))
print("done", len(out["shots"]))
