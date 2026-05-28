import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import { HexGrid } from "../components/HexGrid";
import { MapGlobe } from "../components/MapGlobe";

// Shot 6.1 — Crane-out: hex → city → country → globe → collapses into logo mark.
export const Shot6a: React.FC = () => {
  const frame = useCurrentFrame();

  const hexScale = interpolate(frame, [0, 50], [7.5, 0.4], {
    extrapolateRight: "clamp",
    easing: (v) => 1 - Math.pow(1 - v, 3),
  });
  const hexOp = interpolate(frame, [0, 35, 50], [1, 0.85, 0], {
    extrapolateRight: "clamp",
  });

  const cityOp = interpolate(frame, [10, 26, 70, 88], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cityScale = interpolate(frame, [10, 88], [2.5, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const globeOp = interpolate(frame, [52, 74, 110, 125], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const globeScale = interpolate(frame, [52, 125], [1.8, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoOp = interpolate(frame, [96, 112, 130], [0, 0.45, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [96, 130], [0.35, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoCoreOp = interpolate(frame, [88, 104, 130], [0, 0.35, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* glowing core so early pull-out isn't blank */}
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.aqua}55 0%, ${COLORS.ultraviolet}33 35%, transparent 75%)`,
          opacity: hexOp,
          filter: "blur(10px)",
          transform: `scale(${0.6 + hexScale * 0.15})`,
        }}
      />

      <svg
        width={400}
        height={400}
        style={{
          position: "absolute",
          transform: `scale(${hexScale})`,
          opacity: hexOp,
        }}
        viewBox="0 0 400 400"
      >
        <polygon
          points="200,20 370,120 370,280 200,380 30,280 30,120"
          fill={`${COLORS.aqua}22`}
          stroke={COLORS.aquaBright}
          strokeWidth={3}
          style={{ filter: `drop-shadow(0 0 30px ${COLORS.aquaBright})` }}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          opacity: cityOp,
          transform: `scale(${cityScale})`,
        }}
      >
        <HexGrid
          cols={32}
          rows={18}
          size={26}
          lit={0.5}
          color={COLORS.ultraviolet}
          glowColor={COLORS.aqua}
          width={1400}
          height={900}
          seed={4}
        />
      </div>

      <div
        style={{
          position: "absolute",
          opacity: globeOp,
          transform: `scale(${globeScale})`,
        }}
      >
        <MapGlobe
          width={1600}
          height={800}
          pins={[
            { x: 0.2, y: 0.4, delay: 0, color: COLORS.aquaBright },
            { x: 0.5, y: 0.5, delay: 4, color: COLORS.coral },
            { x: 0.75, y: 0.45, delay: 8, color: COLORS.ultraviolet },
          ]}
          hexLit={0.5}
          hexSeed={8}
        />
      </div>

      <div
        style={{
          position: "absolute",
          opacity: logoOp,
          transform: `scale(${logoScale})`,
          width: 220,
          height: 220,
          borderRadius: 50,
          background: `linear-gradient(135deg, ${COLORS.ultraviolet}, ${COLORS.aquaBright})`,
          boxShadow: `0 0 80px ${COLORS.ultraviolet}, 0 0 160px ${COLORS.aquaBright}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <polygon
            points="60,8 110,36 110,84 60,112 10,84 10,36"
            fill="none"
            stroke="white"
            strokeWidth={6}
          />
          <circle cx="60" cy="60" r="10" fill="white" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
