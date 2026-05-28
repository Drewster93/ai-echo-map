import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, grotesk, plex } from "../theme";
import { ProductFrame } from "../components/ProductFrame";
import { MapGlobe } from "../components/MapGlobe";

// Pre-rendered hexes igniting across the map as a brand is queried.
const QUERY_PINS = [
  { x: 0.18, y: 0.3, color: COLORS.aqua, delay: 0 },
  { x: 0.22, y: 0.38, color: COLORS.aqua, delay: 6 },
  { x: 0.46, y: 0.26, color: COLORS.aqua, delay: 12 },
  { x: 0.52, y: 0.32, color: COLORS.aqua, delay: 18 },
  { x: 0.66, y: 0.42, color: COLORS.orange, delay: 28 },
  { x: 0.74, y: 0.48, color: COLORS.orange, delay: 36 },
  { x: 0.36, y: 0.6, color: COLORS.aqua, delay: 50 },
  { x: 0.8, y: 0.62, color: COLORS.orange, delay: 64 },
];

const Typewriter: React.FC<{
  text: string;
  start: number;
  cps?: number;
  style?: React.CSSProperties;
}> = ({ text, start, cps = 14, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - start) / fps;
  const n = Math.min(text.length, Math.floor(elapsed * cps));
  return <span style={style}>{text.slice(0, n)}</span>;
};

export const Scene06Query: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (0..90): black input rectangle, type "Starbucks", click Go
  // Phase 2 (90..300): rectangle expands to product UI, hexes ignite, side panel slides in
  const phase = frame < 100 ? 1 : 2;

  // Rectangle morph
  const morph = spring({
    frame: frame - 90,
    fps,
    config: { damping: 22, stiffness: 90 },
  });
  const rectW = interpolate(morph, [0, 1], [780, 1600]);
  const rectH = interpolate(morph, [0, 1], [120, 900]);
  const rectR = interpolate(morph, [0, 1], [22, 18]);

  // Cursor positions
  const cursorPhase1 = { x: 700, y: 60 }; // hovering near Go button
  const goClick = frame >= 80 && frame < 95;

  const panelIn = spring({
    frame: frame - 160,
    fps,
    config: { damping: 18 },
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: rectW,
          height: rectH,
          borderRadius: rectR,
          background: COLORS.bg,
          border: "1px solid rgba(134,14,255,0.45)",
          boxShadow:
            "0 0 80px rgba(134,14,255,0.35), 0 30px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
          position: "relative",
          transition: "none",
        }}
      >
        {phase === 1 ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              padding: "0 28px",
              gap: 16,
            }}
          >
            <div
              style={{
                fontFamily: plex,
                fontSize: 28,
                color: COLORS.white,
                flex: 1,
                letterSpacing: -0.5,
              }}
            >
              <Typewriter
                text="Where does AI mention Starbucks?"
                start={6}
                cps={18}
              />
              <span
                style={{
                  display: "inline-block",
                  marginLeft: 4,
                  width: 2,
                  height: 28,
                  background: COLORS.aqua,
                  verticalAlign: "middle",
                  opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0,
                }}
              />
            </div>
            <div
              style={{
                padding: "14px 28px",
                borderRadius: 12,
                background: goClick
                  ? COLORS.white
                  : `linear-gradient(135deg, ${COLORS.ultraviolet}, ${COLORS.aqua})`,
                color: goClick ? COLORS.bg : COLORS.white,
                fontFamily: plex,
                fontWeight: 700,
                fontSize: 22,
                transform: goClick ? "scale(0.94)" : "scale(1)",
              }}
            >
              Pulse →
            </div>
            {/* cursor */}
            <div
              style={{
                position: "absolute",
                right: cursorPhase1.x - 600,
                top: cursorPhase1.y,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M3 2 L3 20 L8 15 L11 22 L14 21 L11 14 L18 14 Z"
                  fill="white"
                  stroke="black"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: 1600,
              height: 900,
              display: "flex",
              flexDirection: "column",
              opacity: morph,
            }}
          >
            <ProductFrame
              width={1600}
              height={900}
              brand="Starbucks"
              sidebar={
                panelIn > 0.04 ? (
                  <div
                    style={{
                      opacity: panelIn,
                      transform: `translateX(${(1 - panelIn) * 60}px)`,
                    }}
                  >

                  <div
                    style={{
                      fontFamily: plex,
                      fontSize: 13,
                      color: COLORS.dim,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    AI mention rate
                  </div>
                  <div
                    style={{
                      fontFamily: grotesk,
                      fontWeight: 700,
                      fontSize: 72,
                      color: COLORS.aqua,
                      letterSpacing: -3,
                      lineHeight: 1,
                      marginTop: 8,
                    }}
                  >
                    63<span style={{ fontSize: 36 }}>%</span>
                  </div>
                  <div
                    style={{
                      fontFamily: plex,
                      fontSize: 14,
                      color: COLORS.dim,
                      marginTop: 4,
                    }}
                  >
                    avg. across 8,412 hexes
                  </div>
                  <div
                    style={{
                      marginTop: 28,
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      paddingTop: 18,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {[
                      ["North America", 87, COLORS.aqua],
                      ["Europe", 71, COLORS.aqua],
                      ["Latin America", 38, COLORS.orange],
                      ["SE Asia", 12, COLORS.orange],
                    ].map(([region, pct, color]) => (
                      <div key={region as string}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontFamily: plex,
                            fontSize: 13,
                            color: COLORS.white,
                          }}
                        >
                          <span>{region}</span>
                          <span style={{ color: color as string }}>{pct}%</span>
                        </div>
                        <div
                          style={{
                            height: 4,
                            background: "rgba(255,255,255,0.08)",
                            borderRadius: 2,
                            marginTop: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min(
                                pct as number,
                                interpolate(
                                  frame - 180,
                                  [0, 60],
                                  [0, pct as number],
                                  { extrapolateRight: "clamp" },
                                ),
                              )}%`,
                              background: color as string,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                ) : null
              }

            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                <MapGlobe
                  width={1196}
                  height={788}
                  hexLit={interpolate(frame, [110, 250], [0.2, 0.6], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })}
                  pins={QUERY_PINS.map((p) => ({
                    ...p,
                    delay: 130 + p.delay,
                  }))}
                  hexSeed={3}
                />
              </div>
            </ProductFrame>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
