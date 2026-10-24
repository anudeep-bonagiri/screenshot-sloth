---
title: "Screenshot Sloth: Gemma 4 names my screenshots in a browser tab, so I never have to"
published: true
tags: devchallenge, hf26challenge, gemma, opensource
cover_image: https://raw.githubusercontent.com/anudeep-bonagiri/screenshot-sloth/main/docs/images/cover.png
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)*

I built this with an AI coding agent. The section called My Agent Session says what the agent did.

## What I Built

In August, three psychologists at Binghamton University published a paper in *Memory & Cognition* called "Digital amnesia: The aftermath of a screenshot." Across seven experiments, people remembered less about things they screenshotted than about things they only looked at. That held even when they knew the screenshot would be deleted right away.

So the screenshot is doing the remembering, and the only thing it remembers about itself is the time. My Desktop is full of files like `Screenshot 2026-10-09 at 10.12.33 PM.png`. One of them is the error I need for a bug report. One is the Wi-Fi password at my mom's house. I am not going to open forty of them to find out which.

Screenshot Sloth renames them for me. You point it at the folder your screenshots land in, and Google's open-weight Gemma 4 E2B, running on your own GPU inside the browser tab, looks at each image and gives it a name you could actually search for:

- `Screenshot 2026-10-09 at 10.12.33 PM.png` becomes `Errors/2026-10-09 KeyError in Python traceback.png`
- `Screenshot 2026-10-17 at 7.05.48 AM.png` becomes `Travel/2026-10-17 Map directions from Boerne to Garner State Park.png`
- `IMG_4931.PNG` becomes `Receipts/2026-10-18 Hill Country Market receipt.png`

It sorts them into folders by type, and it can move the ones that show a password, a code or a card number into a folder called `Private`. Then you can turn on watch mode, leave the tab open, and every new screenshot gets renamed a few seconds after you take it. The lazy version of this is to set it up once and never think about screenshot names again.

Who gets to be lazier: anyone whose Desktop or camera roll is a pile of timestamps. On a Mac that is the default.

## Demo

Live: https://anudeep-bonagiri.github.io/screenshot-sloth/

Code, the labeled test screenshots and every raw model answer: https://github.com/anudeep-bonagiri/screenshot-sloth

Open it in Chrome or Edge on a laptop or desktop. Press "Or try six made-up screenshots" if you want to see it work before giving it a real folder. The first run downloads the model, about 3.4 GB. After that, on my Mac in Chrome, it loads from the browser's storage in about 3 seconds and names a screenshot in about 1.4 seconds.

![Screenshot Sloth naming six sample screenshots in Chrome](https://raw.githubusercontent.com/anudeep-bonagiri/screenshot-sloth/main/docs/images/app.jpg)

The folder flow works like this. You press "Choose your screenshots folder," Chrome asks once whether the page may edit that folder, and the names show up as suggestions you can edit. Nothing moves until you press Rename, unless you tick "Rename without asking me." Every move is written to `screenshot-sloth-log.csv` in the folder, and there is an undo button for the last batch.

{% embed https://github.com/anudeep-bonagiri/screenshot-sloth %}

## How I Built It

The model is Gemma 4 E2B in 4-bit, from the `onnx-community` export, running through Transformers.js 4.3.1 on WebGPU in a Web Worker. Gemma 4 reads images natively, so there is no OCR step. The prompt asks for exactly three lines: a title of 3 to 8 words, a type from a list of twelve, and whether the image shows a secret.

Everything that touches a file is ordinary code. The date comes from the old file name, or from the file's modified time for iPhone names like `IMG_4977.PNG`. The title is cleaned of characters that break on Windows or macOS. Collisions get a `(2)`. The folder comes from the type, except that anything marked private goes to `Private`. The model never gets a file handle. It sees pixels and returns text.

Chrome's File System Access API does the folder access. The app renames with `FileSystemHandle.move()` where the browser has it, and otherwise copies the file and deletes the original. There is a test (`scripts/test-app.mjs`) that runs the whole rename, sort, collision and undo path in headless Chromium against the browser's private file system, which uses the same API as a real folder.

Two details took a while. Gemma 4's image processor has a `max_soft_tokens` setting, the number of tokens the vision encoder spends on an image. 280 is the default. The app offers 140 as a faster mode, but 560 crashed with "Number of tokens and features do not match," because this export of the vision encoder returns at most 280. And as with my last project, the 4-bit weights need an operator (`GatherBlockQuantized`) that the WebAssembly backend does not have, so there is no CPU fallback in the browser.

### What the tests showed

I made 52 screenshots for testing. They are HTML in the repo, rendered to PNG at the density a Mac (2x) or an iPhone (3x) would save them: terminal errors, chats, receipts, a boarding pass, a calendar, a pull request, a `.env` file, a fake driver license marked SPECIMEN, and so on. Every name, card number and code in them is made up. Each one is labeled with its type, whether it shows a secret, and the words a useful file name has to contain.

I wrote the prompt against 10 of them. It got all 10 right, and I froze it before running the 22 test screenshots. The first row below is the app itself: `bench.html` sends the screenshots through the same worker in Chrome on my Mac. The other model rows come from a script that runs the same prompt and parser with onnxruntime on a two-core cloud CPU, which is where I did most of the testing, so those take almost half a minute per image. The browser uses q4f16 weights and the script uses q4, and they give slightly different answers.

| System | Useful names | Right folder | Secrets caught | False alarms | Time each |
|---|---|---|---|---|---|
| Gemma 4 E2B in Chrome (WebGPU), 280 image tokens | 20 of 22 | 16 of 22 | 3 of 5 | 0 | 1.4 s |
| Gemma 4 E2B on CPU, 280 image tokens | 19 of 22 | 16 of 22 | 3 of 5 | 0 | 27.5 s |
| Gemma 4 E2B on CPU, 140 image tokens | 19 of 22 | 13 of 22 | 3 of 5 | 0 | 17.9 s |
| Tesseract OCR + keyword rules | 11 of 22 | 19 of 22 | 5 of 5 | 1 | 0.5 s |

The name check is strict. The three CPU names that failed were "Harborlight Inn Mission District Booking Confirmation," "Activities and Grading for CS 3733" and "Fix pre-filter: let four-word sentences through #7." I would be happy to find any of those on my Desktop. The OCR baseline names a file after its first line of text, which is often the URL bar: `@ © @ codehaven.dev/anudeep-bonagiri/ratecon-radar/pull/7`.

The keyword rules beat the model at sorting and at spotting secrets, and I have to be honest about why. I wrote those rules while looking at the labels. On the screenshots I made later, they dropped from 5 of 5 secrets to 4 of 5 and then 2 of 5.

### The private check, three rounds

The misses in round one bothered me more than anything else. The model read a `.env` file with an API key and a database password in it and called it ".env Properties Configuration File," not private. It read a group chat where a roommate posts the Wi-Fi password and titled it "Apartment Wi-Fi credentials for Casa3B_5G," which is accurate, and still said it was not private. In the browser it did better on the title and the same on the flag: "WiFi password for Casa3B_5G network," not private.

So I tried a second prompt. Instead of answering yes or no, the model has to copy the secret it sees. I made ten new screenshots before running it: five with a real secret (a GitHub-style token, AWS keys in a terminal, a password manager entry, a temporary password in an email, a Wi-Fi password in Notes) and five traps that talk about secrets without showing one (a login form with dots, a two-factor settings page, a blog post with `YOUR_API_KEY_HERE`, a checkout page showing the last four digits of a card, a lock screen).

The new prompt found every secret. It also often copied ordinary text when there was no secret to find: the word "Enabled" from the two-factor page, the placeholder from the blog post, `$900.00, $300.00, $1,200.00` from an invoice. So I wrote a check in code that only accepts the copy if it is shaped like a secret, with letters mixed with digits, six or more digits in a row, or a dollar amount on an account screen. On the first two rounds it was perfect: 10 of 10 secrets, no false alarms.

I did not trust that, since I had written the check while looking at those exact answers. So I made a third round of ten, this time aimed at the check: a 4-digit login code, a Wi-Fi passphrase that is four plain words, a Slack DM with a staging password, plus a package tracking number and an order number as traps. The check caught 2 of 5 and flagged both traps. No check at all would have caught 4 of 5.

| Private check | All 15 secrets | False alarms on 27 ordinary screenshots |
|---|---|---|
| Yes/no prompt | 7 of 15 | 0 |
| Copy-the-secret prompt | 14 of 15 | 11 |
| Copy-the-secret prompt + shape check | 12 of 15 (2 of 5 on the round it had not seen) | 2 |
| Tesseract OCR + rules | 11 of 15 | 7 |

Those are the CPU runs, where I did the experiment. In the browser the two prompts came out at 8 of 15 with no false alarms and 15 of 15 with 11, and those are the numbers the app shows next to the setting.

The shape check is not in the app. The app has a setting instead. "Careful" is the yes/no prompt, and it is the default because it has never sent an ordinary screenshot to `Private`. "Catch more" is the copy-the-secret prompt. In the browser it caught every secret and also filed a grocery receipt, a hotel booking, a SQL query and a disk warning as private. The page says plainly that neither one is a security tool. When the copy prompt copies a secret, the worker throws the text away before it reaches the page.

Two limits on all of this: I made the screenshots and the labels, and I also wrote the prompts, so these numbers are a sanity check and not a benchmark. And clean HTML renders are easier than real screenshots, which have notifications, dark mode and half a window cut off.

## Why Does Open Innovation Matter?

Because of what is in a screenshot folder. In 52 made-up screenshots I needed a fake card, a fake driver license, recovery codes, a password manager entry and AWS keys, because that is what people screenshot. A hosted vision API would see every one of them before deciding which ones are private. Here the page sets a Content Security Policy that allows connections to three places: the site itself, the jsDelivr CDN for library code, and Hugging Face for the model weights. The model worker starts from a blob URL so it inherits the same policy. The browser enforces it, and the "Run the privacy test" button lets anyone check.

Cost is the second reason, and it is what makes watch mode reasonable. Every screenshot is an image plus a prompt, about 640 tokens before the model writes anything, and a busy person takes several a day, forever. On a hosted API that bill never stops. With open weights it runs on the GPU you already have, at about a second and a half per screenshot on mine.

Third, open weights let me look inside the knobs. I could set the vision encoder's token budget myself and measure what it costs: 140 image tokens was about a third faster on the CPU and named files just as well, but put three more screenshots in the wrong folder. I could also find where the export stops (560 tokens fails). With a closed API those are settings someone else picks.

Fourth, it keeps working without a connection once the model is cached, and Gemma 4 is Apache 2.0, so nothing about this depends on a provider staying around or keeping its price.

A large hosted model would probably do better on the private check. That was not measured here, and given what the check is for, it is the one job I would least want to send to a server.

## My Agent Session

I do not have a DevRelay export, so here is the plain account. I directed an AI coding agent, Claude, through this project. It wrote the app, made the 52 test screenshots and their labels, ran every evaluation (the browser ones in Chrome on my Mac), wrote the OCR baseline and the scoring, and drafted this post. The three rounds of the private check happened in the order described above. Every raw model answer is in `eval/results/`, so the tables can be checked.

## The Lazy Payoff

At 1.4 seconds a screenshot, a Desktop with 300 of them is about seven minutes of the laptop working while I do something else, and after that watch mode handles each new one in a second or two. The part I actually wanted is the search: Spotlight can then find "KeyError" or "Garner" or "receipt" in file names that used to be timestamps. I have not run it on my own Desktop for this post, so I do not have a real before-and-after count to share yet.

## Prize Categories

Best Use of Gemma. The app runs Gemma 4 E2B's vision model locally in the browser on WebGPU, and the write-up measures two image-token budgets and two prompts on the same labeled screenshots.

## Sources

- Sophia Fabrizio, Rebecca Lurie and Deanne Westerman, "Digital amnesia: The aftermath of a screenshot," *Memory & Cognition* (2026), as reported by [Binghamton University News](https://www.binghamton.edu/news/story/6397/digital-amnesia-taking-screenshots-makes-you-more-likely-to-forget-information)
- [Gemma 4 E2B ONNX model card](https://huggingface.co/onnx-community/gemma-4-E2B-it-ONNX)
