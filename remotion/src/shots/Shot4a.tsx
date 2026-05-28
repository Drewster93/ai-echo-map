import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { ChromaticSplit } from "../motion/Cinematic";
import { CINE_IN } from "../motion/easings";

// Shot 4.1 — Product wordmark assembles with chromatic split.
const LINE1 = "AI Performance";
const LINE2 = "Pulse";

const AnimatedLine: React.FC<{
  text: string;
  frameOffset?: number;
  fontSize: number;
}> = ({ text, frameOffset = 0, fontSize }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = Array.from(text);

  return (
    <span style={{ display: "inline-block" }}>
      {chars.map((c, i) => {
        const p = spring({
          frame: frame - frameOffset - 4 - i * 1.4,
          fps,
          config: { damping: 16, stiffness: 220 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * 24}px) scale(${0.85 + p * 0.15})`,
              whiteSpace: c === " " ? "pre" : "normal",
              fontSize,
            }}
          >
            {c}
          </span>
        );
      })}
    </span>
  );
};

export const Shot4a: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const taglineIn = spring({ frame: frame - 70, fps, config: CINE_IN });
  const splitFade = interpolate(frame, [40, 65], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
        padding: "0 80px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: fraunces,
          fontWeight: 700,
          letterSpacing: -6,
          color: COLORS.white,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          lineHeight: 0.92,
        }}
      >
        <ChromaticSplit amount={6} fade={splitFade}>
          <AnimatedLine text={LINE1} fontSize={152} />
        </ChromaticSplit>
        <ChromaticSplit amount={6} fade={splitFade * 0.8}>
          <AnimatedLine text={LINE2} frameOffset={18} fontSize={184} />
        </ChromaticSplit>
      </div>
      <div
        style={{
          fontFamily: plex,
          fontWeight: 400,
          fontSize: 24,
          letterSpacing: 7,
          color: COLORS.aqua,
          opacity: taglineIn,
          textTransform: "uppercase",
        }}
      >
        Local AI Visibility · Hex by Hex
      </div>
    </AbsoluteFill>
  );
};
