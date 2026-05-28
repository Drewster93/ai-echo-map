import { interpolate, useCurrentFrame, Easing } from "remotion";
import { COLORS } from "../theme";

type Stop = { f: number; x: number; y: number };

export const Cursor: React.FC<{ path: Stop[]; label?: string }> = ({
  path,
  label,
}) => {
  const f = useCurrentFrame();
  if (path.length === 0) return null;

  // find segment
  let x = path[0].x;
  let y = path[0].y;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (f >= a.f && f <= b.f) {
      const t = interpolate(f, [a.f, b.f], [0, 1], {
        easing: Easing.bezier(0.65, 0, 0.35, 1),
      });
      x = a.x + (b.x - a.x) * t;
      y = a.y + (b.y - a.y) * t;
      break;
    }
    if (f > b.f) {
      x = b.x;
      y = b.y;
    }
  }

  const lastClick = path.findLast?.((p) => p.f <= f) ?? path[0];
  const clickT = (f - (lastClick?.f ?? 0)) / 8;
  const pulse =
    clickT >= 0 && clickT <= 1
      ? interpolate(clickT, [0, 1], [1, 2.2])
      : 0;
  const pulseO =
    clickT >= 0 && clickT <= 1
      ? interpolate(clickT, [0, 1], [0.7, 0])
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 28,
          height: 28,
          borderRadius: 999,
          transform: `translate(-50%,-50%) scale(${pulse})`,
          background: COLORS.ultraviolet,
          opacity: pulseO,
        }}
      />
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          background: COLORS.white,
          boxShadow: `0 0 24px ${COLORS.ultraviolet}, 0 0 0 3px ${COLORS.ultraviolet}`,
        }}
      />
      {label && (
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 16,
            background: COLORS.ultraviolet,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            padding: "6px 12px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            fontFamily: "system-ui",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
