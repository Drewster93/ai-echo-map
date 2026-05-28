import { interpolate, useCurrentFrame, Easing } from "remotion";
import { fraunces, COLORS } from "../theme";

export const HeroType: React.FC<{
  text: string;
  size?: number;
  weight?: 500 | 700;
  color?: string;
  align?: "center" | "left";
  hold?: number;
  inFrames?: number;
  outFrames?: number;
  underline?: boolean;
  italic?: boolean;
  letterSpacing?: number;
}> = ({
  text,
  size = 220,
  weight = 700,
  color = COLORS.white,
  align = "center",
  hold = 18,
  inFrames = 12,
  outFrames = 8,
  underline = false,
  italic = false,
  letterSpacing = -4,
}) => {
  const f = useCurrentFrame();
  const total = inFrames + hold + outFrames;

  const enter = interpolate(f, [0, inFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const exit = interpolate(f, [inFrames + hold, total], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  const opacity = Math.min(enter, exit);
  const scale = interpolate(enter, [0, 1], [1.06, 1.0]);

  const underlineW = interpolate(f, [inFrames, inFrames + 18], [0, 100], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.85, 0, 0.05, 1),
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        justifyContent: "center",
        paddingLeft: align === "left" ? 120 : 0,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: fraunces,
          fontWeight: weight,
          fontStyle: italic ? "italic" : "normal",
          fontSize: size,
          lineHeight: 0.92,
          color,
          letterSpacing,
          transform: `scale(${scale})`,
          textAlign: align,
          textShadow: "0 4px 40px rgba(0,0,0,0.6)",
        }}
      >
        {text}
      </div>
      {underline && (
        <div
          style={{
            marginTop: 28,
            height: 8,
            width: `${underlineW * 0.6}%`,
            background: COLORS.ultraviolet,
            borderRadius: 4,
            boxShadow: `0 0 32px ${COLORS.ultraviolet}`,
          }}
        />
      )}
    </div>
  );
};
