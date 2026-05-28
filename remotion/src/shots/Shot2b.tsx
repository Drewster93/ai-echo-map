import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { CINE_IN, OVERSHOOT, whip } from "../motion/easings";

// Pre-rolled deterministic tile set
const SCORES = [12, 94, 3, 71, 22, 8, 88, 41, 17, 5, 63, 29, 11, 91, 7, 38, 4, 56, 19, 82, 14, 25, 9, 47, 35, 6, 78, 31, 13, 50];
const TILES = Array.from({ length: 12 * 8 }).map((_, i) => {
  const s = SCORES[i % SCORES.length];
  return {
    s,
    red: s < 35,
  };
});

// Shot 2.2 — Whip-pan shatter into 200+ tiles, mostly red. Stinger "THE AVERAGE LIED."
export const Shot2b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // tiles cascade in
  const cols = 12;
  const rows = 8;
  const gap = 8;
  const tileW = 130;
  const tileH = 100;
  const gridW = cols * tileW + (cols - 1) * gap;
  const gridH = rows * tileH + (rows - 1) * gap;

  const stingerIn = spring({ frame: frame - 70, fps, config: OVERSHOOT });
  const stingerOut = interpolate(frame, [110, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stingerOp = stingerIn * (1 - stingerOut);

  const flashShake =
    Math.sin(frame / 2.2) * Math.max(0, 1 - frame / 25) * 8;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        transform: `translateX(${flashShake}px)`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: gridW,
          height: gridH,
        }}
      >
        {TILES.map((t, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          // wave-in by diagonal index
          const diag = r + c;
          const delay = 4 + diag * 1.6;
          const p = spring({
            frame: frame - delay,
            fps,
            config: { damping: 14, stiffness: 200 },
          });
          const x = c * (tileW + gap);
          const y = r * (tileH + gap);
          const color = t.red
            ? COLORS.coral
            : t.s > 70
              ? COLORS.aqua
              : COLORS.ultraviolet;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: tileW,
                height: tileH,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                border: `1px solid ${color}`,
                boxShadow: `0 0 18px ${color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: plex,
                fontWeight: 700,
                fontSize: 32,
                color: COLORS.white,
                opacity: p,
                transform: `scale(${0.4 + p * 0.6}) rotate(${(1 - p) * (i % 2 ? 6 : -6)}deg)`,
              }}
            >
              {t.s}%
            </div>
          );
        })}
      </div>
      {/* stinger card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: stingerOp,
        }}
      >
        <div
          style={{
            padding: "26px 60px",
            background: COLORS.coral,
            color: "#000",
            fontFamily: fraunces,
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: 110,
            letterSpacing: -4,
            transform: `skewX(-6deg) scale(${0.9 + stingerIn * 0.1})`,
            boxShadow: `0 24px 80px ${COLORS.coral}88, 0 0 60px ${COLORS.coral}`,
          }}
        >
          THE AVERAGE LIED.
        </div>
      </div>
    </AbsoluteFill>
  );
};
