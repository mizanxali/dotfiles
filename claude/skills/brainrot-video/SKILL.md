---
name: brainrot-video
description: Make a brainrot-style vertical short explaining a topic, from script to rendered MP4. Vertical no-copyright gameplay (Minecraft parkour, Subway Surfers, Temple Run) from YouTube in the background, a Peter Griffin voiceover from Fish Audio, word-by-word pop captions, labels per beat, stat cards and meme sound effects, built in Remotion. Use when the user asks for a brainrot video, a Subway Surfers or Minecraft parkour style explainer, or a Peter Griffin voiceover video.
argument-hint: "<topic> [minecraft|subway surfers|temple run|<youtube-url>]"
---

# Brainrot video

Three phases. **Write the script and stop for review.** Then **build it** and open the preview. **Render only when asked.** The user reviews the script before anything is built, and reviews the preview before anything is rendered: never skip either stop.

The template in `template/` is a working Remotion project. Copy it; don't rebuild it. The worked example is `examples/fast-link/` (`script.md` is the review format, `script.json` the build format).

## Writing rule: no em dashes

Never use an em dash in the script, labels, cards or code comments. Use a colon, a comma, a full stop or parentheses. Write ranges with "to".

---

## Phase 1: the script

### Gather the facts first

Read the source before writing a line: the repo's docs, ADRs, PR, the user's notes or memory. Every number in the video must come from a source you read, and goes in the fact-check notes with where it came from. Never invent or round up a stat to make it punchier; "almost eighty times" for a measured 79x is fine, "a hundred times" is not.

### Structure (55 to 70 s, about 170 to 190 words)

| Beat | Length | What it does |
|---|---|---|
| Hook | 0 to 4 s | The most shocking concrete fact, in second person ("Your iPhone and your friend's Android are right next to each other. Sending one file between them takes over three minutes.") |
| Problem | about 7 s | Why it's like that, in plain words. |
| Reveal | about 3 s | "So we built X." Name the thing once, clearly. |
| How it works | about 25 s | Three or four numbered steps ("Step one: ..."). One idea per step, no jargon without a gloss. |
| Numbers | about 14 s | The measured result, slow thing then fast thing, then the multiplier. |
| Outro | about 5 s | A rhythmic tagline in short fragments ("No router. No internet. No cloud. Just two phones.") and the name. |

Not every topic is a product launch; keep the shape (hook, problem, payoff, numbers, tagline) and adapt the beats.

### Voice rules

- Short sentences, spoken rhythm, casual, second person. Peter reads it straight: no "hehehe" or catchphrases unless the user asks.
- **Write numbers out in spoken text** ("one hundred ninety-seven seconds") and drop awkward decimals; the cards and labels keep the digits ("197.7s"). Say "megabyte", not "MiB".
- Spell acronyms the way they should be said if the voice might stumble.
- Each line in `script.json` is one or two sentences, at most about 9 s spoken.

### On-screen layer

- **Labels (`tag`):** one per beat, not one per line. ALL CAPS, at most about 34 characters, one emoji. Steps read `STEP 1 · MEET OVER BLUETOOTH 🔐`.
- **Cards:** a `compare` card for a before and after pair of numbers (the slow bar fills while its line is read, the fast one snaps), with an optional stamp for the multiplier. A standalone `stamp` card for one punchline (`~80x FASTER 🤯`, at most about 14 characters plus an emoji).
- **Sound cues:** plan them in the script (see the library below): a boom on the shock word, a whip on each step label, a "bruh" on the bad news, a ding or boom on the payoff.

### Present it

Write the script in chat in the `examples/fast-link/script.md` format: beats with timestamps, the VO lines, the labels, cards and sound cues, then **fact-check notes** and **questions**. State the gameplay choice: the user's, or **Subway Surfers** by default, and say they can pick Minecraft parkour or Temple Run. Then stop and wait for review.

---

## Phase 2: build

### 1. The project

Personal videos live in their own folder in the home directory, never inside a repository: `~/<slug>-video` (for example `~/fastlink-video`). Don't overwrite an existing folder; pick another name.

```bash
cp -R ~/.claude/skills/brainrot-video/template ~/<slug>-video
cd ~/<slug>-video && npm i && npm run sfx     # sfx: normalizes the effects into public/sfx
```

### 2. The gameplay

Download with **yt-dlp** (`brew install yt-dlp` if missing). Don't use the user's `~/ariadne` youtubei.js downloader: it no longer works against YouTube.

```bash
scripts/get-gameplay.sh search "subway surfers"      # id | length | WxH | views | title
scripts/get-gameplay.sh <url> 3                      # first 3 min -> public/gameplay.mp4
```

Pick a result that is **vertical** (height above width, ideally 1080x1920), **long** (5 min or more, so there's no repeat), says **no copyright** in the title, and has many views. If the user gave a URL, use it. Download about two minutes more than the video is long; the composition skips the first 3 s and loops the clip if it runs short.

The script finds real black bars with cropdetect and crops them, then fills 1080x1920 at 30 fps. A vertical upload often *looks* letterboxed in YouTube's 16:9 player while the stream itself is a clean 1080x1920; the script reports "No black bars" then, and that's correct. Grab one frame and look at it before moving on.

### 3. script.json

Turn the approved script into `src/script.json`, an array of lines (see `examples/fast-link/script.json`):

```jsonc
{
  "id": "hook2",                       // unique, short
  "text": "Sending one file between them takes over three minutes.",   // exactly what Peter says
  "tag": "3 MINUTES. ONE FILE. 💀",     // optional label, shown from this line's start
  "sfx": [                             // optional
    { "sound": "vine-boom", "at": "minutes" },        // at: first word starting with this
    { "sound": "bruh", "at": "crawls", "offsetMs": 250 },
    { "sound": "anime-wow", "at": "Fast", "maxMs": 2200 },   // maxMs cuts a long effect
    { "sound": "loading-lag", "volume": 0.6 }                 // no at: the line's start
  ],
  "card": { "type": "stamp", "text": "~80x FASTER 🤯", "at": "eighty" }
}
```

A line that carries a card shows no label, so put a stamp on a line without one. A `compare` card sits on the first line it covers and runs through `until`, and no line it covers shows a label:

```json
"card": { "type": "compare", "title": "1 MB FILE · ANDROID → IPHONE", "until": "numX",
  "rows": [
    { "label": "🐌 BLUETOOTH", "value": 197.7, "suffix": "s", "decimals": 1, "color": "#FF4D4D", "line": "numBle", "fill": "line" },
    { "label": "⚡ FAST LINK", "value": 2.5, "suffix": "s", "decimals": 1, "color": "#3DFF8B", "line": "numFast", "fill": "snap" }
  ],
  "stamp": { "text": "~80x FASTER 🤯", "line": "numX", "at": "eighty" } }
```

Labels, sounds and cards are read from `script.json` at render time, so changing them never needs a new voice. Changing a line's `text` does: the preview refuses to load until the voice is regenerated.

### 4. The voice: Peter Griffin on Fish Audio

Always Fish Audio, always Peter Griffin (`d75c270eaee14c8aa1e9e980cc37cf1b`, the most used English Peter model) unless the user names another voice; `node generate-voiceover.mjs --find "<name>"` searches the library.

The key: if `FISH_API_KEY` is already in the environment, use it. Otherwise, inside super.engineering, request it (the dialog offers the key the user saved under that name), with a tool timeout of at least 10 minutes:

```bash
se secret request --label "Fish Audio API key" --name FISH_API_KEY \
  --reason "Peter Griffin voiceover for a brainrot video (https://fish.audio/app/api-keys)"
FISH_API_KEY="$(cat <printed path>)" npm run voice
```

Read the file only inside the command that needs it; never print the key or ask for it in chat. Outside super.engineering, ask the user to export `FISH_API_KEY` in their shell.

`npm run voice` speaks every line (speed `FISH_SPEED`, default 1.1), normalizes it to the voice loudness, times its words through Fish Audio speech-to-text and writes `src/voiceover.json`. Each line prints how many words got real timings: expect almost all. A line far below that, or a line that runs long, usually means Peter misread it; reword the text and regenerate. Every run costs Fish credits, so regenerate only when the spoken text changes.

### 5. Preview and check

Start Studio in the background (`npx remotion studio`), give the user the URL and the composition `Brainrot`. Then check it yourself before handing over: render stills (`npx remotion still Brainrot out/s-<frame>.png --frame=<n> --scale=0.3`) at the hook, a step label, the compare card before and after its snap, the stamp, and the outro, stitch them with `ffmpeg ... -filter_complex hstack=N` and look. Look for captions running off the frame, a label wrapping to three lines, a stamp wrapping its emoji, and a label hiding behind a card.

Report what's in the draft and stop for review.

### Audio levels

`normalize-audio.mjs` owns them: the voice at **-16 LUFS**, effects with a body (booms, "bruh", dings) **6 dB under the voice**, and effects too short to measure (whoosh, whip, click, ping) at **-12 dB peak**. Both extremes have been tried and rejected: the raw files drowned the voice, and 10 dB under was too meek. When the user says louder or quieter, move `SFX_LUFS` and `SHORT_SFX_PEAK_DB` by 2 to 4 dB together, then `npm run sfx`. Per-cue `volume` is only for an effect that plays under speech (the loading sound at 0.6).

---

## Phase 3: render (only when asked)

```bash
npm run render          # out/video.mp4, 1080x1920, H.264 + AAC
```

Run it in the background. Then verify: `ffprobe` (1080x1920, 30 fps, audio present), loudness (`ffmpeg -nostats -i out/video.mp4 -vn -af ebur128=peak=true -f null -`: about -14 LUFS is right for X), and a few frames from the file itself. Report the path, length and size. X takes up to 512 MB and 2:20 on a standard account.

If the user says "wait" or "don't render" while it runs, stop it and delete any partial file.

---

## Sound library

In `template/assets/sfx-src/` (the originals; `npm run sfx` writes the normalized copies). More at `https://remotion.media/<name>.wav` (see the Remotion sfx list) or `github.com/kapishdima/soundcn`; add a file to `assets/sfx-src/` and rerun `npm run sfx`.

| Sound | Length | Use it for |
|---|---|---|
| `vine-boom` | 1.3 s | the shock word, the payoff number, the product name at the end |
| `bruh` | 0.6 s | bad news ("crawls", "fails"), 250 ms after the word |
| `record-scratch` | 1.3 s | a hard stop: "No Wi-Fi. No internet." |
| `whoosh` | 0.2 s | a label or card coming in |
| `whip` | 0.2 s | each numbered step |
| `anime-wow` | 4.2 s | the reveal; cut with `maxMs` about 2200 |
| `ding` | 1.4 s | a good number landing |
| `loading-lag` | 2.7 s | the slow bar filling; volume 0.6, it plays under speech |
| `snapchat-notification` | 0.2 s | a secret or private detail |
| `switch` | 0.3 s | a tap or a toggle |
| `oh-my-god-vine` | 1.6 s | disbelief |
| `yippee` | 2.6 s | a happy ending |
| `illuminati-confirmed` | 7.8 s | a conspiracy beat; always cut with `maxMs` |

Don't put a sound on every line: one or two per beat. Stacking effects under a sentence buries the voice.
