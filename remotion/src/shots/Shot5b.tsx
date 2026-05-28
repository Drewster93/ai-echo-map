import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { PulseRing } from "../motion/Cinematic";
import { CINE_IN } from "../motion/easings";

// Shot 5.2 — Three competitor pulses ghost around the hex. Ours brightest.
// Caption: "Yours vs. theirs, block by block."
const COMPETITORS = [
  { name: "Compass AI", x: -360, y: -180, color: COLORS.ultraviolet, dim: 0.5 },
  { name: "LocalRank", x: 380, y: -120, color: COLORS.blue, dim: 0.55 },
  { name: "GeoBeacon", x: 240, y: 220, color: COLORS.orange, dim: 0.45 },
];

export const Shot5b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ownerIn = spring({ frame: frame - 4, fps, config: CINE_IN });
  const capIn = spring({ frame: frame - 60, fps, config: CINE_IN });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", width: 1, height: 1 }}>
        {/* our hex pulse — center, brightest */}
        <div
          style={{
            position: "absolute",
            left: -180,
            top: -180,
            opacity: ownerIn,
          }}
        >
          <PulseRing size={360} bpm={72} color={COLORS.aquaBright} beats={3} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: plex,
              fontWeight: 700,
              fontSize: 26,
              color: COLORS.white,
              letterSpacing: 4,
              textShadow: `0 0 20px ${COLORS.aquaBright}`,
            }}
          >
            YOU
          </div>
        </div>

        {COMPETITORS.map((c, i) => {
          const inP = spring({
            frame: frame - 18 - i * 8,
            fps,
            config: CINE_IN,
          });
          return (
            <div
              key={c.name}
              style={{
                position: "absolute",
                left: c.x - 110,
                top: c.y - 110,
                opacity: inP * c.dim,
              }}
            >
              <PulseRing
                size={220}
                bpm={68 - i * 4}
                color={c.color}
                beats={2}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: plex,
                  fontSize: 18,
                  color: COLORS.dim,
                  letterSpacing: 2,
                }}
              >
                {c.name}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 120,
          fontFamily: fraunces,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 50,
          color: COLORS.white,
          opacity: capIn,
          textAlign: "center",
        }}
      >
        Yours vs. theirs — block by block.
      </div>
    </AbsoluteFill>
  );
};
