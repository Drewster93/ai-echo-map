import { interpolate, useCurrentFrame, spring, useVideoConfig, Easing } from "remotion";
import { fraunces, plex, COLORS } from "../theme";

const data = [
  { name: "Lumen Coffee", score: 87, color: COLORS.ultraviolet, you: true },
  { name: "Devoción", score: 72, color: "rgba(255,255,255,0.4)" },
  { name: "Sey Coffee", score: 64, color: "rgba(255,255,255,0.4)" },
  { name: "Variety", score: 58, color: "rgba(255,255,255,0.4)" },
  { name: "Toby's Estate", score: 51, color: "rgba(255,255,255,0.4)" },
  { name: "Partners", score: 44, color: "rgba(255,255,255,0.4)" },
  { name: "Café Grumpy", score: 38, color: "rgba(255,255,255,0.4)" },
];

export const CompetitorBars: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxW = 1080;
  const max = 100;

  return (
    <div
      style={{
        position: "absolute",
        left: 160,
        top: 200,
        right: 160,
      }}
    >
      <div
        style={{
          fontFamily: plex,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: COLORS.dim,
          marginBottom: 32,
        }}
      >
        AI Visibility · Williamsburg · Coffee
      </div>

      {data.map((d, i) => {
        const start = delay + i * 5;
        const w = interpolate(f - start, [0, 30], [0, (d.score / max) * maxW], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.65, 0, 0.35, 1),
        });
        const s = spring({ frame: f - start, fps, config: { damping: 20 } });
        const o = interpolate(s, [0, 1], [0, 1]);
        const val = Math.round(interpolate(f - start, [0, 30], [0, d.score], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }));
        return (
          <div
            key={d.name}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 18,
              opacity: o,
            }}
          >
            <div
              style={{
                width: 240,
                fontFamily: plex,
                fontSize: 22,
                fontWeight: d.you ? 700 : 400,
                color: d.you ? COLORS.white : COLORS.dim,
                paddingRight: 16,
                textAlign: "right",
              }}
            >
              {d.name}
            </div>
            <div
              style={{
                flex: 1,
                height: d.you ? 44 : 32,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 6,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: w,
                  background: d.you
                    ? `linear-gradient(90deg, ${COLORS.ultraviolet}, ${COLORS.aqua})`
                    : d.color,
                  borderRadius: 6,
                  boxShadow: d.you ? `0 0 32px ${COLORS.ultraviolet}` : "none",
                }}
              />
            </div>
            <div
              style={{
                width: 80,
                fontFamily: fraunces,
                fontSize: d.you ? 32 : 24,
                fontWeight: 700,
                color: d.you ? COLORS.aqua : COLORS.dim,
                paddingLeft: 20,
                textAlign: "right",
              }}
            >
              {val}
            </div>
          </div>
        );
      })}
    </div>
  );
};
