// The labeled test set. Every screenshot here is made up: the HTML below is
// rendered to PNG by scripts/make-shots.mjs. Names, numbers, codes and cards
// are fictional. 10 "dev" shots were used while writing the prompt; the 22
// "test" shots were scored once, after the prompt was frozen.
//
// Labels:
//   category  one of CATEGORIES in src/core.js
//   private   true if the image shows something you would not want sitting in
//             a synced Desktop folder: a password, a one-time code, recovery
//             codes, an API key, a full card number, a bank balance with an
//             account, or an ID document.
//   keys      what a useful filename has to mention. Each inner list is one
//             idea; the name passes if it contains any word from every list.
//   original  the file name the OS gave it.

const base = `*{box-sizing:border-box}body{margin:0;font:15px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:#1f2328;background:#fff}`;
const mono = `font-family:Menlo,Consolas,"DejaVu Sans Mono",monospace`;
const phone = { width: 390, height: 844 };
const desk = { width: 1280, height: 800 };

const statusBar = (t = "9:41") => `<div style="display:flex;justify-content:space-between;padding:14px 26px 6px;font-weight:600;font-size:15px"><span>${t}</span><span>▮▮▮ ◔ ▭</span></div>`;

const editor = (file, lines, lang = "") => `<div style="display:flex;height:100vh;background:#1e1e1e;color:#d4d4d4;${mono};font-size:14px">
<div style="width:220px;background:#252526;padding:10px;color:#ccc;font-size:13px"><div style="opacity:.6;margin-bottom:8px">EXPLORER</div>${["src", "tests", "README.md", "package.json", ".env", ".gitignore"].map((f) => `<div style="padding:3px 6px;${f === file || file.endsWith(f) ? "background:#37373d" : ""}">${f}</div>`).join("")}</div>
<div style="flex:1"><div style="background:#2d2d2d;padding:8px 14px;color:#fff;font-size:13px">${file} ${lang}</div><pre style="margin:0;padding:12px 16px;line-height:1.55">${lines.map((l, i) => `<span style="color:#858585;display:inline-block;width:32px">${i + 1}</span>${l}`).join("\n")}</pre></div></div>`;

const bubble = (who, text, me = false) => `<div style="display:flex;justify-content:${me ? "flex-end" : "flex-start"};margin:6px 12px"><div style="max-width:75%;padding:9px 13px;border-radius:18px;background:${me ? "#0a84ff" : "#e9e9eb"};color:${me ? "#fff" : "#000"}">${who && !me ? `<div style="font-size:12px;color:#666;margin-bottom:2px">${who}</div>` : ""}${text}</div></div>`;

const browser = (url, body) => `<div style="background:#dee1e6;padding:8px 10px;display:flex;gap:8px;align-items:center"><span style="color:#ff5f57">●</span><span style="color:#febc2e">●</span><span style="color:#28c840">●</span><div style="flex:1;background:#fff;border-radius:16px;padding:5px 14px;font-size:13px;color:#444">${url}</div></div>${body}`;

export const FIXTURES = [
  // ------------------------------------------------------------------ dev
  {
    id: "d01-npm-build-error", split: "dev", category: "error", private: false, original: "Screenshot 2026-10-03 at 9.41.12 PM.png",
    keys: [["typeerror", "error", "fail"], ["npm", "build"]], viewport: desk,
    html: `<body style="background:#1e1e1e;color:#ddd;${mono};font-size:14px;padding:22px"><div style="color:#8f8">anudeep@mbp ratecon-radar % npm run build</div><pre>
> ratecon-radar@0.1.0 build
> vite build

vite v5.4.2 building for production...
✓ 41 modules transformed.
<span style="color:#f66">TypeError: Cannot read properties of undefined (reading 'map')</span>
    at parseFacts (src/core.js:212:31)
    at analyze (src/worker.js:77:20)
<span style="color:#f66">npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! ratecon-radar@0.1.0 build: \`vite build\`
npm ERR! Exit status 1</span></pre></body>`,
  },
  {
    id: "d02-group-chat-pizza", split: "dev", category: "chat", private: false, original: "IMG_4821.PNG",
    keys: [["pizza"]], viewport: phone,
    html: `<body>${statusBar()}<div style="text-align:center;padding:6px;border-bottom:1px solid #ddd"><b>Rowdy Launch officers</b><div style="font-size:12px;color:#888">5 people</div></div>
${bubble("Maya", "how many pizzas for friday hack night?")}${bubble("Chris", "last time 12 wasn't enough lol")}${bubble("", "let's do 16, 4 cheese 4 pepperoni 8 whatever is on special", true)}${bubble("Maya", "i'll order from the place on 1604, pickup 6:15")}${bubble("Chris", "someone grab plates + napkins")}${bubble("", "on it 👍", true)}</body>`,
  },
  {
    id: "d03-order-headphones", split: "dev", category: "receipt", private: false, original: "Screenshot 2026-10-05 at 1.02.44 PM.png",
    keys: [["order", "receipt", "purchase", "confirmation"], ["headphone"]], viewport: desk,
    html: `<body>${browser("shop.fieldsparrow.com/orders/FS-209331", `<div style="max-width:720px;margin:30px auto"><h1 style="font-size:26px">Thanks, your order is confirmed</h1><p>Order <b>FS-209331</b> · placed October 5, 2026</p>
<div style="display:flex;gap:18px;border:1px solid #ddd;border-radius:10px;padding:16px;margin:18px 0"><div style="width:90px;height:90px;background:#333;border-radius:8px"></div><div><b>Fieldsparrow Arc wireless headphones, charcoal</b><div style="color:#666">Qty 1</div><div>$79.99</div></div></div>
<table style="width:100%;font-size:15px"><tr><td>Subtotal</td><td style="text-align:right">$79.99</td></tr><tr><td>Shipping</td><td style="text-align:right">Free</td></tr><tr><td>Tax</td><td style="text-align:right">$6.60</td></tr><tr><td><b>Total</b></td><td style="text-align:right"><b>$86.59</b></td></tr></table><p style="color:#666">Arrives Thu, Oct 9. We'll email you when it ships.</p></div>`)}</body>`,
  },
  {
    id: "d04-sms-verification-code", split: "dev", category: "account", private: true, original: "IMG_4830.PNG",
    keys: [["code", "verification", "2fa", "otp", "one-time", "sign-in", "login"]], viewport: phone,
    html: `<body>${statusBar("7:12")}<div style="text-align:center;padding:6px;border-bottom:1px solid #ddd"><b>72975</b><div style="font-size:12px;color:#888">Text Message · Today 7:12 AM</div></div>
${bubble("", "Pinewood Credit Union: Your verification code is 482913. It expires in 10 minutes. Never share this code. We will never call to ask for it.")}${bubble("", "Pinewood Credit Union: Sign-in attempt from a new device (Chrome on Mac). If this wasn't you, reply STOP.")}</body>`,
  },
  {
    id: "d05-week-calendar", split: "dev", category: "schedule", private: false, original: "Screenshot 2026-10-06 at 8.15.03 AM.png",
    keys: [["calendar", "schedule", "week", "class"]], viewport: desk,
    html: `<body><div style="padding:14px 20px;font-size:20px;font-weight:600;border-bottom:1px solid #ddd">October 2026 <span style="font-weight:400;color:#666;font-size:15px">Week of Oct 5</span></div>
<div style="display:grid;grid-template-columns:60px repeat(5,1fr);font-size:13px">${["", "Mon 5", "Tue 6", "Wed 7", "Thu 8", "Fri 9"].map((d) => `<div style="padding:8px;border-bottom:1px solid #ddd;font-weight:600">${d}</div>`).join("")}
${["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"].map((h, i) => `<div style="padding:8px;color:#888;height:72px;border-bottom:1px solid #f0f0f0">${h}</div>` + [0, 1, 2, 3, 4].map((d) => { const ev = { "1-0": "Operating Systems (online)", "1-2": "Operating Systems (online)", "6-0": "Computer Architecture · SP1 230", "6-2": "Computer Architecture · SP1 230", "0-1": "SWBC", "0-3": "SWBC", "4-4": "Startup Garage" }[`${i}-${d}`]; return `<div style="border-bottom:1px solid #f0f0f0;border-left:1px solid #f0f0f0;padding:4px">${ev ? `<div style="background:#d2e3fc;border-left:3px solid #1a73e8;padding:4px;border-radius:4px">${ev}</div>` : ""}</div>`; }).join("")).join("")}</div></body>`,
  },
  {
    id: "d06-article-sloth", split: "dev", category: "article", private: false, original: "Screenshot 2026-10-20 at 11.30.51 AM.png",
    keys: [["sloth"]], viewport: desk,
    html: `<body>${browser("en.wikipedia.org/wiki/Three-toed_sloth", `<div style="max-width:880px;margin:20px auto;font-family:Georgia,serif"><h1 style="font-weight:400;border-bottom:1px solid #aaa">Three-toed sloth</h1><p style="font-size:16px;line-height:1.6">The <b>three-toed sloths</b> are arboreal neotropical mammals. They are the only members of the genus <i>Bradypus</i> and the family Bradypodidae. The four living species are the brown-throated sloth, the maned sloth, the pale-throated sloth, and the pygmy three-toed sloth.</p><p style="font-size:16px;line-height:1.6">Sloths move slowly to conserve energy. Their diet of leaves provides little energy, and digestion can take weeks. They come down from the trees about once a week to defecate.</p><h2 style="font-weight:400;border-bottom:1px solid #aaa">Description</h2><p style="font-size:16px;line-height:1.6">Three-toed sloths are about the size of a small dog, with a head and body length of around 45 cm and a weight of 3.5 to 4.5 kg.</p></div>`)}</body>`,
  },
  {
    id: "d07-boarding-pass", split: "dev", category: "travel", private: false, original: "IMG_4877.PNG",
    keys: [["boarding", "flight"], ["sat", "sfo", "san antonio", "san francisco"]], viewport: phone,
    html: `<body style="background:#0b2545;color:#fff">${statusBar("5:48")}<div style="margin:16px;background:#fff;color:#111;border-radius:16px;padding:20px"><div style="font-weight:700;color:#0b2545">MERIDIAN AIR · Boarding pass</div>
<div style="display:flex;justify-content:space-between;align-items:end;margin:18px 0"><div><div style="font-size:40px;font-weight:700">SAT</div><div>San Antonio</div></div><div style="font-size:24px">✈</div><div style="text-align:right"><div style="font-size:40px;font-weight:700">SFO</div><div>San Francisco</div></div></div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:13px"><div>Flight<br><b>MA 1186</b></div><div>Date<br><b>Oct 23</b></div><div>Boards<br><b>6:25 AM</b></div><div>Gate<br><b>B7</b></div><div>Seat<br><b>21C</b></div><div>Group<br><b>4</b></div></div>
<div style="margin-top:18px">Passenger<br><b>BONAGIRI/ANUDEEP</b></div><div style="margin:20px auto 0;width:200px;height:200px;background:repeating-linear-gradient(90deg,#000 0 6px,#fff 6px 10px),#000"></div></div></body>`,
  },
  {
    id: "d08-editor-haversine", split: "dev", category: "code", private: false, original: "Screenshot 2026-10-08 at 4.47.20 PM.png",
    keys: [["haversine", "distance"]], viewport: desk,
    html: `<body>${editor("src/geo.py", [
      `<span style="color:#c586c0">import</span> math`, ``,
      `<span style="color:#569cd6">def</span> <span style="color:#dcdcaa">haversine_miles</span>(lat1, lon1, lat2, lon2):`,
      `    <span style="color:#6a9955">"""Great-circle distance between two points, in miles."""</span>`,
      `    r = <span style="color:#b5cea8">3958.8</span>`,
      `    p1, p2 = math.radians(lat1), math.radians(lat2)`,
      `    dp = math.radians(lat2 - lat1)`,
      `    dl = math.radians(lon2 - lon1)`,
      `    a = math.sin(dp / <span style="color:#b5cea8">2</span>) ** <span style="color:#b5cea8">2</span> + math.cos(p1) * math.cos(p2) * math.sin(dl / <span style="color:#b5cea8">2</span>) ** <span style="color:#b5cea8">2</span>`,
      `    <span style="color:#c586c0">return</span> <span style="color:#b5cea8">2</span> * r * math.asin(math.sqrt(a))`, ``,
      `<span style="color:#569cd6">def</span> <span style="color:#dcdcaa">route_length</span>(points):`,
      `    <span style="color:#c586c0">return</span> sum(haversine_miles(*a, *b) <span style="color:#c586c0">for</span> a, b <span style="color:#c586c0">in</span> zip(points, points[<span style="color:#b5cea8">1</span>:]))`,
    ], "— Python")}</body>`,
  },
  {
    id: "d09-bank-balance", split: "dev", category: "account", private: true, original: "IMG_4902.PNG",
    keys: [["bank", "balance", "checking", "account"]], viewport: phone,
    html: `<body style="background:#f4f6f8">${statusBar("12:03")}<div style="padding:10px 20px"><div style="font-size:22px;font-weight:700">Good afternoon</div><div style="color:#666">Pinewood Credit Union</div></div>
<div style="margin:12px 16px;background:#123c69;color:#fff;border-radius:14px;padding:18px"><div style="font-size:13px;opacity:.8">Everyday Checking ••••7731</div><div style="font-size:34px;font-weight:700;margin:6px 0">$2,341.18</div><div style="font-size:13px;opacity:.8">Available balance</div></div>
<div style="margin:12px 16px;background:#fff;border-radius:14px;padding:18px"><div style="font-size:13px;color:#666">Savings ••••0458</div><div style="font-size:26px;font-weight:700">$5,120.00</div></div>
<div style="margin:12px 16px;background:#fff;border-radius:14px;padding:6px 18px">${[["H-E-B #612", "-$48.21"], ["Payroll SWBC", "+$812.40"], ["Shell 1604", "-$31.07"]].map(([a, b]) => `<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee"><span>${a}</span><b>${b}</b></div>`).join("")}</div></body>`,
  },
  {
    id: "d10-social-hacktoberfest", split: "dev", category: "social", private: false, original: "Screenshot 2026-10-12 at 7.58.09 PM.png",
    keys: [["hacktoberfest"]], viewport: desk,
    html: `<body style="background:#f3f2ef"><div style="max-width:560px;margin:30px auto;background:#fff;border-radius:10px;padding:18px;border:1px solid #ddd"><div style="display:flex;gap:10px;align-items:center"><div style="width:48px;height:48px;border-radius:50%;background:#7a5af8"></div><div><b>Priya Raman</b><div style="font-size:13px;color:#666">@priyabuilds · 2h</div></div></div>
<p style="font-size:17px;line-height:1.5">Week 2 of Hacktoberfest done 🎃 This year it's not about PR counts, you build something new with open-source AI. Mine runs a 2B model entirely in the browser. Writeup on DEV tonight.</p><div style="display:flex;gap:30px;color:#666;font-size:14px"><span>💬 14</span><span>🔁 31</span><span>♥ 212</span></div></div></body>`,
  },

  // ------------------------------------------------------------------ test
  {
    id: "t01-python-keyerror", split: "test", category: "error", private: false, original: "Screenshot 2026-10-09 at 10.12.33 PM.png",
    keys: [["keyerror", "traceback", "error"], ["pandas", "python", "dataframe", "fare"]], viewport: desk,
    html: `<body style="background:#fff;${mono};font-size:14px;padding:22px"><div style="color:#555">In [14]: df.groupby("pickup_zone")["fare_amt"].mean()</div><pre style="color:#b00">---------------------------------------------------------------------------
KeyError                                  Traceback (most recent call last)
File ~/miniconda3/lib/python3.12/site-packages/pandas/core/indexes/base.py:3805, in Index.get_loc(self, key)
   3804 try:
-> 3805     return self._engine.get_loc(casted_key)
   3806 except KeyError as err:

KeyError: 'fare_amt'

The above exception was the direct cause of the following exception:

KeyError                                  Traceback (most recent call last)
Cell In[14], line 1
----> 1 df.groupby("pickup_zone")["fare_amt"].mean()</pre></body>`,
  },
  {
    id: "t02-disk-not-ejected", split: "test", category: "error", private: false, original: "Screenshot 2026-10-11 at 3.03.10 PM.png",
    keys: [["disk", "eject", "drive"]], viewport: desk,
    html: `<body style="background:linear-gradient(135deg,#3a6073,#16222a);height:100vh"><div style="position:absolute;right:20px;top:20px;width:360px;background:rgba(245,245,245,.96);border-radius:14px;padding:14px;display:flex;gap:12px;box-shadow:0 8px 30px rgba(0,0,0,.4)"><div style="width:36px;height:36px;background:#ccc;border-radius:8px"></div><div><b>Disk Not Ejected Properly</b><div style="font-size:13px;color:#333;margin-top:3px">Eject "SANDISK 64GB" before disconnecting or turning it off.</div></div></div></body>`,
  },
  {
    id: "t03-env-api-key", split: "test", category: "code", private: true, original: "Screenshot 2026-10-13 at 12.40.02 AM.png",
    keys: [["env", "api key", "key", "environment", "config", "secret"]], viewport: desk,
    html: `<body>${editor(".env", [
      `<span style="color:#6a9955"># local dev only, do not commit</span>`,
      `<span style="color:#9cdcfe">DATABASE_URL</span>=postgres://cruze:Tr4ffic!2026@localhost:5432/cruze_dev`,
      `<span style="color:#9cdcfe">MAPBOX_TOKEN</span>=pk.eyJ1IjoiY3J1emUtZGV2IiwiYSI6ImNseDk0In0.k3Jd9Qp`,
      `<span style="color:#9cdcfe">OPENROUTER_API_KEY</span>=sk-or-v1-8c41f0e2d9b7a6c5e4f3a2b1c0d9e8f7a6b5c4d3`,
      `<span style="color:#9cdcfe">SENTRY_DSN</span>=https://3f2a1b@o44821.ingest.sentry.io/66190`,
      `<span style="color:#9cdcfe">NODE_ENV</span>=development`,
    ], "— Properties")}</body>`,
  },
  {
    id: "t04-sql-query", split: "test", category: "code", private: false, original: "Screenshot 2026-10-14 at 2.20.45 PM.png",
    keys: [["sql", "query", "join", "select"], ["student", "enroll", "course"]], viewport: desk,
    html: `<body>${editor("lab6.sql", [
      `<span style="color:#569cd6">SELECT</span> s.student_id, s.last_name, <span style="color:#dcdcaa">COUNT</span>(e.course_id) <span style="color:#569cd6">AS</span> courses`,
      `<span style="color:#569cd6">FROM</span> students s`,
      `<span style="color:#569cd6">LEFT JOIN</span> enrollments e <span style="color:#569cd6">ON</span> e.student_id = s.student_id`,
      `  <span style="color:#569cd6">AND</span> e.term = <span style="color:#ce9178">'FA26'</span>`,
      `<span style="color:#569cd6">GROUP BY</span> s.student_id, s.last_name`,
      `<span style="color:#569cd6">HAVING</span> <span style="color:#dcdcaa">COUNT</span>(e.course_id) &gt;= <span style="color:#b5cea8">5</span>`,
      `<span style="color:#569cd6">ORDER BY</span> courses <span style="color:#569cd6">DESC</span>;`,
    ], "— SQL")}</body>`,
  },
  {
    id: "t05-chat-dinner-plans", split: "test", category: "chat", private: false, original: "IMG_4915.PNG",
    keys: [["dinner", "food", "eat", "pearl", "restaurant"]], viewport: phone,
    html: `<body>${statusBar("5:31")}<div style="text-align:center;padding:6px;border-bottom:1px solid #ddd"><b>Shrithik</b></div>
${bubble("", "dinner tonight? i'm done at 6")}${bubble("", "yes. pearl? that taco place by the brewery", true)}${bubble("", "7:00 works, i'll put our name down")}${bubble("", "bet. parking there is awful so i'll take the bus", true)}</body>`,
  },
  {
    id: "t06-chat-wifi-password", split: "test", category: "chat", private: true, original: "IMG_4920.PNG",
    keys: [["wifi", "wi-fi", "password", "network"]], viewport: phone,
    html: `<body>${statusBar("10:02")}<div style="text-align:center;padding:6px;border-bottom:1px solid #ddd"><b>Apartment 3B</b><div style="font-size:12px;color:#888">3 people</div></div>
${bubble("", "what's the new wifi after the router reset?", true)}${bubble("Jordan", "network: Casa3B_5G")}${bubble("Jordan", "password: tortilla-Moon-8841")}${bubble("Sam", "life saver")}</body>`,
  },
  {
    id: "t07-grocery-receipt", split: "test", category: "receipt", private: false, original: "IMG_4931.PNG",
    keys: [["receipt", "grocer", "market"]], viewport: phone,
    html: `<body style="background:#d8d3c8">${statusBar("6:44")}<div style="margin:14px 34px;background:#fdfdf8;padding:18px;${mono};font-size:13px;line-height:1.5;box-shadow:0 2px 8px rgba(0,0,0,.2)"><div style="text-align:center"><b>HILL COUNTRY MARKET #14</b><br>1100 MAIN ST, BOERNE TX<br>10/16/26 6:41 PM</div><br>
${[["BANANAS 2.3 LB", "1.36"], ["EGGS LG 18CT", "4.12"], ["WHOLE MILK GAL", "3.48"], ["BASMATI RICE 10LB", "14.99"], ["ONIONS YELLOW 3LB", "2.98"], ["GREEK YOGURT", "5.50"], ["CILANTRO", "0.79"]].map(([a, b]) => `<div style="display:flex;justify-content:space-between"><span>${a}</span><span>${b}</span></div>`).join("")}<br><div style="display:flex;justify-content:space-between"><b>TOTAL</b><b>33.22</b></div><div>DEBIT ****2291 APPROVED</div><br><div style="text-align:center">THANK YOU FOR SHOPPING</div></div></body>`,
  },
  {
    id: "t08-invoice-website", split: "test", category: "receipt", private: false, original: "Screenshot 2026-10-02 at 9.09.17 AM.png",
    keys: [["invoice"], ["web", "site", "design"]], viewport: desk,
    html: `<body style="background:#eee"><div style="max-width:760px;margin:24px auto;background:#fff;padding:36px"><div style="display:flex;justify-content:space-between"><div><h1 style="margin:0;font-size:30px">INVOICE</h1><div style="color:#666">#2026-014</div></div><div style="text-align:right">Anudeep Bonagiri<br>Boerne, TX</div></div>
<p><b>Bill to:</b> Riverbend Home Care Services</p><p>Issued Oct 2, 2026 · Due Oct 16, 2026</p>
<table style="width:100%;border-collapse:collapse"><tr style="background:#f5f5f5"><th style="text-align:left;padding:8px">Description</th><th style="text-align:right;padding:8px">Amount</th></tr><tr><td style="padding:8px">Website redesign, 6 pages</td><td style="text-align:right;padding:8px">$900.00</td></tr><tr><td style="padding:8px">FAQ chatbot setup</td><td style="text-align:right;padding:8px">$300.00</td></tr><tr><td style="padding:8px"><b>Total due</b></td><td style="text-align:right;padding:8px"><b>$1,200.00</b></td></tr></table></div></body>`,
  },
  {
    id: "t09-map-directions", split: "test", category: "travel", private: false, original: "Screenshot 2026-10-17 at 7.05.48 AM.png",
    keys: [["direction", "route", "map", "drive", "driving"], ["garner", "boerne", "leakey"]], viewport: desk,
    html: `<body style="display:flex;height:100vh"><div style="width:380px;padding:18px;border-right:1px solid #ddd"><div style="border:1px solid #ccc;border-radius:8px;padding:8px;margin-bottom:6px">Boerne, TX</div><div style="border:1px solid #ccc;border-radius:8px;padding:8px">Garner State Park, Concan, TX</div>
<div style="margin-top:18px;padding:12px;background:#e8f0fe;border-radius:8px"><b style="font-size:20px;color:#188038">1 hr 52 min</b> (104 mi)<div style="color:#555">via TX-46 W and US-83 N</div><div style="color:#555;font-size:13px">Fastest route, the usual traffic</div></div>
<div style="margin-top:12px;padding:12px"><b>2 hr 5 min</b> (108 mi)<div style="color:#555">via RR 337</div></div></div>
<div style="flex:1;background:#e5e3df;position:relative"><svg width="100%" height="100%" viewBox="0 0 900 800"><path d="M760 520 C 640 500, 560 430, 470 420 S 260 350, 140 260" stroke="#1a73e8" stroke-width="8" fill="none"/><circle cx="760" cy="520" r="10" fill="#fff" stroke="#000" stroke-width="3"/><circle cx="140" cy="260" r="12" fill="#d93025"/><text x="700" y="560" font-size="18">Boerne</text><text x="90" y="235" font-size="18">Garner State Park</text><text x="420" y="400" font-size="15" fill="#666">Bandera</text></svg></div></body>`,
  },
  {
    id: "t10-hotel-booking", split: "test", category: "travel", private: false, original: "Screenshot 2026-10-01 at 10.33.29 PM.png",
    keys: [["hotel", "booking", "reservation", "stay"], ["san francisco", "sf"]], viewport: desk,
    html: `<body>${browser("stays.harborlight.com/trips/HL-77193", `<div style="max-width:780px;margin:26px auto"><div style="color:#188038;font-weight:600">✓ Booking confirmed</div><h1 style="font-size:26px;margin:6px 0">Harborlight Inn, Mission District, San Francisco</h1><p style="color:#555">Confirmation HL-77193</p>
<div style="display:flex;gap:40px;margin:16px 0"><div>Check-in<br><b>Fri, Oct 23</b><br>after 3 PM</div><div>Check-out<br><b>Sun, Oct 25</b><br>before 11 AM</div><div>Guests<br><b>2 adults</b></div><div>Room<br><b>2 queen beds</b></div></div>
<p>Total for 2 nights: <b>$412.60</b> (paid)</p><p style="color:#666">Free cancellation until Oct 21.</p></div>`)}</body>`,
  },
  {
    id: "t11-hack-day-event", split: "test", category: "schedule", private: false, original: "Screenshot 2026-10-15 at 5.17.40 PM.png",
    keys: [["hacktoberfest", "hack day", "hackathon"]], viewport: desk,
    html: `<body style="background:#160c28;color:#fff"><div style="max-width:820px;margin:40px auto;text-align:center"><div style="letter-spacing:4px;color:#ff8ae2">ROWDY LAUNCH PRESENTS</div><h1 style="font-size:58px;margin:12px 0">Hacktoberfest Hack Day</h1><div style="font-size:24px">Saturday, October 31 · 10 AM to 5 PM</div><div style="font-size:20px;margin-top:8px;color:#bbb">UTSA Business Building, 3rd floor</div>
<div style="display:flex;gap:16px;justify-content:center;margin-top:30px">${["Build with open-source AI", "Food all day", "Prizes at 4:30"].map((x) => `<div style="border:1px solid #ff8ae2;border-radius:10px;padding:14px 18px">${x}</div>`).join("")}</div><div style="margin-top:28px;font-size:18px">RSVP on RowdyLink</div></div></body>`,
  },
  {
    id: "t12-syllabus-grading", split: "test", category: "document", private: false, original: "Screenshot 2026-08-20 at 9.58.02 AM.png",
    keys: [["grad"], ["syllabus", "course", "operating systems", "breakdown", "weight"]], viewport: desk,
    html: `<body>${browser("utsa.simplesyllabus.com/en-US/doc/7jz/Fall-2026-CS-3733", `<div style="max-width:820px;margin:20px auto"><h2>Activities and Grading</h2><p>CS 3733 Operating Systems · Fall 2026</p><table style="border-collapse:collapse;width:60%">${[["Activity", "Quantity", "Percentage"], ["Projects", "3", "30"], ["Homework Assignments", "5", "40"], ["Mid-Term Exam", "1", "15"], ["Final Exam", "1", "15"], ["Total", "", "100%"]].map((r, i) => `<tr>${r.map((c) => `<td style="border:1px solid #ccc;padding:8px;${i === 0 ? "font-weight:700;background:#f5f5f5" : ""}">${c}</td>`).join("")}</tr>`).join("")}</table>
<h2>Late Submission Policy</h2><p>Late projects/assignments will suffer a 10 percentage point penalty for every 24 hour period. Projects/Assignments turned in 5 or more days after the due date will receive a grade of 0.</p></div>`)}</body>`,
  },
  {
    id: "t13-docs-reset-password", split: "test", category: "article", private: false, original: "Screenshot 2026-10-18 at 1.14.55 PM.png",
    keys: [["password", "reset"]], viewport: desk,
    html: `<body>${browser("docs.tallyboard.dev/account/reset-password", `<div style="display:flex"><div style="width:240px;padding:20px;color:#555;font-size:14px;line-height:2">Getting started<br>Workspaces<br><b style="color:#000">Account</b><br>&nbsp;&nbsp;Profile<br>&nbsp;&nbsp;<b style="color:#000">Reset your password</b><br>&nbsp;&nbsp;Two-step verification<br>Billing</div><div style="max-width:700px;padding:20px"><h1>Reset your password</h1><p>If you forgot your password, you can reset it from the sign-in page.</p><ol style="line-height:1.9"><li>Go to the sign-in page and click <b>Forgot password?</b></li><li>Enter the email address for your account.</li><li>Open the email from Tallyboard and click the reset link. The link expires after 30 minutes.</li><li>Choose a new password with at least 12 characters.</li></ol><p style="background:#fff7e0;padding:10px;border-left:4px solid #f0b400">Tallyboard support will never ask you for your password.</p></div></div>`)}</body>`,
  },
  {
    id: "t14-recovery-codes", split: "test", category: "account", private: true, original: "Screenshot 2026-10-19 at 8.48.36 PM.png",
    keys: [["recovery", "backup"], ["code"]], viewport: desk,
    html: `<body style="background:#f6f8fa"><div style="max-width:560px;margin:50px auto;background:#fff;border:1px solid #d0d7de;border-radius:8px;padding:24px"><h2 style="margin-top:0">Save your recovery codes</h2><p>Keep these somewhere safe. If you lose your phone, each code can be used once to sign in to your Codehaven account.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;${mono};font-size:17px;background:#f6f8fa;padding:16px;border-radius:6px">${["a7f3c-91d2e", "4be0d-c33a8", "f19a2-07b6c", "8d5e1-a4f90", "2c7b9-e6d14", "b03f8-59c2a", "6e4a1-d8b37", "93c0f-2a7e5"].map((c) => `<div>${c}</div>`).join("")}</div><div style="margin-top:16px;display:flex;gap:10px"><button style="padding:8px 14px">Download</button><button style="padding:8px 14px">Print</button><button style="padding:8px 14px">Copy</button></div></div></body>`,
  },
  {
    id: "t15-id-card", split: "test", category: "document", private: true, original: "IMG_4950.PNG",
    keys: [["id", "license", "licence", "identification", "card"]], viewport: phone,
    html: `<body style="background:#222">${statusBar("2:20")}<div style="margin:120px 16px;background:linear-gradient(135deg,#e8f1f8,#c9dced);color:#111;border-radius:14px;padding:16px;font-size:12px"><div style="display:flex;justify-content:space-between"><b style="font-size:15px;color:#123c69">STATE OF NORTH PLAINS</b><b style="color:#a00">SPECIMEN</b></div><div style="font-weight:700;color:#123c69">DRIVER LICENSE</div>
<div style="display:flex;gap:12px;margin-top:10px"><div style="width:90px;height:110px;background:#999;border-radius:6px"></div><div style="line-height:1.6">DL <b>NP 40917725</b><br>EXP 08/14/2031<br><b>SAMPLE, ALEX J</b><br>412 MESQUITE LN<br>DOB 03/09/2001 · SEX M · HGT 5-10<br>CLASS C</div></div></div></body>`,
  },
  {
    id: "t16-dashboard-users", split: "test", category: "chart", private: false, original: "Screenshot 2026-10-21 at 3.39.12 PM.png",
    keys: [["user", "active", "signup"]], viewport: desk,
    html: `<body style="background:#fafafa;padding:24px"><div style="display:flex;gap:16px">${[["Weekly active users", "1,284", "+18%"], ["New signups", "212", "+9%"], ["Retention (4 wk)", "41%", "-2 pts"]].map(([a, b, c]) => `<div style="flex:1;background:#fff;border:1px solid #e5e5e5;border-radius:10px;padding:16px"><div style="color:#666;font-size:13px">${a}</div><div style="font-size:30px;font-weight:700">${b}</div><div style="color:${c.startsWith("-") ? "#c00" : "#188038"}">${c}</div></div>`).join("")}</div>
<div style="background:#fff;border:1px solid #e5e5e5;border-radius:10px;margin-top:16px;padding:16px"><b>Weekly active users</b><svg viewBox="0 0 1000 300" width="100%" height="380"><polyline fill="none" stroke="#2563eb" stroke-width="4" points="0,260 90,250 180,236 270,240 360,210 450,190 540,196 630,160 720,140 810,120 900,96 1000,70"/>${["Aug 3", "Aug 17", "Aug 31", "Sep 14", "Sep 28", "Oct 12"].map((d, i) => `<text x="${i * 190}" y="295" font-size="14" fill="#777">${d}</text>`).join("")}</svg></div></body>`,
  },
  {
    id: "t17-budget-sheet", split: "test", category: "document", private: false, original: "Screenshot 2026-10-04 at 6.26.58 PM.png",
    keys: [["budget", "spreadsheet", "expense", "cost"]], viewport: desk,
    html: `<body><div style="padding:8px 12px;border-bottom:1px solid #ddd;font-size:18px">Hack Day budget</div><table style="border-collapse:collapse;font-size:14px;margin:0">${[["", "A", "B", "C", "D"], ["1", "Item", "Qty", "Unit cost", "Total"], ["2", "Pizza (lunch)", "16", "$14.00", "$224.00"], ["3", "Breakfast tacos", "90", "$2.25", "$202.50"], ["4", "Drinks + snacks", "1", "$140.00", "$140.00"], ["5", "Stickers", "200", "$0.35", "$70.00"], ["6", "Prizes", "3", "$50.00", "$150.00"], ["7", "", "", "Total", "$786.50"], ["8", "", "", "Funding (SGA)", "$800.00"]].map((r, i) => `<tr>${r.map((c, j) => `<td style="border:1px solid #e0e0e0;padding:6px 10px;min-width:${j === 0 ? 30 : 150}px;${i === 0 || j === 0 ? "background:#f8f9fa;color:#666;text-align:center" : ""}">${c}</td>`).join("")}</tr>`).join("")}</table></body>`,
  },
  {
    id: "t18-linkedin-internship", split: "test", category: "social", private: false, original: "Screenshot 2026-08-25 at 12.01.44 PM.png",
    keys: [["intern"]], viewport: desk,
    html: `<body style="background:#f3f2ef"><div style="max-width:560px;margin:30px auto;background:#fff;border-radius:10px;padding:18px;border:1px solid #ddd"><div style="display:flex;gap:10px;align-items:center"><div style="width:48px;height:48px;border-radius:50%;background:#0a66c2"></div><div><b>Daniel Okafor</b><div style="font-size:13px;color:#666">CS @ UT San Antonio · 1d</div></div></div>
<p style="font-size:16px;line-height:1.5">I'm happy to share that I'm starting a new position as a Software Engineering Intern at Kestrel Logistics! Thank you to everyone at the career fair who pointed me in the right direction.</p><div style="border:1px solid #eee;border-radius:8px;padding:14px;text-align:center;color:#555">Starting a new position<br><b>Software Engineering Intern at Kestrel Logistics</b></div><div style="color:#666;font-size:13px;margin-top:10px">👍❤️ 148 · 37 comments</div></div></body>`,
  },
  {
    id: "t19-meme-my-machine", split: "test", category: "other", private: false, original: "IMG_4963.PNG",
    keys: [["machine", "works", "meme"]], viewport: phone,
    html: `<body style="background:#000">${statusBar()}<div style="margin:120px 16px;background:#fff;text-align:center;padding:10px"><div style="font:900 30px Impact,'Arial Black',sans-serif;text-transform:uppercase">It works on my machine</div><svg viewBox="0 0 200 140" width="100%"><rect x="40" y="30" width="120" height="75" rx="6" fill="#ccc" stroke="#333" stroke-width="3"/><rect x="25" y="105" width="150" height="10" rx="3" fill="#999"/><circle cx="100" cy="68" r="22" fill="#fc0"/><circle cx="92" cy="62" r="3"/><circle cx="108" cy="62" r="3"/><path d="M88 74 Q100 86 112 74" stroke="#000" stroke-width="3" fill="none"/></svg><div style="font:900 30px Impact,'Arial Black',sans-serif;text-transform:uppercase">Then we'll ship your machine</div></div></body>`,
  },
  {
    id: "t20-wifi-settings", split: "test", category: "account", private: false, original: "Screenshot 2026-10-10 at 9.20.31 PM.png",
    keys: [["wi-fi", "wifi", "network"]], viewport: desk,
    html: `<body style="display:flex;height:100vh;background:#ececec"><div style="width:240px;padding:20px;font-size:14px;line-height:2.1">General<br>Appearance<br><b style="background:#0a84ff;color:#fff;padding:3px 8px;border-radius:6px">Wi-Fi</b><br>Bluetooth<br>Network<br>Battery</div><div style="flex:1;background:#fff;padding:24px"><h2 style="margin-top:0">Wi-Fi</h2><div style="display:flex;justify-content:space-between;padding:12px;border-bottom:1px solid #eee"><span>Wi-Fi</span><span>On ●</span></div><div style="padding:12px;border-bottom:1px solid #eee">Connected: <b>utsa-secure</b> ✓</div><div style="color:#666;margin-top:14px">Known networks</div>${["Casa3B_5G", "SWBC-Guest", "utsa-guest", "HillCountryMarket_Free"].map((n) => `<div style="padding:10px 12px;border-bottom:1px solid #f2f2f2">🔒 ${n}</div>`).join("")}<div style="margin-top:14px;color:#666">Ask to join networks: Notify</div></div></body>`,
  },
  {
    id: "t21-pull-request", split: "test", category: "code", private: false, original: "Screenshot 2026-10-12 at 11.48.07 PM.png",
    keys: [["pull request", "pr", "merge", "review"], ["filter", "sentence"]], viewport: desk,
    html: `<body>${browser("codehaven.dev/anudeep-bonagiri/ratecon-radar/pull/7", `<div style="max-width:980px;margin:18px auto"><h1 style="font-weight:400;font-size:28px">Fix pre-filter: let four-word sentences through <span style="color:#777">#7</span></h1><div><span style="background:#1f883d;color:#fff;padding:4px 10px;border-radius:14px">Open</span> anudeep-bonagiri wants to merge 1 commit into <code>main</code> from <code>fix-gate</code></div>
<div style="border:1px solid #d0d7de;border-radius:6px;margin-top:16px"><div style="background:#f6f8fa;padding:8px 12px;${mono};font-size:13px">src/core.js</div><pre style="margin:0;${mono};font-size:13px;line-height:1.6"><div style="background:#ffebe9">-  if (text.split(/\\s+/).length &lt; 5) return false;</div><div style="background:#e6ffec">+  if (text.split(/\\s+/).length &lt; 4) return false;</div></pre></div>
<div style="margin-top:16px;border:1px solid #d0d7de;border-radius:6px;padding:12px">✓ All checks have passed · <b>This branch has no conflicts with the base branch</b><br><button style="margin-top:8px;background:#1f883d;color:#fff;border:0;padding:8px 14px;border-radius:6px">Merge pull request</button></div></div>`)}</body>`,
  },
  {
    id: "t22-card-details", split: "test", category: "account", private: true, original: "IMG_4977.PNG",
    keys: [["card", "credit", "debit", "payment"]], viewport: phone,
    html: `<body style="background:#f4f6f8">${statusBar("4:05")}<div style="padding:10px 20px;font-size:20px;font-weight:700">Card details</div><div style="margin:12px 16px;height:200px;border-radius:16px;background:linear-gradient(135deg,#2b2d42,#5c5f7a);color:#fff;padding:20px;position:relative"><div style="font-weight:700">Pinewood CU · Debit</div><div style="position:absolute;bottom:58px;font-size:22px;letter-spacing:2px;${mono}">4417 1234 5678 9113</div><div style="position:absolute;bottom:20px;font-size:14px">ANUDEEP BONAGIRI &nbsp;&nbsp; EXP 09/29 &nbsp;&nbsp; CVV 382</div></div>
<div style="margin:12px 16px;background:#fff;border-radius:14px;padding:6px 18px">${["Lock card", "Report lost or stolen", "Set travel notice", "Change PIN"].map((a) => `<div style="padding:13px 0;border-bottom:1px solid #eee">${a}</div>`).join("")}</div></body>`,
  },
];
