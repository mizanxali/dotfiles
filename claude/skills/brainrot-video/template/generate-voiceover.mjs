// Speaks every line of src/script.json with Fish Audio and writes one clip per
// line into public/voiceover/ plus the word timings into src/voiceover.json.
//
// Fish Audio TTS returns audio only, so each clip goes back through Fish Audio
// speech-to-text for word timestamps, which are lined up with the script's own
// words so captions show the script verbatim. Each clip is then normalized to
// the voice loudness in normalize-audio.mjs.
//
//   FISH_API_KEY=... node generate-voiceover.mjs                 # Peter Griffin
//   FISH_API_KEY=... FISH_VOICE_ID=<id> node generate-voiceover.mjs
//   FISH_API_KEY=... node generate-voiceover.mjs --find "peter griffin"
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { normalizeVoiceFile } from "./normalize-audio.mjs";

const KEY = process.env.FISH_API_KEY;
// "Peter Griffin", the most used English Peter voice on Fish Audio.
const VOICE = process.env.FISH_VOICE_ID ?? "d75c270eaee14c8aa1e9e980cc37cf1b";
const MODEL = process.env.FISH_MODEL ?? "s2.1-pro";
const SPEED = Number(process.env.FISH_SPEED ?? "1.1");
const API = "https://api.fish.audio";
const auth = { Authorization: `Bearer ${KEY}` };

// --find <title>: list public voice models matching a title, most used first.
if (process.argv[2] === "--find") {
  if (!KEY) throw new Error("FISH_API_KEY is not set");
  const q = new URLSearchParams({ title: process.argv[3] ?? "", page_size: "15", sort_by: "task_count" });
  const res = await fetch(`${API}/model?${q}`, { headers: auth });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  for (const m of (await res.json()).items) {
    console.log(`${m._id}  uses=${m.task_count}  likes=${m.like_count}  "${m.title}"  langs=${m.languages}`);
  }
  process.exit(0);
}

if (!KEY) throw new Error("FISH_API_KEY is not set");
const lines = JSON.parse(readFileSync("src/script.json", "utf8"));
const OUT = "public/voiceover";

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const durationMs = (file) =>
  Math.round(
    Number(
      execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file])
        .toString()
        .trim(),
    ) * 1000,
  );

// Spread words over a stretch of the clip by character count, for words
// speech-to-text did not time.
function estimateWords(tokens, startMs, endMs) {
  const weight = (t) => t.length + 2;
  const total = tokens.reduce((n, t) => n + weight(t), 0);
  let t = startMs;
  return tokens.map((tok) => {
    const d = (weight(tok) / total) * (endMs - startMs);
    const w = { text: tok, startMs: Math.round(t), endMs: Math.round(t + d) };
    t += d;
    return w;
  });
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Give each script word the time of the speech-to-text word it matches.
// Recognised words can differ (numbers, splits, mishearings), so match in
// order with a small lookahead, and spread any unmatched run of script words
// across the gap between its matched neighbours.
function alignWords(tokens, segments, clipMs) {
  const seg = segments.map((s) => ({ n: norm(s.text), startMs: s.start * 1000, endMs: s.end * 1000 }));
  const times = new Array(tokens.length).fill(null);
  let j = 0;
  tokens.forEach((tok, i) => {
    const n = norm(tok);
    for (let k = j; k < Math.min(seg.length, j + 4); k++) {
      if (seg[k].n && (seg[k].n === n || n.startsWith(seg[k].n) || seg[k].n.startsWith(n))) {
        times[i] = { startMs: seg[k].startMs, endMs: seg[k].endMs };
        j = k + 1;
        return;
      }
    }
  });
  const words = [];
  let i = 0;
  while (i < tokens.length) {
    if (times[i]) {
      words.push({ text: tokens[i], ...times[i] });
      i++;
      continue;
    }
    let end = i;
    while (end < tokens.length && !times[end]) end++;
    const from = words.length ? words[words.length - 1].endMs : 0;
    const to = end < tokens.length ? times[end].startMs : clipMs;
    words.push(...estimateWords(tokens.slice(i, end), from, Math.max(from + 1, to)));
    i = end;
  }
  const matched = times.filter(Boolean).length;
  return { words: words.map((w) => ({ ...w, startMs: Math.round(w.startMs), endMs: Math.round(w.endMs) })), matched };
}

async function fishTts(text, file) {
  const res = await fetch(`${API}/v1/tts`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json", model: MODEL },
    body: JSON.stringify({
      text,
      reference_id: VOICE,
      format: "mp3",
      mp3_bitrate: 192,
      latency: "normal",
      language: "en",
      prosody: { speed: SPEED },
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function fishAsr(file) {
  const form = new FormData();
  form.append("audio", new Blob([readFileSync(file)]), "line.mp3");
  form.append("language", "en");
  form.append("ignore_timestamps", "false");
  const res = await fetch(`${API}/v1/asr`, { method: "POST", headers: auth, body: form });
  if (!res.ok) throw new Error(`ASR ${res.status}: ${await res.text()}`);
  return (await res.json()).segments ?? [];
}

const result = [];
for (const [i, line] of lines.entries()) {
  const file = `${OUT}/${String(i + 1).padStart(2, "0")}-${line.id}.mp3`;
  const tokens = line.text.split(/\s+/).filter(Boolean);
  await fishTts(line.text, file);
  normalizeVoiceFile(file);
  const aligned = alignWords(tokens, await fishAsr(file), durationMs(file));
  const words = aligned.words;
  const note = ` (${aligned.matched}/${tokens.length} words timed by speech-to-text)`;
  result.push({ id: line.id, text: line.text, file: file.replace(/^public\//, ""), durationMs: durationMs(file), words });
  console.log(`${line.id}: ${result.at(-1).durationMs} ms${note}`);
}

writeFileSync(
  "src/voiceover.json",
  JSON.stringify({ voice: VOICE, lines: result }, null, 2) + "\n",
);
console.log(`total ${(result.reduce((n, l) => n + l.durationMs, 0) / 1000).toFixed(1)} s`);
