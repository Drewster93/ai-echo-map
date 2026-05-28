import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces } from "../theme";
import { GradientText } from "../components/GradientText";

export const Scene02Meet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meetIn = spring({ frame, fps, config: { damping: 18 } });
  const meetOut = interpolate(frame, [40, 55], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const meetOp = Math.min(meetIn, meetOut);

  const logoIn = spring({
    frame: frame - 50,
    fps,
    config: { damping: 14, stiffness: 110 },
  });
  const arcsScale = 0.6 + spring({ frame, fps, config: { damping: 22 } }) * 0.6;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* converging arcs */}
      <svg
        width={1200}
        height={400}
        viewBox="0 0 1200 400"
        style={{
          position: "absolute",
          opacity: 0.5,
          transform: `scale(${arcsScale})`,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const r = 120 + i * 70;
          return (
            <path
              key={i}
              d={`M ${600 - r} 380 Q 600 ${380 - r * 1.3} ${600 + r} 380`}
              stroke={i % 2 ? COLORS.aqua : COLORS.ultraviolet}
              strokeOpacity={0.7 - i * 0.1}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {frame < 60 && (
        <div
          style={{
            position: "absolute",
            fontFamily: fraunces,
            fontSize: 180,
            fontWeight: 500,
            color: COLORS.white,
            opacity: meetOp,
            transform: `scale(${0.9 + meetIn * 0.1})`,
            letterSpacing: -5,
          }}
        >
          Meet
        </div>
      )}
      {frame >= 50 && (
        <div
          style={{
            position: "absolute",
            opacity: logoIn,
            transform: `scale(${0.85 + logoIn * 0.15})`,
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 22,
              background: `linear-gradient(135deg, ${COLORS.ultraviolet}, ${COLORS.aqua})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 60px ${COLORS.ultraviolet}`,
            }}
          >
            <svg width="56" height="38" viewBox="0 0 600 300">
              {[0, 1, 2, 3].map((i) => (
                <path
                  key={i}
                  d={`M ${20 + i * 40} 280 Q 300 ${-40 + i * 50} ${580 - i * 40} 280`}
                  stroke="white"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  opacity={1 - i * 0.22}
                />
              ))}
            </svg>
          </div>
          <div
            style={{
              fontFamily: fraunces,
              fontSize: 110,
              fontWeight: 500,
              letterSpacing: -3,
              color: COLORS.white,
              lineHeight: 1,
            }}
          >
            <div>
              <GradientText>AI</GradientText> Performance
            </div>
            <div style={{ fontStyle: "italic" }}>Pulse</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
