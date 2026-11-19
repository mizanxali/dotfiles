import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Captions } from "./Captions";
import { Compare, Stamp, Tag } from "./Overlays";
import { lineHasCard, placedCards, placedLines, placedSfx } from "./timeline";

// Skip the first seconds of the gameplay clip (intros, fades, logos).
const GAMEPLAY_TRIM_S = 3;
// A tag stays at least this long even when its line is short.
const MIN_TAG_MS = 2200;

export const Brainrot: React.FC = () => {
  const { fps } = useVideoConfig();
  const toFrames = (ms: number) => Math.round((ms / 1000) * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Video
        name="Gameplay"
        src={staticFile("gameplay.mp4")}
        muted
        loop
        trimBefore={GAMEPLAY_TRIM_S * fps}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />

      {placedLines.map((line, i) => {
        const next = placedLines[i + 1];
        const tagMs = Math.max(MIN_TAG_MS, (next ? next.atMs : line.atMs + line.durationMs) - line.atMs);
        return (
          <Sequence key={line.id} name={line.id} from={toFrames(line.atMs)} durationInFrames={toFrames(line.durationMs) + 1}>
            <Audio src={staticFile(line.file)} />
            {line.tag && !lineHasCard(line) ? (
              <Sequence name={`Tag ${line.id}`} durationInFrames={toFrames(tagMs)} layout="none">
                <Tag text={line.tag} />
              </Sequence>
            ) : null}
            <Captions words={line.words} />
          </Sequence>
        );
      })}

      {placedSfx.map((sfx) => (
        <Sequence
          key={sfx.key}
          name={`SFX ${sfx.sound}`}
          from={toFrames(sfx.atMs)}
          durationInFrames={sfx.maxMs ? toFrames(sfx.maxMs) : undefined}
          layout="none"
        >
          <Audio src={staticFile(`sfx/${sfx.sound}.wav`)} volume={sfx.volume ?? 1} />
        </Sequence>
      ))}

      {placedCards.map((card) => (
        <Sequence key={card.key} name={`Card ${card.key}`} from={toFrames(card.fromMs)} durationInFrames={toFrames(card.toMs - card.fromMs)}>
          {card.type === "stamp" ? (
            <Stamp text={card.text} color={card.color} />
          ) : (
            <Compare title={card.title} rows={card.rows} stamp={card.stamp} />
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
