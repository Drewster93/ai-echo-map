import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fraunces, plex, COLORS } from "../theme";
import { ScoreBadge } from "./ScoreBadge";

const queries = [
  { q: "best coffee in Brooklyn", rank: "#1", color: COLORS.aqua },
  { q: "where to get specialty espresso", rank: "#2", color: COLORS.ultraviolet },
  { q: "third wave coffee near me", rank: "#1", color: COLORS.aqua },
  { q: "good wifi cafe Williamsburg", rank: "#4", color: COLORS.orange },
];

export const LocationReportCard: React.FC<{
  name?: string;
  city?: string;
  score?: number;
  delay?: number;
}> = ({
  name = "Lumen Coffee",
  city = "Williamsburg · Brooklyn",
  score = 87,
  delay = 0,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: f - delay,
    fps,
    config: { damping: 18, stiffness: 200, mass: 0.7 },
  });
  const ty = interpolate(s, [0, 1], [80, 0]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 140,
        width: 680,
        background: "rgba(15,8,35,0.92)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(134,14,255,0.3)",
        borderRadius: 24,
        padding: 36,
        opacity,
        transform: `translateY(${ty}px)`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(134,14,255,0.15)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <ScoreBadge score={score} label="Visibility" delay={delay + 8} size={140} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: fraunces,
              fontWeight: 700,
              fontSize: 54,
              color: COLORS.white,
              lineHeight: 1,
              letterSpacing: -1,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: plex,
              fontSize: 18,
              color: COLORS.dim,
              marginTop: 8,
              letterSpacing: 0.5,
            }}
          >
            {city}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(60,224,216,0.15)",
              border: "1px solid rgba(60,224,216,0.4)",
              fontFamily: plex,
              fontSize: 14,
              fontWeight: 500,
              color: COLORS.aqua,
            }}
          >
            ▲ +12 this week
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          fontFamily: plex,
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: COLORS.dim,
        }}
      >
        Top AI queries
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {queries.map((q, i) => {
          const qs = spring({
            frame: f - delay - 24 - i * 6,
            fps,
            config: { damping: 16 },
          });
          const qy = interpolate(qs, [0, 1], [20, 0]);
          const qo = interpolate(qs, [0, 1], [0, 1]);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                opacity: qo,
                transform: `translateY(${qy}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: plex,
                  fontSize: 17,
                  fontWeight: 400,
                  color: COLORS.white,
                }}
              >
                "{q.q}"
              </div>
              <div
                style={{
                  fontFamily: fraunces,
                  fontSize: 22,
                  fontWeight: 700,
                  color: q.color,
                  letterSpacing: -0.5,
                }}
              >
                {q.rank}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
