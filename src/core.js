// Screenshot Sloth core logic. No DOM and no model code here, so the same
// functions run in the page, in the model worker and in the Node evaluation.

export const CATEGORIES = {
  code: { folder: "Code", hint: "source code, a code editor, a diff or pull request, a config file" },
  error: { folder: "Errors", hint: "an error message, stack trace, failed build or warning dialog" },
  chat: { folder: "Chats", hint: "a text, DM or group chat conversation" },
  receipt: { folder: "Receipts", hint: "a receipt, order confirmation, invoice or bill" },
  travel: { folder: "Travel", hint: "a boarding pass, hotel or trip booking, map or directions" },
  schedule: { folder: "Schedules", hint: "a calendar, timetable, event flyer or invitation" },
  article: { folder: "Reading", hint: "an article, documentation page, wiki or blog post" },
  social: { folder: "Social", hint: "a social media post or profile" },
  account: { folder: "Accounts", hint: "a bank or payment app, sign-in, security or settings screen" },
  document: { folder: "Documents", hint: "a form, ID, syllabus, spreadsheet, slide or PDF page" },
  chart: { folder: "Charts", hint: "a chart, graph or dashboard" },
  other: { folder: "Other", hint: "anything else: a photo, meme or drawing" },
};
export const PRIVATE_FOLDER = "Private";

// ---------------------------------------------------------------------------
// Which files are screenshots, and when were they taken
// ---------------------------------------------------------------------------

const SHOT_PATTERNS = [
  /^Screen ?[Ss]hot[ _]\d{4}-\d{2}-\d{2}/, // macOS, Windows 11 Snipping Tool, GNOME
  /^Screenshot_\d{8}[-_]\d{6}/, // Android
  /^Screenshot \(\d+\)/, // Windows Win+PrtScn
  /^Screenshot from \d{4}-\d{2}-\d{2}/, // older GNOME
  /^CleanShot \d{4}-\d{2}-\d{2}/, // CleanShot X
  /^IMG_\d{3,5}\.(png|PNG)$/, // iPhone screenshots arrive as IMG_1234.PNG
  /^Image \d{4}-\d{2}-\d{2} at/, // macOS clipboard pastes
];
export const IMAGE_EXT = /\.(png|jpe?g|webp|heic)$/i;

export function isScreenshotName(name) {
  return IMAGE_EXT.test(name) && SHOT_PATTERNS.some((re) => re.test(name));
}

// Date for the new name: from the old name when it has one, else from the
// file's modified time. This is code, never the model.
export function shotDate(name, lastModified) {
  let m = name.match(/(\d{4})-(\d{2})-(\d{2})/) || name.match(/_(\d{4})(\d{2})(\d{2})[-_]/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  if (lastModified) {
    const d = new Date(lastModified);
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  return "";
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const TITLE_LINE = `TITLE: 3 to 8 words that say what this screenshot is about. Name the specific thing: the error, the item bought, the place, the people's plan, the topic, the app or project. Use words that appear on screen when they are the best name for it. No dates, no "screenshot of".`;
const TYPE_LINE = `TYPE: one word from this list:
${Object.entries(CATEGORIES).map(([k, v]) => `  ${k} = ${v.hint}`).join("\n")}`;

// v1 is the prompt that was frozen after the 10 dev screenshots and scored on
// the 22 test screenshots. v2 changes only the private check: instead of a
// yes/no, the model has to copy the secret it sees. v2 catches far more secrets
// and also flags many ordinary screenshots. The app uses v1 by default and v2
// for the "Catch more" privacy setting. Numbers are in the README.
export const PROMPTS = {
  v1: `You are renaming a screenshot file so its owner can find it later by searching.

Look at the screenshot and answer in exactly three lines, nothing else:
${TITLE_LINE}
${TYPE_LINE}
PRIVATE: yes or no. Say yes only if the image itself shows a secret or an identity document: a password, a one-time or verification code, recovery codes, an API key or token, a full card number with expiry, an account balance, or a driver license or ID. A page that only talks about passwords, or a list of Wi-Fi network names, is no.`,
  v2: `You are renaming a screenshot file so its owner can find it later by searching.

Look at the screenshot and answer in exactly three lines, nothing else:
${TITLE_LINE}
${TYPE_LINE}
SECRET: read every piece of text on screen. If any of it is an actual secret value, copy that value exactly. Secrets are: passwords (Wi-Fi passwords too), one-time or verification codes, recovery codes, API keys, tokens and other credentials (often long random strings, or the value after KEY=, TOKEN=, SECRET= or password:), full card numbers, account balances, and ID or license numbers. Dots, placeholders like YOUR_API_KEY, and the last four digits of a card are not secrets. If there is no secret, write: none`,
};
export const DEFAULT_PROMPT = "v1";
export const PROMPT = PROMPTS[DEFAULT_PROMPT];

export function messages(version = DEFAULT_PROMPT) {
  return [{ role: "user", content: [{ type: "image" }, { type: "text", text: PROMPTS[version] }] }];
}

// ---------------------------------------------------------------------------
// Parsing the model's answer
// ---------------------------------------------------------------------------

export function parseAnswer(raw) {
  const text = String(raw || "").replace(/\*\*/g, "");
  const grab = (key) => {
    const m = text.match(new RegExp(`^\\s*${key}\\s*[:\\-]\\s*(.+)$`, "im"));
    return m ? m[1].trim() : "";
  };
  let title = grab("TITLE").replace(/^["'`]|["'`.]$/g, "").trim();
  if (!title) title = (text.split("\n").find((l) => l.trim()) || "").trim();
  const typeWord = grab("TYPE").toLowerCase().match(/[a-z]+/);
  const category = typeWord && CATEGORIES[typeWord[0]] ? typeWord[0] : "other";
  // v1 answers PRIVATE: yes/no. v2 answers SECRET: <the value> or none.
  const secret = grab("SECRET").replace(/^["'`]+|["'`]+$/g, "");
  const copied = secret.length >= 4 && !/^(none|no|n\/a|null)\b/i.test(secret);
  const isPrivate = /^y/i.test(grab("PRIVATE")) || copied;
  return { title, category, private: isPrivate, secret: copied ? secret : "" };
}

// An experiment that did not hold up, kept so the README numbers can be
// reproduced (scripts/rescore-v2.mjs). Asked to copy a secret, the model often
// copies an ordinary line instead, so this checked whether the copy was shaped
// like a secret. It was written after looking at rounds one and two, scored
// perfectly on them, and did worse than no check at all on round three.

// Shape rule: a token that mixes letters and digits (passwords,
// keys, recovery codes), a run of six or more digits (one-time codes, card and
// ID numbers), or a dollar amount on an account screen (a balance). Placeholders
// and masked values are not secrets.
export function looksSecret(value, category) {
  const v = String(value || "").trim();
  if (!v || /^(none|no|n\/a|null)\b/i.test(v)) return false;
  const tokens = v.split(/[\s,;:=()"'`]+/).filter((t) => !/^(your|xxx|placeholder)|_here$|^[•*.]+$/i.test(t));
  const mixed = tokens.some((t) => t.length >= 6 && /[a-z]/i.test(t) && /\d/.test(t) && !/^\d+(gb|mb|kb|px|am|pm|st|nd|rd|th)$/i.test(t));
  const longDigits = /\d{6,}/.test(v.replace(/(\d) (?=\d)/g, "$1"));
  const balance = category === "account" && /\$\s?\d/.test(v);
  return mixed || longDigits || balance;
}

// ---------------------------------------------------------------------------
// Building the new file name
// ---------------------------------------------------------------------------

export function cleanTitle(title) {
  let t = String(title)
    .replace(/^(a |an |the )?(screenshot|screen shot|image|picture|photo) (of|showing) /i, "")
    .replace(/[\\/:*?"<>|#%{}^~[\]`]/g, " ") // characters that break on some file systems
    .replace(/[\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "");
  if (t.length > 72) t = t.slice(0, 72).replace(/\s+\S*$/, "");
  return t || "untitled";
}

export function newName({ title, date, ext, taken }) {
  const base = `${date ? date + " " : ""}${cleanTitle(title)}`;
  let name = `${base}${ext}`;
  let n = 2;
  while (taken && taken.has(name.toLowerCase())) name = `${base} (${n++})${ext}`;
  return name;
}

export function folderFor(result, { sortIntoFolders, privateFolder }) {
  if (privateFolder && result.private) return PRIVATE_FOLDER;
  if (sortIntoFolders) return CATEGORIES[result.category]?.folder || "Other";
  return "";
}
