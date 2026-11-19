import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Word } from "./timeline";

const { fontFamily } = loadFont("normal", { weights: ["900"], subsets: ["latin"] });

// Words that are this close together share one caption page (2 to 3 words).
const COMBINE_MS = 650;

const Page: React.FC<{
  tokens: { text: string; fromMs: number; toMs: number }[];
  pageStartMs: number;
}> = ({ tokens, pageStartMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = pageStartMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top: 260 }}>
      <div
        style={{
          width: 900,
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 108,
          lineHeight: 1.08,
          textTransform: "uppercase",
          color: "white",
          WebkitTextStroke: "16px black",
          paintOrder: "stroke fill",
          textShadow: "0 10px 24px rgba(0,0,0,0.55)",
          scale: interpolate(frame, [0, 5], [0.72, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.34, 1.56, 0.64, 1),
          }),
        }}
      >
        {tokens.map((t, i) => {
          const active = nowMs >= t.fromMs && nowMs < t.toMs;
          return (
            <span key={i}>
              {i > 0 ? " " : null}
              <span style={{ color: active ? "#FFE600" : "white", display: "inline-block" }}>
                {t.text.trim()}
              </span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{ words: Word[] }> = ({ words }) => {
  const { fps } = useVideoConfig();

  const pages = useMemo(() => {
    const captions: Caption[] = words.map((w, i) => ({
      text: (i === 0 ? "" : " ") + w.text,
      startMs: w.startMs,
      endMs: w.endMs,
      timestampMs: null,
      confidence: null,
    }));
    return createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: COMBINE_MS })
      .pages;
  }, [words]);

  return (
    <>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.round((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs;
        const duration = Math.max(1, Math.round((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} name={`Caption ${page.text.trim()}`} from={from} durationInFrames={duration} layout="none">
            <Page tokens={page.tokens} pageStartMs={page.startMs} />
          </Sequence>
        );
      })}
    </>
  );
};
