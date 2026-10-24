// A second, smaller test set made only for the "private" check, written after
// the first test run showed that check missing an API key and a Wi-Fi password.
// These ten were made before the revised prompt was run on anything, and both
// prompts were scored on them once. Five show a real secret; five are traps
// that talk about secrets without showing one. All of it is made up.
import { FIXTURES } from "./fixtures.mjs";

const mono = `font-family:Menlo,Consolas,"DejaVu Sans Mono",monospace`;
const phone = { width: 390, height: 844 };
const desk = { width: 1280, height: 800 };
const statusBar = (t) => `<div style="display:flex;justify-content:space-between;padding:14px 26px 6px;font-weight:600;font-size:15px"><span>${t}</span><span>▮▮▮ ◔ ▭</span></div>`;
const browser = (url, body) => `<div style="background:#dee1e6;padding:8px 10px;display:flex;gap:8px;align-items:center"><span style="color:#ff5f57">●</span><span style="color:#febc2e">●</span><span style="color:#28c840">●</span><div style="flex:1;background:#fff;border-radius:16px;padding:5px 14px;font-size:13px;color:#444">${url}</div></div>${body}`;

export const HOLDOUT = [
  {
    id: "h01-notes-wifi-password", split: "holdout", category: "document", private: true, original: "IMG_5002.PNG",
    keys: [["wifi", "wi-fi", "password", "network"]], viewport: phone,
    html: `<body style="background:#fffdf3">${statusBar("8:14")}<div style="padding:8px 20px;color:#c79a00">‹ Notes</div><div style="padding:0 20px"><h2 style="margin:6px 0">Mom's house</h2><div style="color:#888;font-size:13px">October 18, 2026 at 8:13 PM</div><p style="font-size:17px;line-height:1.6">Wi-Fi: <b>Bonagiri_Home</b><br>pw: <span style="${mono}">mango-Lassi-2290</span><br><br>Garage code is on the fridge.<br>Trash goes out Thursday night.</p></div></body>`,
  },
  {
    id: "h02-github-token", split: "holdout", category: "account", private: true, original: "Screenshot 2026-10-21 at 9.02.18 PM.png",
    keys: [["token", "access"]], viewport: desk,
    html: `<body>${browser("codehaven.dev/settings/tokens", `<div style="max-width:760px;margin:30px auto"><h2>Personal access tokens</h2><div style="background:#dafbe1;border:1px solid #4ac26b;border-radius:6px;padding:12px;margin:14px 0">Make sure to copy your personal access token now. You won't be able to see it again!</div><div style="border:1px solid #d0d7de;border-radius:6px;padding:14px;display:flex;justify-content:space-between;align-items:center"><span style="${mono};font-size:15px">chp_4fQ9xT2LmA7rZ0wK8sV3nB6yD1eH5uJcPq</span><button>Copy</button></div><p style="color:#555">ratecon-radar deploy · Expires on Jan 19, 2027 · repo, workflow</p></div>`)}</body>`,
  },
  {
    id: "h03-terminal-aws-secret", split: "holdout", category: "code", private: true, original: "Screenshot 2026-10-22 at 1.47.55 AM.png",
    keys: [["aws", "credential", "key", "secret"]], viewport: desk,
    html: `<body style="background:#1e1e1e;color:#ddd;${mono};font-size:14px;padding:22px"><div style="color:#8f8">anudeep@mbp ~ % cat ~/.aws/credentials</div><pre>[default]
aws_access_key_id = AKIA4QX7RZ2M9PLW3KEN
aws_secret_access_key = q8Vt+1mZcR4y0Lw9EoX2bKf7Hs5uNd3PjQ6aGiT1

[cruze-dev]
aws_access_key_id = AKIA7TB2KX9QW4MZ1RLP
aws_secret_access_key = Zp3Lm8Rq0Xw5Kt2Vy7Bn4Hc9Jf1Ds6Ga0Ue3Wi8</pre><div style="color:#8f8">anudeep@mbp ~ %</div></body>`,
  },
  {
    id: "h04-password-manager-entry", split: "holdout", category: "account", private: true, original: "Screenshot 2026-10-16 at 4.30.09 PM.png",
    keys: [["password", "login"]], viewport: desk,
    html: `<body style="background:#f2f2f7"><div style="max-width:560px;margin:50px auto;background:#fff;border-radius:12px;padding:22px"><div style="display:flex;gap:12px;align-items:center"><div style="width:44px;height:44px;border-radius:10px;background:#c7d2fe"></div><div><b style="font-size:19px">canvas.utsa.edu</b><div style="color:#888;font-size:13px">Passwords</div></div></div>
<div style="margin-top:18px;border-top:1px solid #eee"><div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee"><span style="color:#888">User name</span><span>vjz000</span></div><div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee"><span style="color:#888">Password</span><span style="${mono}">Roadrunner!Fall26</span></div><div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:#888">Last modified</span><span>Aug 19, 2026</span></div></div></div></body>`,
  },
  {
    id: "h05-email-temp-password", split: "holdout", category: "account", private: true, original: "IMG_5013.PNG",
    keys: [["password", "temporary", "login", "account"]], viewport: phone,
    html: `<body>${statusBar("9:58")}<div style="padding:8px 18px;color:#0a84ff">‹ Inbox</div><div style="padding:0 18px"><h3 style="margin:4px 0">Your new staff portal account</h3><div style="color:#888;font-size:13px">IT Help Desk · 9:51 AM</div><p style="line-height:1.55">Hi Anudeep,<br><br>Your account for the volunteer portal is ready.<br><br>Username: abonagiri<br>Temporary password: <b style="${mono}">Kq7#vR2p!Lm9</b><br><br>You will be asked to change it the first time you sign in.<br><br>Thanks,<br>IT Help Desk</p></div></body>`,
  },
  {
    id: "h06-login-form-masked", split: "holdout", category: "account", private: false, original: "Screenshot 2026-10-14 at 7.55.40 AM.png",
    keys: [["sign in", "login", "log in", "sign-in"]], viewport: desk,
    html: `<body style="background:#f6f8fa"><div style="max-width:340px;margin:90px auto;background:#fff;border:1px solid #d0d7de;border-radius:8px;padding:20px"><h2 style="text-align:center;font-weight:400">Sign in to Codehaven</h2><label style="font-size:14px">Username or email address</label><div style="border:1px solid #d0d7de;border-radius:6px;padding:7px;margin:6px 0 14px">anudeep-bonagiri</div><label style="font-size:14px">Password</label><div style="border:1px solid #0969da;border-radius:6px;padding:7px;margin:6px 0 14px;letter-spacing:3px">••••••••••••••</div><div style="background:#1f883d;color:#fff;text-align:center;border-radius:6px;padding:8px">Sign in</div><p style="text-align:center;font-size:13px"><a>Forgot password?</a></p></div></body>`,
  },
  {
    id: "h07-2fa-settings", split: "holdout", category: "account", private: false, original: "Screenshot 2026-10-19 at 8.40.12 PM.png",
    keys: [["two-factor", "2fa", "two factor", "authentication", "security"]], viewport: desk,
    html: `<body><div style="max-width:760px;margin:30px auto"><h2>Password and authentication</h2><div style="border:1px solid #d0d7de;border-radius:6px;padding:16px"><b>Two-factor authentication</b> <span style="background:#dafbe1;color:#1a7f37;border-radius:12px;padding:2px 8px;font-size:13px">Enabled</span><p style="color:#555">Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.</p><div style="display:flex;justify-content:space-between;border-top:1px solid #eee;padding-top:10px"><span>Authenticator app</span><span style="color:#555">Configured</span></div><div style="display:flex;justify-content:space-between;border-top:1px solid #eee;padding-top:10px;margin-top:10px"><span>Recovery codes</span><span style="color:#555">Viewed Oct 19, 2026 · <a>View</a></span></div></div></div></body>`,
  },
  {
    id: "h08-blog-api-key-placeholder", split: "holdout", category: "article", private: false, original: "Screenshot 2026-10-11 at 2.18.47 PM.png",
    keys: [["api"]], viewport: desk,
    html: `<body>${browser("dev.to/someone/calling-an-open-model-api-in-5-lines", `<div style="max-width:720px;margin:24px auto"><h1 style="font-size:30px">Calling an open model API in 5 lines</h1><p style="color:#555">Posted on Oct 9 · 3 min read</p><p style="line-height:1.6">Set your key as an environment variable first, never paste it into code you commit.</p><pre style="background:#08090a;color:#f8f8f2;padding:14px;border-radius:6px;${mono};font-size:14px">export MODEL_API_KEY="YOUR_API_KEY_HERE"

curl https://api.example-models.dev/v1/chat \\
  -H "Authorization: Bearer $MODEL_API_KEY" \\
  -d '{"model": "gemma-4-e2b", "messages": [...]}'</pre><p style="line-height:1.6">If you see a 401, the variable is not set in the shell you are using.</p></div>`)}</body>`,
  },
  {
    id: "h09-checkout-last-four", split: "holdout", category: "receipt", private: false, original: "Screenshot 2026-10-07 at 6.05.33 PM.png",
    keys: [["checkout", "order", "payment", "cart"]], viewport: desk,
    html: `<body style="background:#f7f7f7"><div style="max-width:760px;margin:30px auto;background:#fff;padding:24px;border-radius:10px"><h2 style="margin-top:0">Review your order</h2><div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:10px 0"><span>Sticker pack, 200 ct</span><b>$70.00</b></div><div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:10px 0"><span>Shipping</span><b>$6.95</b></div><div style="display:flex;justify-content:space-between;padding:10px 0;font-size:18px"><b>Order total</b><b>$76.95</b></div><div style="border:1px solid #ddd;border-radius:8px;padding:12px;margin-top:10px">Pay with <b>Debit •••• 9113</b> <a style="float:right">Change</a></div><div style="background:#ffd814;text-align:center;border-radius:20px;padding:10px;margin-top:16px">Place your order</div></div></body>`,
  },
  {
    id: "h10-lock-screen", split: "holdout", category: "other", private: false, original: "IMG_5021.PNG",
    keys: [["lock", "notification", "home screen", "lockscreen"]], viewport: phone,
    html: `<body style="background:linear-gradient(180deg,#355c7d,#6c5b7b,#c06c84);color:#fff;height:100vh">${statusBar("")}<div style="text-align:center;margin-top:40px"><div style="font-size:18px">Saturday, October 24</div><div style="font-size:84px;font-weight:300;line-height:1">7:42</div></div><div style="margin:60px 14px 0;background:rgba(255,255,255,.25);border-radius:16px;padding:12px"><b>Messages</b> <span style="float:right;opacity:.8">now</span><div>Maya: are you bringing the extension cords?</div></div><div style="margin:10px 14px;background:rgba(255,255,255,.25);border-radius:16px;padding:12px"><b>Calendar</b> <span style="float:right;opacity:.8">8:00 AM</span><div>SWBC standup</div></div></body>`,
  },
];


// Round three, made after looksSecret() in src/core.js was written and before
// it was run on these. Several are built to be hard for that check: a 4-digit
// code, a passphrase with no digits, and traps full of long ID numbers.
export const HOLDOUT2 = [
  {
    id: "r01-sms-4-digit-code", split: "holdout2", category: "account", private: true, original: "IMG_5040.PNG",
    keys: [["code", "verification", "sign-in", "login"]], viewport: phone,
    html: `<body>${statusBar("11:20")}<div style="text-align:center;padding:6px;border-bottom:1px solid #ddd"><b>35421</b><div style="font-size:12px;color:#888">Text Message · Today 11:20 PM</div></div><div style="display:flex;margin:12px"><div style="max-width:75%;padding:9px 13px;border-radius:18px;background:#e9e9eb">Your RideLoop code is 4821. Don't share it with anyone.</div></div></body>`,
  },
  {
    id: "r02-wallet-balance", split: "holdout2", category: "account", private: true, original: "IMG_5044.PNG",
    keys: [["balance", "wallet", "account"]], viewport: phone,
    html: `<body style="background:#eef7f1">${statusBar("1:02")}<div style="padding:16px 20px"><div style="color:#666">PeerPay balance</div><div style="font-size:44px;font-weight:700">$184.20</div><div style="display:flex;gap:10px;margin-top:10px"><div style="background:#1a7f5a;color:#fff;border-radius:20px;padding:8px 16px">Transfer to bank</div><div style="background:#fff;border-radius:20px;padding:8px 16px">Add money</div></div></div><div style="margin:8px 16px;background:#fff;border-radius:14px;padding:4px 16px">${[["Maya Lopez", "Pizza for hack night", "+$32.00"], ["Chris Tran", "Uber split", "-$11.40"], ["Jordan K", "October rent share", "-$412.00"]].map(([a, b, c]) => `<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee"><span><b>${a}</b><br><span style="color:#777;font-size:13px">${b}</span></span><b>${c}</b></div>`).join("")}</div></body>`,
  },
  {
    id: "r03-router-passphrase", split: "holdout2", category: "account", private: true, original: "Screenshot 2026-10-22 at 6.12.40 PM.png",
    keys: [["wi-fi", "wifi", "wireless", "router", "network"]], viewport: desk,
    html: `<body style="background:#f0f2f5"><div style="background:#2b3a55;color:#fff;padding:14px 22px;font-weight:600">NetHaven AX3000 · Router admin</div><div style="max-width:700px;margin:30px auto;background:#fff;border-radius:8px;padding:24px"><h2 style="margin-top:0">Wireless settings</h2>${[["Network name (SSID)", "Bonagiri-AX"], ["Security", "WPA3-Personal"], ["Password", "sunflower field after rain"], ["Band", "2.4 GHz + 5 GHz"]].map(([a, b]) => `<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee"><span style="color:#555">${a}</span><span style="font-family:Menlo,monospace">${b}</span></div>`).join("")}<div style="margin-top:16px;background:#2b3a55;color:#fff;display:inline-block;padding:8px 16px;border-radius:6px">Save</div></div></body>`,
  },
  {
    id: "r04-dm-staging-password", split: "holdout2", category: "chat", private: true, original: "Screenshot 2026-10-23 at 10.41.07 AM.png",
    keys: [["staging", "database", "db", "password"]], viewport: desk,
    html: `<body style="display:flex;height:100vh"><div style="width:240px;background:#3f0e40;color:#ddd;padding:14px;font-size:14px;line-height:2">Cruze<br># general<br># eng<br><b style="color:#fff">● Shrithik</b></div><div style="flex:1;padding:18px"><b>Shrithik</b><div style="margin-top:16px">${[["Shrithik", "10:38 AM", "can you send me the staging db login, i'm locked out"], ["Anudeep", "10:40 AM", "user cruze_stage"], ["Anudeep", "10:40 AM", "pass Cz9!kP2w-tq"], ["Shrithik", "10:41 AM", "in. thanks"]].map(([a, t, m]) => `<div style="margin-bottom:12px"><b>${a}</b> <span style="color:#888;font-size:12px">${t}</span><div>${m}</div></div>`).join("")}</div></div></body>`,
  },
  {
    id: "r05-passport-page", split: "holdout2", category: "document", private: true, original: "IMG_5051.PNG",
    keys: [["passport"]], viewport: phone,
    html: `<body style="background:#222">${statusBar("3:33")}<div style="margin:140px 14px;background:linear-gradient(135deg,#f3eadb,#e2d3b8);border-radius:10px;padding:14px;font-size:11px;color:#222"><div style="display:flex;justify-content:space-between"><b>PASSPORT · REPUBLIC OF ARCADIA</b><b style="color:#a00">SPECIMEN</b></div><div style="display:flex;gap:10px;margin-top:8px"><div style="width:80px;height:100px;background:#888"></div><div style="line-height:1.6">Passport No. <b>X12345678</b><br>Surname: SAMPLE<br>Given names: JORDAN LEE<br>Date of birth: 14 FEB 2000<br>Date of expiry: 02 MAR 2034</div></div><div style="font-family:Menlo,monospace;margin-top:8px;font-size:10px">P&lt;ARCSAMPLE&lt;&lt;JORDAN&lt;LEE&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>X123456780ARC0002146M3403022&lt;&lt;&lt;&lt;&lt;&lt;</div></div></body>`,
  },
  {
    id: "r06-ticket-rotate-keys", split: "holdout2", category: "document", private: false, original: "Screenshot 2026-10-20 at 2.55.31 PM.png",
    keys: [["rotate", "key", "ticket"]], viewport: desk,
    html: `<body style="background:#f4f5f7"><div style="max-width:820px;margin:26px auto;background:#fff;border-radius:6px;padding:22px"><div style="color:#5e6c84;font-size:13px">CRUZE / ENG-4412</div><h2 style="margin:6px 0">Rotate the Mapbox and OpenRouter API keys</h2><div style="display:flex;gap:30px;font-size:14px;margin:10px 0"><span>Status: <b>In progress</b></span><span>Assignee: Anudeep B</span><span>Due: Oct 28</span></div><p style="line-height:1.6">The old keys were in a screenshot that went into a shared drive. Revoke both, issue new ones, update them in the deploy settings, and confirm the dev and staging builds still work. Do not paste the new keys in this ticket.</p><div style="color:#5e6c84;font-size:13px">Linked: ENG-4398, ENG-4401</div></div></body>`,
  },
  {
    id: "r07-package-tracking", split: "holdout2", category: "receipt", private: false, original: "Screenshot 2026-10-21 at 9.12.08 AM.png",
    keys: [["tracking", "package", "shipment", "delivery"]], viewport: desk,
    html: `<body><div style="max-width:760px;margin:30px auto"><h2>Tracking 1Z999AA10123456784</h2><div style="font-size:22px;color:#188038;font-weight:600">Out for delivery</div><div style="color:#555">Estimated delivery: Today by 8:00 PM · Boerne, TX</div><div style="margin-top:20px;border-left:3px solid #188038;padding-left:16px;line-height:2">Oct 21, 7:14 AM · Out for delivery · San Antonio, TX<br>Oct 20, 11:52 PM · Arrived at facility · San Antonio, TX<br>Oct 19, 4:03 PM · Departed facility · Dallas, TX<br>Oct 18, 2:40 PM · Label created</div></div></body>`,
  },
  {
    id: "r08-password-rules", split: "holdout2", category: "account", private: false, original: "Screenshot 2026-10-13 at 8.03.22 PM.png",
    keys: [["password"]], viewport: desk,
    html: `<body style="background:#f6f8fa"><div style="max-width:420px;margin:70px auto;background:#fff;border:1px solid #d0d7de;border-radius:8px;padding:22px"><h2 style="margin-top:0">Create a new password</h2><div style="border:1px solid #d0d7de;border-radius:6px;padding:8px;letter-spacing:3px">••••••••</div><div style="height:6px;background:#eee;border-radius:3px;margin:10px 0"><div style="width:35%;height:100%;background:#d1242f;border-radius:3px"></div></div><div style="color:#d1242f;font-size:14px">Weak</div><ul style="font-size:14px;line-height:1.8;color:#555"><li>✓ At least 8 characters</li><li>✗ One number</li><li>✗ One symbol</li><li>✓ Not one of your last 5 passwords</li></ul></div></body>`,
  },
  {
    id: "r09-order-number-receipt", split: "holdout2", category: "receipt", private: false, original: "Screenshot 2026-10-08 at 12.30.51 PM.png",
    keys: [["order", "receipt", "purchase", "cable"]], viewport: desk,
    html: `<body><div style="max-width:720px;margin:30px auto"><h2>Order placed, thanks!</h2><p>Order <b>#112-4839201-5567</b> · October 8, 2026</p><div style="border:1px solid #ddd;border-radius:8px;padding:14px">USB-C to HDMI cable, 6 ft × 2 · <b>$23.98</b><br>15-outlet power strip × 1 · <b>$34.99</b></div><p style="font-size:18px">Order total: <b>$62.86</b></p><p style="color:#666">Arriving Saturday, Oct 10</p></div></body>`,
  },
  {
    id: "r10-token-generator-code", split: "holdout2", category: "code", private: false, original: "Screenshot 2026-10-17 at 11.58.44 PM.png",
    keys: [["token", "random", "generate"]], viewport: desk,
    html: `<body style="background:#1e1e1e;color:#d4d4d4;font-family:Menlo,monospace;font-size:14px;padding:20px"><div style="color:#888">auth/tokens.py</div><pre style="line-height:1.6"><span style="color:#c586c0">import</span> secrets

<span style="color:#569cd6">def</span> <span style="color:#dcdcaa">new_api_token</span>(prefix=<span style="color:#ce9178">"cz_"</span>, nbytes=<span style="color:#b5cea8">24</span>):
    <span style="color:#6a9955"># 24 random bytes, URL-safe, e.g. cz_&lt;32 chars&gt;</span>
    <span style="color:#c586c0">return</span> prefix + secrets.token_urlsafe(nbytes)

<span style="color:#569cd6">def</span> <span style="color:#dcdcaa">is_valid</span>(token):
    <span style="color:#c586c0">return</span> token.startswith(<span style="color:#ce9178">"cz_"</span>) <span style="color:#c586c0">and</span> len(token) == <span style="color:#b5cea8">35</span></pre></body>`,
  },
];

export const ALL_FIXTURES = [...FIXTURES, ...HOLDOUT, ...HOLDOUT2];
