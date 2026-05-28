import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, grotesk, plex } from "../theme";
import { MapGlobe } from "../components/MapGlobe";

const PINS_YOU = [
  { x: 0.18, y: 0.32, delay: 0 },
  { x: 0.28, y: 0.42, delay: 8 },
  { x: 0.42, y: 0.3, delay: 16 },
  { x: 0.56, y: 0.4, delay: 24 },
  { x: 0.7, y: 0.5, delay: 32 },
];
const PINS_COMP = [
  { x: 0.22, y: 0.35, delay: 0 },
  { x: 0.5, y: 0.32, delay: 12 },
  { x: 0.66, y: 0.48, delay: 24 },
];

const WordLine: React.FC<{ words: string[]; baseStart: number }> = ({
  words,
  baseStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        fontFamily: fraunces,
        fontSize: 84,
        fontWeight: 500,
        color: COLORS.white,
        letterSpacing: -2.5,
        lineHeight: 1.05,
        display: "flex",
        gap: 22,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {words.map((w, i) => {
        const s = spring({
          frame: frame - (baseStart + i * 14),
          fps,
          config: { damping: 16 },
        });
        const isLast = i === words.length - 1;
        return (
          <span
            key={i}
            style={{
              opacity: s,
              transform: `translateY(${(1 - s) * 24}px)`,
              color: isLast ? COLORS.aqua : COLORS.white,
              fontStyle: isLast ? "italic" : "normal",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Scene09Edge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sIn = spring({ frame, fps, config: { damping: 20 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          gap: 40,
          opacity: sIn,
          marginBottom: 40,
        }}
      >
        {/* yours */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontFamily: plex,
              fontSize: 14,
              color: COLORS.aqua,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Your brand
          </div>
          <MapGlobe
            width={720}
            height={420}
            pins={PINS_YOU.map((p) => ({
              ...p,
              color: COLORS.aqua,
              delay: 20 + p.delay,
            }))}
            hexLit={0.55}
            hexSeed={11}
          />
        </div>
        {/* competitor */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontFamily: plex,
              fontSize: 14,
              color: COLORS.dim,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Competitor
          </div>
          <div style={{ opacity: 0.45, filter: "grayscale(0.4)" }}>
            <MapGlobe
              width={720}
              height={420}
              pins={PINS_COMP.map((p) => ({
                ...p,
                color: COLORS.dim,
                delay: 20 + p.delay,
              }))}
              hexLit={0.22}
              hexSeed={17}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <WordLine
          words={["See", "·", "Fix", "·", "Win the hex."]}
          baseStart={80}
        />
      </div>
    </AbsoluteFill>
  );
};
