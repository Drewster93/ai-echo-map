import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces } from "../theme";
import { SNAP } from "./easings";

// Full-frame kinetic title card — Lovable 2.0 style stinger between beats.
export const TitleCard: React.FC<{
  words: string[]; // each rendered with stagger
  accent?: string;
  bg?: string;
  fg?: string;
  italicLast?: boolean;
}> = ({
  words,
  accent = COLORS.ultraviolet,
  bg = "#05030d",
  fg = COLORS.white,
  italicLast = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgIn = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const bgOut = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // wipe bar entering from left
  const wipeP = spring({ frame, fps, config: { damping: 18, stiffness: 200 } });
  const wipeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: bg,
        opacity: Math.min(bgIn, bgOut),
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* accent bars */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: 0,
          right: 0,
          height: 6,
          background: accent,
          transformOrigin: "left",
          transform: `scaleX(${wipeP - wipeOut})`,
          boxShadow: `0 0 30px ${accent}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: 0,
          right: 0,
          height: 6,
          background: accent,
          transformOrigin: "right",
          transform: `scaleX(${wipeP - wipeOut})`,
          boxShadow: `0 0 30px ${accent}`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        {words.map((w, i) => {
          const delay = 4 + i * 6;
          const inP = spring({ frame: frame - delay, fps, config: SNAP });
          const outP = interpolate(
            frame,
            [durationInFrames - 10, durationInFrames],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const isLast = i === words.length - 1;
          return (
            <div
              key={i}
              style={{
                fontFamily: fraunces,
                fontWeight: 700,
                fontStyle: italicLast && isLast ? "italic" : "normal",
                fontSize: 220,
                color: fg,
                letterSpacing: -8,
                lineHeight: 0.95,
                opacity: inP * (1 - outP),
                transform: `perspective(1200px) rotateX(${(1 - inP) * -18}deg) translateY(${(1 - inP) * 40}px) scale(${0.9 + inP * 0.1})`,
                filter: `blur(${(1 - inP) * 6}px)`,
                textShadow: `0 0 60px ${accent}66`,
              }}
            >
              {w}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
