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

// Shot 4.1 — Product wordmark assembles letter-by-letter with chromatic split.
const TITLE = "AI Performance Pulse";

export const Shot4a: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = Array.from(TITLE);
  const taglineIn = spring({ frame: frame - 70, fps, config: CINE_IN });

  // chromatic fade: starts split, settles by frame 50
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
        gap: 30,
      }}
    >
      <div
        style={{
          fontFamily: fraunces,
          fontWeight: 700,
          fontSize: 180,
          letterSpacing: -8,
          color: COLORS.white,
          display: "flex",
        }}
      >
        <ChromaticSplit amount={6} fade={splitFade}>
          <span style={{ display: "inline-block" }}>
            {chars.map((c, i) => {
              const p = spring({
                frame: frame - 4 - i * 1.4,
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
                  }}
                >
                  {c}
                </span>
              );
            })}
          </span>
        </ChromaticSplit>
      </div>
      <div
        style={{
          fontFamily: plex,
          fontWeight: 400,
          fontSize: 26,
          letterSpacing: 8,
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
