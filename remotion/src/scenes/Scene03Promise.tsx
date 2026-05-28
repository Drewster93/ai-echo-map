import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { GradientText } from "../components/GradientText";
import { HexGrid } from "../components/HexGrid";

const Phrase: React.FC<{ text: React.ReactNode; index: number }> = ({
  text,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sIn = spring({ frame, fps, config: { damping: 16 } });
  const sOut = interpolate(frame, [38, 50], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const op = Math.min(sIn, sOut);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: op,
        transform: `translateY(${(1 - sIn) * 20}px)`,
      }}
    >
      <div
        style={{
          fontFamily: fraunces,
          fontSize: index === 1 ? 200 : 160,
          fontWeight: 500,
          color: COLORS.white,
          letterSpacing: -5,
          textAlign: "center",
          maxWidth: 1700,
          lineHeight: 1,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const Scene03Promise: React.FC = () => {
  const frame = useCurrentFrame();
  const hexLit = interpolate(frame, [0, 135], [0.15, 0.7], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          mixBlendMode: "screen",
        }}
      >
        <HexGrid lit={hexLit} cols={36} rows={20} size={32} />
      </div>
      <Sequence from={0} durationInFrames={50}>
        <Phrase
          index={0}
          text={
            <>
              Local <GradientText>AI visibility</GradientText>
            </>
          }
        />
      </Sequence>
      <Sequence from={45} durationInFrames={50}>
        <Phrase
          index={1}
          text={
            <em style={{ fontStyle: "italic" }}>
              hex by hex
            </em>
          }
        />
      </Sequence>
      <Sequence from={90} durationInFrames={45}>
        <Phrase index={2} text={<>in real time.</>} />
      </Sequence>
    </AbsoluteFill>
  );
};
