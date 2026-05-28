import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, grotesk, plex } from "../theme";

const Row: React.FC<{
  label: string;
  value: string;
  color: string;
  pct: number;
  start: number;
}> = ({ label, value, color, pct, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sIn = spring({
    frame: frame - start,
    fps,
    config: { damping: 18 },
  });
  return (
    <div
      style={{
        opacity: sIn,
        transform: `translateY(${(1 - sIn) * 12}px)`,
        padding: "14px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: plex,
          fontSize: 16,
          color: COLORS.white,
        }}
      >
        <span>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}</span>
      </div>
      <div
        style={{
          marginTop: 6,
          height: 5,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${interpolate(
              frame - start,
              [10, 70],
              [0, pct],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
            )}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
};

export const Scene08Drill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hexZoom = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 80 },
  });

  const panelIn = spring({
    frame: frame - 60,
    fps,
    config: { damping: 20 },
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 60,
          opacity: spring({ frame, fps, config: { damping: 18 } }),
          fontFamily: fraunces,
          fontSize: 48,
          color: COLORS.white,
          letterSpacing: -1,
          textAlign: "center",
        }}
      >
        Drill into <em style={{ fontStyle: "italic" }}>one hex.</em>
      </div>

      <div
        style={{
          display: "flex",
          gap: 60,
          alignItems: "center",
          marginTop: 60,
        }}
      >
        {/* zoomed hex */}
        <div
          style={{
            transform: `scale(${0.5 + hexZoom * 0.5})`,
            width: 360,
            height: 360,
            position: "relative",
          }}
        >
          <svg width={360} height={360} viewBox="0 0 360 360">
            {/* outer pulse */}
            {[0, 1, 2].map((i) => {
              const r = 80 + i * 40 + ((frame + i * 30) % 60);
              const op = interpolate(
                (frame + i * 30) % 60,
                [0, 60],
                [0.6, 0],
              );
              return (
                <circle
                  key={i}
                  cx={180}
                  cy={180}
                  r={r}
                  fill="none"
                  stroke={COLORS.aqua}
                  strokeOpacity={op}
                  strokeWidth={1.5}
                />
              );
            })}
            <polygon
              points="180,40 300,110 300,250 180,320 60,250 60,110"
              fill={COLORS.aqua}
              fillOpacity={0.18}
              stroke={COLORS.aqua}
              strokeWidth={2.5}
            />
            <text
              x={180}
              y={170}
              textAnchor="middle"
              fill={COLORS.white}
              fontFamily="system-ui"
              fontSize={14}
              opacity={0.7}
            >
              hex · 8a283470d2dffff
            </text>
            <text
              x={180}
              y={210}
              textAnchor="middle"
              fill={COLORS.aqua}
              fontSize={48}
              fontWeight={700}
              fontFamily="system-ui"
            >
              28%
            </text>
            <text
              x={180}
              y={240}
              textAnchor="middle"
              fill={COLORS.dim}
              fontSize={13}
              fontFamily="system-ui"
            >
              AI mention rate
            </text>
          </svg>
        </div>

        {/* detail panel */}
        <div
          style={{
            width: 520,
            background: "rgba(5,3,13,0.85)",
            border: "1px solid rgba(134,14,255,0.4)",
            borderRadius: 18,
            padding: 28,
            opacity: panelIn,
            transform: `translateX(${(1 - panelIn) * 60}px)`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              fontFamily: plex,
              fontSize: 12,
              color: COLORS.dim,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Location
          </div>
          <div
            style={{
              fontFamily: fraunces,
              fontSize: 32,
              color: COLORS.white,
              fontWeight: 500,
              marginTop: 4,
            }}
          >
            Starbucks · Bangkok Sukhumvit 24
          </div>
          <div
            style={{
              fontFamily: plex,
              fontSize: 14,
              color: COLORS.dim,
              marginTop: 4,
            }}
          >
            13.7322° N · 100.5703° E
          </div>

          <div style={{ marginTop: 22 }}>
            <Row
              label="Mentioned in ChatGPT"
              value="28%"
              pct={28}
              color={COLORS.orange}
              start={70}
            />
            <Row
              label="Mentioned in Perplexity"
              value="41%"
              pct={41}
              color={COLORS.orange}
              start={90}
            />
            <Row
              label="Mentioned in Gemini"
              value="19%"
              pct={19}
              color={COLORS.orange}
              start={110}
            />
            <Row
              label="Mentioned in Claude"
              value="22%"
              pct={22}
              color={COLORS.orange}
              start={130}
            />
          </div>

          <div
            style={{
              marginTop: 22,
              padding: "14px 16px",
              background: "rgba(123,255,255,0.06)",
              border: "1px solid rgba(123,255,255,0.3)",
              borderRadius: 12,
              opacity: interpolate(frame, [180, 220], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                fontFamily: plex,
                fontSize: 12,
                color: COLORS.aqua,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Recommended fix
            </div>
            <div
              style={{
                fontFamily: plex,
                fontSize: 15,
                color: COLORS.white,
                marginTop: 6,
                lineHeight: 1.45,
              }}
            >
              Update local hours · publish 3 Thai-language reviews · add
              menu schema to GBP listing
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              fontFamily: plex,
              fontSize: 13,
              color: COLORS.dim,
              opacity: interpolate(frame, [240, 280], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Competitor mentioned instead:{" "}
            <span style={{ color: COLORS.white }}>Café Amazon · 67%</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
