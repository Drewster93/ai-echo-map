import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { GradientText } from "../components/GradientText";

export const Scene01Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const todayIn = spring({ frame, fps, config: { damping: 18 } });
  const todayOut = interpolate(frame, [40, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const todayOpacity = Math.min(todayIn, todayOut);

  const line1In = spring({
    frame: frame - 60,
    fps,
    config: { damping: 18 },
  });
  const line2In = spring({
    frame: frame - 110,
    fps,
    config: { damping: 18 },
  });
  const placesPulse = 1 + Math.sin((frame - 130) / 7) * 0.04;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {frame < 70 && (
        <div
          style={{
            opacity: todayOpacity,
            transform: `scale(${0.92 + todayIn * 0.08})`,
            fontFamily: fraunces,
            fontSize: 220,
            fontWeight: 500,
            color: COLORS.white,
            letterSpacing: -6,
          }}
        >
          Today
        </div>
      )}
      {frame >= 60 && (
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: line1In,
            transform: `translateY(${(1 - line1In) * 30}px)`,
          }}
        >
          <div
            style={{
              fontFamily: fraunces,
              fontSize: 96,
              fontWeight: 500,
              color: COLORS.white,
              letterSpacing: -3,
              lineHeight: 1.05,
              maxWidth: 1500,
              margin: "0 auto",
            }}
          >
            Brands optimize for AI visibility{" "}
            <em
              style={{
                fontStyle: "italic",
                color: COLORS.dim,
                fontWeight: 500,
              }}
            >
              at the brand level.
            </em>
          </div>
        </div>
      )}
      {frame >= 110 && (
        <div
          style={{
            position: "absolute",
            bottom: "22%",
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: line2In,
            transform: `translateY(${(1 - line2In) * 24}px)`,
          }}
        >
          <div
            style={{
              fontFamily: plex,
              fontSize: 44,
              color: COLORS.white,
              letterSpacing: -0.5,
            }}
          >
            But AI doesn&rsquo;t recommend brands. It recommends{" "}
            <span style={{ display: "inline-block", transform: `scale(${placesPulse})` }}>
              <GradientText
                style={{ fontFamily: fraunces, fontStyle: "italic" }}
              >
                places.
              </GradientText>
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
