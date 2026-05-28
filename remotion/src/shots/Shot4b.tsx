import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { ProductFrame } from "../components/ProductFrame";
import { HexGrid } from "../components/HexGrid";
import { OdometerCounter } from "../motion/Cinematic";
import { CINE_IN, PANEL } from "../motion/easings";

const QUERY = "best italian restaurant near me";

// Shot 4.2 — Live UI fly-through: sidebar, topbar, globe, cursor typing query, hex bloom, KPI counts.
export const Shot4b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Choreography (frames within this shot, total 230)
  const frameIn = spring({ frame, fps, config: { damping: 18, stiffness: 140 } });
  const sidebar = spring({ frame: frame - 6, fps, config: PANEL });
  const topbar = spring({ frame: frame - 16, fps, config: PANEL });
  const search = spring({ frame: frame - 28, fps, config: PANEL });

  // type query 36..78
  const typeP = interpolate(frame, [36, 86], [0, QUERY.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const typed = QUERY.slice(0, Math.floor(typeP));
  const cursor = Math.floor(frame / 6) % 2 === 0;

  // map bloom 90..150
  const bloom = spring({ frame: frame - 90, fps, config: { damping: 12, stiffness: 100 } });
  const litLevel = 0.15 + bloom * 0.55;

  // KPI cards in 110..
  const kpis = [
    { label: "Hexes scanned", to: 1842, suffix: "" },
    { label: "Mention rate", to: 41, suffix: "%" },
    { label: "Blind spots", to: 217, suffix: "" },
  ];

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${0.92 + frameIn * 0.08})`,
      }}
    >
      <div
        style={{
          width: 1700,
          height: 920,
          background: COLORS.bg,
          borderRadius: 22,
          overflow: "hidden",
          border: `1px solid ${COLORS.ultraviolet}88`,
          boxShadow: `0 50px 140px rgba(0,0,0,0.7), 0 0 80px ${COLORS.ultraviolet}55`,
          display: "flex",
          position: "relative",
        }}
      >
        {/* sidebar */}
        <div
          style={{
            width: 72,
            background: COLORS.plum,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 24,
            gap: 20,
            transform: `translateX(${(1 - sidebar) * -72}px)`,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${COLORS.ultraviolet}, ${COLORS.aqua})`,
            }}
          />
          {["map", "list", "data", "set"].map((k, i) => (
            <div
              key={k}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background:
                  i === 0
                    ? `${COLORS.ultraviolet}66`
                    : "rgba(255,255,255,0.08)",
              }}
            />
          ))}
        </div>

        {/* main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* topbar */}
          <div
            style={{
              height: 64,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              gap: 16,
              background: "rgba(38,14,90,0.4)",
              transform: `translateY(${(1 - topbar) * -64}px)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: COLORS.aqua,
                  boxShadow: `0 0 12px ${COLORS.aqua}`,
                }}
              />
              <span
                style={{
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: plex,
                }}
              >
                Bella Cucina · NYC
              </span>
            </div>
            <div style={{ flex: 1 }} />
            {/* search bar typing */}
            <div
              style={{
                width: 560,
                padding: "10px 18px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${COLORS.aqua}66`,
                color: "white",
                fontFamily: plex,
                fontSize: 16,
                opacity: search,
                transform: `translateY(${(1 - search) * -10}px)`,
                boxShadow: `0 0 24px ${COLORS.aqua}33`,
              }}
            >
              <span style={{ color: COLORS.dim }}>Ask AI: </span>
              {typed}
              {cursor && (
                <span style={{ color: COLORS.aqua, marginLeft: 2 }}>|</span>
              )}
            </div>
          </div>

          {/* canvas */}
          <div
            style={{
              flex: 1,
              display: "flex",
              position: "relative",
              background: `radial-gradient(ellipse at 40% 40%, ${COLORS.plum}88 0%, ${COLORS.bg} 70%)`,
            }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.5 + bloom * 0.5 }}>
                <HexGrid
                  cols={36}
                  rows={16}
                  size={28}
                  lit={litLevel}
                  color={COLORS.ultraviolet}
                  glowColor={COLORS.aqua}
                  width={1100}
                  height={780}
                  seed={3}
                />
              </div>
              {/* coral blind-spot cluster */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: bloom * 0.85,
                }}
              >
                <HexGrid
                  cols={36}
                  rows={16}
                  size={28}
                  lit={0.18}
                  color={COLORS.coral}
                  glowColor={COLORS.coral}
                  width={1100}
                  height={780}
                  seed={11}
                />
              </div>
            </div>

            {/* KPI side panel */}
            <div
              style={{
                width: 360,
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(5,3,13,0.85)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {kpis.map((k, i) => {
                const delay = 110 + i * 10;
                const op = spring({ frame: frame - delay, fps, config: PANEL });
                return (
                  <div
                    key={i}
                    style={{
                      padding: 20,
                      borderRadius: 14,
                      background: `linear-gradient(135deg, ${COLORS.plum}aa, rgba(5,3,13,0.6))`,
                      border: `1px solid ${COLORS.ultraviolet}55`,
                      opacity: op,
                      transform: `translateX(${(1 - op) * 40}px)`,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: plex,
                        fontSize: 13,
                        color: COLORS.dim,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                      }}
                    >
                      {k.label}
                    </div>
                    <div
                      style={{
                        fontFamily: fraunces,
                        fontWeight: 700,
                        fontSize: 64,
                        color: i === 2 ? COLORS.coral : COLORS.white,
                        lineHeight: 1,
                        marginTop: 8,
                      }}
                    >
                      <OdometerCounter
                        to={k.to}
                        duration={36}
                        suffix={k.suffix}
                        delay={delay}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* cursor */}
            {frame > 22 && frame < 120 && (
              <div
                style={{
                  position: "absolute",
                  left: interpolate(frame, [22, 36, 90], [900, 1100, 700], {
                    extrapolateRight: "clamp",
                  }),
                  top: interpolate(frame, [22, 36, 90], [-10, 18, 380], {
                    extrapolateRight: "clamp",
                  }),
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <path
                    d="M3 2 L3 20 L8 15 L11 22 L14 21 L11 14 L18 14 Z"
                    fill="white"
                    stroke="black"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
