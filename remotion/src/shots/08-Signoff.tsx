import { AbsoluteFill, interpolate, useCurrentFrame, Easing, spring, useVideoConfig } from "remotion";
import { fraunces, plex, COLORS } from "../theme";

export const Signoff: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 14 } });
  const scale = interpolate(s, [0, 1], [1.1, 1]);
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const tagS = spring({ frame: f - 18, fps, config: { damping: 18 } });
  const tagO = interpolate(tagS, [0, 1], [0, 1]);
  const tagY = interpolate(tagS, [0, 1], [16, 0]);

  const pillS = spring({ frame: f - 32, fps, config: { damping: 14 } });
  const pillO = interpolate(pillS, [0, 1], [0, 1]);
  const pillScale = interpolate(pillS, [0, 1], [0.8, 1]);

  const fade = interpolate(f, [90, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        alignItems: "center",
        justifyContent: "center",
        opacity: fade,
      }}
    >
      <div style={{ opacity, transform: `scale(${scale})`, textAlign: "center" }}>
        <div
          style={{
            fontFamily: fraunces,
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: 240,
            color: COLORS.white,
            letterSpacing: -8,
            lineHeight: 1,
          }}
        >
          Pulse
        </div>
        <div
          style={{
            margin: "20px auto 0",
            height: 6,
            width: 240,
            background: COLORS.ultraviolet,
            borderRadius: 3,
            boxShadow: `0 0 32px ${COLORS.ultraviolet}`,
          }}
        />
      </div>

      <div
        style={{
          marginTop: 36,
          fontFamily: plex,
          fontSize: 28,
          fontWeight: 300,
          color: COLORS.dim,
          letterSpacing: 1,
          textAlign: "center",
          opacity: tagO,
          transform: `translateY(${tagY}px)`,
        }}
      >
        See where AI sends your customers.
      </div>

      <div
        style={{
          marginTop: 40,
          padding: "14px 28px",
          background: COLORS.ultraviolet,
          borderRadius: 999,
          fontFamily: plex,
          fontSize: 16,
          fontWeight: 700,
          color: COLORS.white,
          letterSpacing: 2,
          textTransform: "uppercase",
          boxShadow: `0 12px 40px ${COLORS.ultraviolet}66`,
          opacity: pillO,
          transform: `scale(${pillScale})`,
        }}
      >
        Available now
      </div>
    </AbsoluteFill>
  );
};
