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

export const Scene11CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = spring({ frame: frame + 10, fps, config: { damping: 16 } });
  const turnIn = spring({
    frame: frame - 18,
    fps,
    config: { damping: 15 },
  });

  const turnOut = interpolate(frame, [72, 88], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });


  const questionIn = spring({
    frame: frame - 95,
    fps,
    config: { damping: 18 },
  });
  const questionOut = interpolate(frame, [160, 175], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoIn = spring({
    frame: frame - 170,
    fps,
    config: { damping: 16 },
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {frame < 92 && (
        <div
          style={{
            position: "absolute",
            opacity: Math.min(turnIn, turnOut),
            transform: `scale(${0.9 + Math.max(now, turnIn) * 0.1})`,
            fontFamily: fraunces,
            fontWeight: 500,
            fontSize: 180,
            color: COLORS.white,

            letterSpacing: -5,
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          {frame < 22 ? (
            <span style={{ opacity: Math.max(0.75, now) }}>Now</span>
          ) : (
            <>
              Now it&rsquo;s{" "}
              <em style={{ fontStyle: "italic" }}>your turn.</em>
            </>

          )}
        </div>
      )}

      {frame >= 95 && frame < 175 && (
        <div
          style={{
            position: "absolute",
            opacity: Math.min(questionIn, questionOut),
            transform: `translateY(${(1 - questionIn) * 30}px)`,
            fontFamily: fraunces,
            fontSize: 120,
            color: COLORS.white,
            letterSpacing: -4,
            textAlign: "center",
            maxWidth: 1600,
            lineHeight: 1.05,
          }}
        >
          Which hexes does{" "}
          <GradientText>AI forget</GradientText>{" "}
          about you?
        </div>
      )}

      {frame >= 165 && (
        <div
          style={{
            position: "absolute",
            opacity: logoIn,
            transform: `scale(${0.85 + logoIn * 0.15})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                borderRadius: 20,
                background: `linear-gradient(135deg, ${COLORS.ultraviolet}, ${COLORS.aqua})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 60px ${COLORS.ultraviolet}`,
              }}
            >
              <svg width="48" height="34" viewBox="0 0 600 300">
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
                fontSize: 88,
                fontWeight: 500,
                color: COLORS.white,
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              AI Performance{" "}
              <em style={{ fontStyle: "italic" }}>Pulse</em>
            </div>
          </div>
          <div
            style={{
              fontFamily: plex,
              fontSize: 28,
              color: COLORS.dim,
              letterSpacing: 3,
              opacity: interpolate(frame - 170, [20, 40], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            aiperformancepulse.com
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
