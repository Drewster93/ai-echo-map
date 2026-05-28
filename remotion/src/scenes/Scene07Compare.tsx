import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, grotesk, plex } from "../theme";
import { MapGlobe } from "../components/MapGlobe";

const HalfGlobe: React.FC<{
  title: string;
  pct: number;
  color: string;
  pins: { x: number; y: number; delay: number }[];
  side: "left" | "right";
  startFrame: number;
}> = ({ title, pct, color, pins, side, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slideIn = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20 },
  });
  const offset = (1 - slideIn) * (side === "left" ? -200 : 200);
  return (
    <div
      style={{
        opacity: slideIn,
        transform: `translateX(${offset}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: plex,
          fontSize: 18,
          color: COLORS.dim,
          letterSpacing: 4,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: grotesk,
          fontWeight: 700,
          fontSize: 110,
          color,
          letterSpacing: -4,
          lineHeight: 1,
          marginBottom: 18,
        }}
      >
        {pct}
        <span style={{ fontSize: 56 }}>%</span>
      </div>
      <MapGlobe
        width={720}
        height={540}
        hexLit={pct / 100}
        pins={pins.map((p) => ({ ...p, color, delay: p.delay + startFrame }))}
        hexSeed={side === "left" ? 5 : 9}
      />
    </div>
  );
};

export const Scene07Compare: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 60,
          opacity: titleIn,
          fontFamily: fraunces,
          fontSize: 56,
          color: COLORS.white,
          letterSpacing: -1.5,
          textAlign: "center",
        }}
      >
        Spot the regions <em style={{ fontStyle: "italic" }}>AI forgot.</em>
      </div>
      <div
        style={{
          display: "flex",
          gap: 80,
          marginTop: 80,
          alignItems: "flex-start",
        }}
      >
        <HalfGlobe
          title="North America"
          pct={87}
          color={COLORS.aqua}
          pins={[
            { x: 0.3, y: 0.4, delay: 10 },
            { x: 0.45, y: 0.5, delay: 18 },
            { x: 0.6, y: 0.35, delay: 26 },
            { x: 0.7, y: 0.55, delay: 34 },
          ]}
          side="left"
          startFrame={20}
        />
        <HalfGlobe
          title="SE Asia"
          pct={12}
          color={COLORS.orange}
          pins={[
            { x: 0.4, y: 0.5, delay: 30 },
            { x: 0.55, y: 0.6, delay: 42 },
          ]}
          side="right"
          startFrame={40}
        />
      </div>
    </AbsoluteFill>
  );
};
