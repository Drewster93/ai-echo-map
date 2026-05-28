import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { MapGlobe } from "../components/MapGlobe";

const BRANDS = [
  { name: "Starbucks", x: 0.18, y: 0.32, color: COLORS.aqua, delay: 0 },
  { name: "McDonald's", x: 0.5, y: 0.28, color: COLORS.orange, delay: 18 },
  { name: "Sephora", x: 0.62, y: 0.42, color: "#ff5bdc", delay: 36 },
  { name: "Decathlon", x: 0.74, y: 0.5, color: COLORS.green, delay: 54 },
  { name: "IKEA", x: 0.48, y: 0.2, color: COLORS.blue, delay: 72 },
  { name: "H&M", x: 0.45, y: 0.36, color: COLORS.ultraviolet, delay: 90 },
];

export const Scene05Coverage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 80,
          opacity: titleIn,
          fontFamily: fraunces,
          fontSize: 56,
          color: COLORS.white,
          letterSpacing: -1.5,
        }}
      >
        Brands lighting up <em style={{ fontStyle: "italic" }}>worldwide</em>
      </div>
      <div style={{ marginTop: 60 }}>
        <MapGlobe
          width={1600}
          height={800}
          hexLit={interpolate(frame, [20, 150], [0.2, 0.55], {
            extrapolateRight: "clamp",
          })}
          pins={BRANDS.map((b) => ({
            x: b.x,
            y: b.y,
            delay: 30 + b.delay,
            color: b.color,
            label: b.name,
          }))}
        />
      </div>
    </AbsoluteFill>
  );
};
