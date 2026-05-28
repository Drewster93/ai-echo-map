import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { KineticLine } from "../motion/Cinematic";
import { CINE_IN } from "../motion/easings";

// Shot 3.2 — Three stacked lines whip in. BRAND-LEVEL struck through coral.
// → LOCATION-LEVEL aqua overshoot. Tagline.
export const Shot3b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const taglineIn = spring({ frame: frame - 60, fps, config: CINE_IN });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 36,
      }}
    >
      <KineticLine
        align="center"
        lines={[
          { text: "BRAND-LEVEL", color: COLORS.dim, strike: true, delay: 4, size: 150 },
          { text: "→ LOCATION-LEVEL.", color: COLORS.aquaBright, delay: 28, size: 160 },
        ]}
      />
      <div
        style={{
          fontFamily: fraunces,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 44,
          color: COLORS.white,
          opacity: taglineIn,
          transform: `translateY(${(1 - taglineIn) * 18}px)`,
          marginTop: 24,
          textAlign: "center",
        }}
      >
        Where AI actually sends your customers.
      </div>
    </AbsoluteFill>
  );
};
