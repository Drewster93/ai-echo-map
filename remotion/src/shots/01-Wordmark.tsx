import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { fraunces, COLORS } from "../theme";

export const Wordmark: React.FC = () => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const scale = interpolate(enter, [0, 1], [1.15, 1.0]);
  const opacity = enter;
  const underline = interpolate(f, [16, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.85, 0, 0.05, 1),
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div
          style={{
            fontFamily: fraunces,
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: 280,
            color: COLORS.white,
            letterSpacing: -8,
            lineHeight: 1,
            opacity,
            transform: `scale(${scale})`,
          }}
        >
          Pulse
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: -8,
            height: 10,
            width: `${underline * 100}%`,
            background: COLORS.ultraviolet,
            borderRadius: 5,
            boxShadow: `0 0 32px ${COLORS.ultraviolet}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
