// Sets the loudness of the voiceover and the sound effects so the effects
// always sit under the voice, whatever level each source file came in at.
//
//   node normalize-audio.mjs            # both
//   node normalize-audio.mjs voice      # voiceover clips only (in place)
//   node normalize-audio.mjs sfx        # effects only (assets/sfx-src -> public/sfx)
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync } from "node:fs";

// Integrated loudness of the voiceover, a common target for social video.
export const VOICE_LUFS = -16;
// Effects with a body (booms, "bruh", dings) land this far under the voice (6 dB: present but never over it).
const SFX_LUFS = VOICE_LUFS - 6;
// Effects too short to measure as loudness (whooshes, whips, clicks) are
// matched by peak instead, set well under the voice's peaks.
const SHORT_SFX_PEAK_DB = -12;
const SHORT_MS = 450;

const run = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args]);

// Integrated loudness, true peak and duration, from ffmpeg's EBU R128 meter.
const stats = (file) => {
  const err = spawnSync("ffmpeg", ["-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr.toString();
  const summary = err.slice(err.lastIndexOf("Summary:"));
  const lufs = Number(/I:\s+(-?[\d.]+) LUFS/.exec(summary)?.[1]);
  const peak = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(summary)?.[1]);
  const [h, m, sec] = /Duration: (\d+):(\d+):([\d.]+)/.exec(err).slice(1).map(Number);
  return { lufs, peak, ms: ((h * 60 + m) * 60 + sec) * 1000 };
};

export function normalizeVoiceFile(file) {
  const tmp = `${file}.tmp.mp3`;
  run(["-i", file, "-af", `loudnorm=I=${VOICE_LUFS}:TP=-1.5:LRA=11`, "-ar", "44100", "-b:a", "192k", tmp]);
  renameSync(tmp, file);
}

function normalizeVoice() {
  const dir = "public/voiceover";
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".mp3"))) {
    normalizeVoiceFile(`${dir}/${f}`);
    const s = stats(`${dir}/${f}`);
    console.log(`voice ${f}: ${s.lufs} LUFS, peak ${s.peak} dB`);
  }
}

function normalizeSfx() {
  const src = "assets/sfx-src";
  mkdirSync("public/sfx", { recursive: true });
  for (const f of readdirSync(src).filter((f) => f.endsWith(".wav"))) {
    const s = stats(`${src}/${f}`);
    const short = s.ms < SHORT_MS || !Number.isFinite(s.lufs) || s.lufs <= -69;
    const gain = short ? SHORT_SFX_PEAK_DB - s.peak : SFX_LUFS - s.lufs;
    run(["-i", `${src}/${f}`, "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=0.5:level=false`, `public/sfx/${f}`]);
    const after = stats(`public/sfx/${f}`);
    console.log(`sfx ${f}: ${short ? "peak" : "loudness"} ${gain.toFixed(1)} dB -> ${after.lufs} LUFS, peak ${after.peak} dB`);
  }
}

const what = process.argv[2];
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!what || what === "voice") normalizeVoice();
  if (!what || what === "sfx") normalizeSfx();
}
