import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CompareRow } from "./timeline";

const { fontFamily } = loadFont("normal", { weights: ["800", "900"], subsets: ["latin"] });

const pop = (frame: number) =>
  interpolate(frame, [0, 6], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

// The white pill pinned near the top for one beat of the script.
export const Tag: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 210 }}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 54,
          color: "black",
          background: "white",
          padding: "18px 34px",
          borderRadius: 999,
          border: "6px solid black",
          boxShadow: "0 12px 0 black",
          maxWidth: 920,
          textAlign: "center",
          scale: pop(frame),
          rotate: interpolate(frame, [0, 6], ["-4deg", "-2deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// A punchline slammed in at an angle. `nowrap` keeps a trailing emoji on the
// same line; keep the text short (about 14 characters plus an emoji).
const StampText: React.FC<{ text: string; color?: string; frame: number }> = ({ text, color, frame }) => (
  <div
    style={{
      fontFamily,
      fontWeight: 900,
      fontSize: 112,
      whiteSpace: "nowrap",
      color: color ?? "#3DFF8B",
      WebkitTextStroke: "16px black",
      paintOrder: "stroke fill",
      textShadow: "0 12px 0 black",
      scale: interpolate(frame, [0, 7], [2.2, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
      }),
      rotate: "-5deg",
    }}
  >
    {text}
  </div>
);

export const Stamp: React.FC<{ text: string; color?: string }> = ({ text, color }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 300 }}>
      <StampText text={text} color={color} frame={frame} />
    </AbsoluteFill>
  );
};

// Bars racing to their values while the numbers are read out. Times are
// relative to the card's start.
export const Compare: React.FC<{
  title?: string;
  rows: (CompareRow & { startMs: number; fillMs: number })[];
  stamp?: { text: string; atMs: number; color?: string };
}> = ({ title, rows, stamp }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const max = Math.max(...rows.map((r) => r.value));
  const stampFrame = stamp ? frame - Math.round((stamp.atMs / 1000) * fps) : -1;

  return (
    <AbsoluteFill style={{ alignItems: "center", top: 170 }}>
      <div
        style={{
          width: 920,
          padding: "40px 44px",
          borderRadius: 40,
          background: "rgba(10,10,14,0.82)",
          border: "6px solid black",
          boxShadow: "0 14px 0 black",
          fontFamily,
          display: "flex",
          flexDirection: "column",
          gap: 34,
          scale: pop(frame),
        }}
      >
        {title ? (
          <div style={{ fontSize: 40, fontWeight: 800, color: "#bbb", textAlign: "center" }}>{title}</div>
        ) : null}
        {rows.map((row) => {
          const started = ms >= row.startMs;
          const progress = interpolate(ms, [row.startMs, row.startMs + row.fillMs], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.4, 0, 0.6, 1),
          });
          const rowFrame = frame - Math.round((row.startMs / 1000) * fps);
          const width = progress * (row.value / max);
          return (
            <div key={row.label} style={{ opacity: started ? 1 : 0.35, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 50, fontWeight: 900, color: "white" }}>{row.label}</span>
                <span
                  style={{
                    fontSize: 64,
                    fontWeight: 900,
                    color: row.color,
                    scale: started && row.fill !== "line" ? pop(rowFrame) * 1.15 : 1,
                  }}
                >
                  {(progress * row.value).toFixed(row.decimals ?? 0)}
                  {row.suffix ?? ""}
                </span>
              </div>
              <div style={{ height: 46, borderRadius: 23, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${width * 100}%`,
                    minWidth: width > 0 ? 18 : 0,
                    borderRadius: 23,
                    background: row.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {stamp && stampFrame >= 0 ? (
        <div style={{ marginTop: 46 }}>
          <StampText text={stamp.text} color={stamp.color} frame={stampFrame} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
