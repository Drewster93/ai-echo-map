import { interpolate, useCurrentFrame, Easing } from "remotion";
import { COLORS } from "../theme";

export const Whip: React.FC<{
  direction?: "ltr" | "rtl";
  at?: number;
  duration?: number;
  thickness?: number;
}> = ({ direction = "ltr", at = 0, duration = 6, thickness = 18 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > duration) return null;
  const t = interpolate(f, [0, duration], [0, 1], {
    easing: Easing.bezier(0.85, 0, 0.05, 1),
  });
  const x = direction === "ltr" ? interpolate(t, [0, 1], [-120, 120]) : interpolate(t, [0, 1], [120, -120]);
  const opacity = interpolate(t, [0, 0.4, 1], [0, 1, 0]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${x}%`,
          transform: "translateY(-50%) skewX(-18deg)",
          width: "80%",
          height: thickness,
          background: `linear-gradient(90deg, transparent, ${COLORS.ultraviolet}, transparent)`,
          filter: "blur(2px)",
        }}
      />
    </div>
  );
};
