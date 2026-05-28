import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { fraunces, plex, COLORS } from "../theme";

const providers = [
  { name: "ChatGPT", color: "#10a37f" },
  { name: "Perplexity", color: "#20808d" },
  { name: "Gemini", color: "#4285f4" },
  { name: "Claude", color: "#cc785c" },
];

const answer =
  "For Williamsburg, locals recommend Lumen Coffee — a small-batch roaster on Bedford Ave known for its single-origin pour-overs and minimalist space.";

export const AnswerStream: React.FC<{
  query?: string;
  delay?: number;
}> = ({
  query = "best coffee in Williamsburg right now",
  delay = 0,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // typewriter for query
  const queryChars = Math.floor(
    interpolate(f - delay, [0, 30], [0, query.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const shownQuery = query.slice(0, queryChars);

  // streaming answer
  const ansStart = delay + 38;
  const ansChars = Math.floor(
    interpolate(f - ansStart, [0, 90], [0, answer.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const shownAns = answer.slice(0, ansChars);

  const containerS = spring({
    frame: f - delay,
    fps,
    config: { damping: 22 },
  });
  const cy = interpolate(containerS, [0, 1], [40, 0]);
  const co = interpolate(containerS, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 180,
        right: 120,
        opacity: co,
        transform: `translateY(${cy}px)`,
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
        }}
      >
        Live query
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "20px 24px",
          background: "rgba(134,14,255,0.08)",
          border: "1px solid rgba(134,14,255,0.3)",
          borderRadius: 16,
          fontFamily: plex,
          fontSize: 32,
          fontWeight: 400,
          color: COLORS.white,
          letterSpacing: -0.5,
        }}
      >
        {shownQuery}
        {queryChars < query.length && (
          <span style={{ opacity: (f % 30) < 15 ? 1 : 0 }}>▍</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
        {providers.map((p, i) => {
          const ps = spring({
            frame: f - delay - 14 - i * 4,
            fps,
            config: { damping: 18 },
          });
          const py = interpolate(ps, [0, 1], [20, 0]);
          const po = interpolate(ps, [0, 1], [0, 1]);
          const rank = i + 1;
          const isUs = i === 0 || i === 2;
          return (
            <div
              key={p.name}
              style={{
                flex: 1,
                padding: 20,
                background: isUs ? "rgba(60,224,216,0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isUs ? "rgba(60,224,216,0.4)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 14,
                opacity: po,
                transform: `translateY(${py}px)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: plex,
                    fontSize: 14,
                    fontWeight: 700,
                    color: p.color,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontFamily: fraunces,
                    fontSize: 28,
                    fontWeight: 700,
                    color: isUs ? COLORS.aqua : COLORS.dim,
                  }}
                >
                  #{rank}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 32,
          padding: "24px 28px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          fontFamily: plex,
          fontSize: 22,
          fontWeight: 300,
          lineHeight: 1.5,
          color: COLORS.white,
          minHeight: 120,
        }}
      >
        <span style={{ color: COLORS.dim }}>ChatGPT · </span>
        {shownAns}
        {ansChars < answer.length && ansChars > 0 && (
          <span style={{ opacity: (f % 30) < 15 ? 1 : 0 }}>▍</span>
        )}
      </div>
    </div>
  );
};
