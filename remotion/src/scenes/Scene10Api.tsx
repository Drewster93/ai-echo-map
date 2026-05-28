import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { GradientText } from "../components/GradientText";

const CODE_LINES = [
  { t: "// Wire AI visibility into your stack", c: COLORS.dim },
  { t: "const res = await fetch(", c: COLORS.white },
  { t: "  '/api/public/brand-coverage'", c: COLORS.aqua },
  { t: "  + '?brand=Starbucks&scope=global'", c: COLORS.aqua },
  { t: ");", c: COLORS.white },
  { t: "", c: COLORS.white },
  { t: "const data = await res.json();", c: COLORS.white },
  { t: "", c: COLORS.white },
  { t: "// → { region: 'NA', kept: 412, ... }", c: COLORS.green },
  { t: "// → { region: 'SEA', kept: 38, ... }", c: COLORS.green },
];

export const Scene10Api: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const introIn = spring({ frame, fps, config: { damping: 18 } });
  const introOut = interpolate(frame, [50, 70], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const introOp = Math.min(introIn, introOut);

  const titleIn = spring({
    frame: frame - 60,
    fps,
    config: { damping: 16 },
  });

  const editorIn = spring({
    frame: frame - 110,
    fps,
    config: { damping: 18 },
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {frame < 80 && (
        <div
          style={{
            position: "absolute",
            opacity: introOp,
            fontFamily: fraunces,
            fontSize: 110,
            color: COLORS.white,
            letterSpacing: -3,
          }}
        >
          Introducing
        </div>
      )}
      {frame >= 60 && (
        <div
          style={{
            position: "absolute",
            top: 220,
            opacity: titleIn,
            transform: `scale(${0.9 + titleIn * 0.1})`,
            fontFamily: fraunces,
            fontStyle: "italic",
            fontSize: 140,
            letterSpacing: -4,
          }}
        >
          <GradientText>/coverage API</GradientText>
        </div>
      )}
      {frame >= 100 && (
        <div
          style={{
            position: "absolute",
            top: 440,
            opacity: editorIn,
            transform: `translateY(${(1 - editorIn) * 30}px)`,
            width: 1100,
            background: "#0b0716",
            border: "1px solid rgba(134,14,255,0.4)",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ff5b5b",
              }}
            />
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ffbf3a",
              }}
            />
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#3aff7a",
              }}
            />
            <span
              style={{
                marginLeft: 16,
                fontFamily: "monospace",
                fontSize: 13,
                color: COLORS.dim,
              }}
            >
              coverage.ts
            </span>
          </div>
          <div
            style={{
              padding: "22px 28px",
              fontFamily: "monospace",
              fontSize: 22,
              lineHeight: 1.55,
            }}
          >
            {CODE_LINES.map((line, i) => {
              const start = 120 + i * 9;
              const op = interpolate(frame, [start, start + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={i}
                  style={{
                    opacity: op,
                    color: line.c,
                    transform: `translateX(${(1 - op) * 12}px)`,
                  }}
                >
                  {line.t || "\u00A0"}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          fontFamily: plex,
          fontSize: 22,
          color: COLORS.dim,
          opacity: interpolate(frame, [210, 235], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Wire location-level AI visibility into your stack.
      </div>
    </AbsoluteFill>
  );
};
