import script from "./script.json";
import voiceover from "./voiceover.json";

// Silence between two voiceover lines.
export const GAP_MS = 120;
// Time on screen after the last line, long enough for a closing boom to ring out.
export const TAIL_MS = 1500;
// How long a card stays up after the last line it covers.
export const CARD_TAIL_MS = 400;

export type Word = { text: string; startMs: number; endMs: number };

// A sound effect at the start of its line, or on the first spoken word that
// begins with `at`.
export type Sfx = {
  sound: string;
  at?: string;
  offsetMs?: number;
  volume?: number;
  maxMs?: number;
};

// A big tilted punchline over the frame, from its line's start (or the word
// `at`) to the end of the line.
export type StampCard = { type: "stamp"; text: string; at?: string; color?: string };

// Bars racing to a value each, from the line `card` sits on through `until`.
// A row starts when its `line` starts; `fill: "line"` fills over that line's
// whole duration (the slow one), `"snap"` fills at once (the fast one).
export type CompareRow = {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  color: string;
  line: string;
  fill?: "line" | "snap";
};
export type CompareCard = {
  type: "compare";
  title?: string;
  until: string;
  rows: CompareRow[];
  stamp?: { text: string; line: string; at?: string; color?: string };
};

export type Card = StampCard | CompareCard;

// One line as written in script.json.
export type ScriptLine = {
  id: string;
  text: string;
  tag?: string;
  sfx?: Sfx[];
  card?: Card;
};

// One line's audio as written by generate-voiceover.mjs into voiceover.json.
type Voiced = { id: string; text: string; file: string; durationMs: number; words: Word[] };

export type Line = ScriptLine & Omit<Voiced, "id" | "text">;

export type PlacedLine = Line & { atMs: number };

export const placedLines: PlacedLine[] = (() => {
  let at = 0;
  // Labels, sounds and cards come from script.json, so they can change without
  // regenerating the voice; the spoken text cannot.
  const voiced = new Map((voiceover.lines as Voiced[]).map((v) => [v.id, v]));
  return (script as ScriptLine[]).map((line) => {
    const v = voiced.get(line.id);
    if (!v || v.text !== line.text) {
      throw new Error(`Line "${line.id}" has no voice for its current text: run npm run voice`);
    }
    const placed = { ...line, file: v.file, durationMs: v.durationMs, words: v.words, atMs: at };
    at += v.durationMs + GAP_MS;
    return placed;
  });
})();

export const totalMs = (() => {
  const last = placedLines[placedLines.length - 1];
  return last.atMs + last.durationMs + TAIL_MS;
})();

const lineById = (id: string): PlacedLine => {
  const line = placedLines.find((l) => l.id === id);
  if (!line) throw new Error(`script.json: no line with id "${id}"`);
  return line;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Absolute time of the first spoken word in `line` that begins with `at`, or
// of the line's start.
const timeOf = (line: PlacedLine, at?: string): number => {
  if (!at) return line.atMs;
  const word = line.words.find((w) => norm(w.text).startsWith(norm(at)));
  if (!word) throw new Error(`script.json: line "${line.id}" has no word "${at}"`);
  return line.atMs + word.startMs;
};

export type PlacedSfx = Sfx & { key: string; atMs: number };

export const placedSfx: PlacedSfx[] = placedLines.flatMap((line) =>
  (line.sfx ?? []).map((sfx, i) => ({
    ...sfx,
    key: `${line.id}-${i}-${sfx.sound}`,
    atMs: Math.max(0, timeOf(line, sfx.at) + (sfx.offsetMs ?? 0)),
  })),
);

// Cards with every time resolved; times inside are relative to `fromMs`.
export type PlacedCard =
  | { key: string; type: "stamp"; fromMs: number; toMs: number; text: string; color?: string }
  | {
      key: string;
      type: "compare";
      fromMs: number;
      toMs: number;
      title?: string;
      rows: (CompareRow & { startMs: number; fillMs: number })[];
      stamp?: { text: string; atMs: number; color?: string };
    };

export const placedCards: PlacedCard[] = placedLines.flatMap((line): PlacedCard[] => {
  const card = line.card;
  if (!card) return [];
  if (card.type === "stamp") {
    return [
      {
        key: `${line.id}-stamp`,
        type: "stamp",
        fromMs: timeOf(line, card.at),
        toMs: line.atMs + line.durationMs + CARD_TAIL_MS,
        text: card.text,
        color: card.color,
      },
    ];
  }
  const until = lineById(card.until);
  const fromMs = line.atMs;
  return [
    {
      key: `${line.id}-compare`,
      type: "compare",
      fromMs,
      toMs: until.atMs + until.durationMs + CARD_TAIL_MS,
      title: card.title,
      rows: card.rows.map((row) => {
        const rowLine = lineById(row.line);
        return {
          ...row,
          startMs: rowLine.atMs - fromMs,
          fillMs: row.fill === "line" ? rowLine.durationMs : 150,
        };
      }),
      stamp: card.stamp
        ? {
            text: card.stamp.text,
            color: card.stamp.color,
            atMs: timeOf(lineById(card.stamp.line), card.stamp.at) - fromMs,
          }
        : undefined,
    },
  ];
});

// A line that carries a card, or that a card covers, shows no tag: the card
// owns the top of the frame.
export const lineHasCard = (line: PlacedLine): boolean =>
  Boolean(line.card) || placedCards.some((c) => line.atMs >= c.fromMs && line.atMs < c.toMs);
