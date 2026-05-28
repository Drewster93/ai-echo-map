import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces } from "../theme";
import { CINE_IN } from "../motion/easings";

// Deterministic particle field
const PARTICLES = Array.from({ length: 260 }).map((_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const r = a - Math.floor(a);
  const b = Math.sin(i * 78.233) * 43758.5453;
  const r2 = b - Math.floor(b);
  return {
    // spherical
    theta: r * Math.PI * 2,
    phi: Math.acos(2 * r2 - 1),
    hueIdx: i % 3,
    speed: 0.4 + r * 0.7,
  };
});

// Shot 1.2 — Dot explodes into sphere of city-light particles.
// Then white-frame flash and "But where?" italic.
export const Shot1b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // explosion in first 18 frames
  const explode = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const radius = 60 + explode * 380;
  const orbit = frame / 60;

  // late: white flash f=60-66, then italic text f=66+
  const whiteFlash = interpolate(frame, [60, 64, 70], [0, 0.95, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const italicIn = spring({ frame: frame - 68, fps, config: CINE_IN });

  return (
    <AbsoluteFill
      style={{
        background: "#000",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1200,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 2,
          height: 2,
          transformStyle: "preserve-3d",
        }}
      >
        {PARTICLES.map((p, i) => {
          const x = Math.sin(p.phi) * Math.cos(p.theta + orbit * p.speed) * radius;
          const y = Math.cos(p.phi) * radius;
          const z = Math.sin(p.phi) * Math.sin(p.theta + orbit * p.speed) * radius;
          const depth = (z + radius) / (radius * 2); // 0..1
          const c =
            p.hueIdx === 0
              ? COLORS.aqua
              : p.hueIdx === 1
                ? COLORS.ultraviolet
                : COLORS.white;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 3 + depth * 5,
                height: 3 + depth * 5,
                borderRadius: "50%",
                background: c,
                opacity: 0.35 + depth * 0.65,
                boxShadow: `0 0 ${4 + depth * 12}px ${c}`,
                transform: `translateZ(${z}px)`,
              }}
            />
          );
        })}
      </div>

      {/* white flash */}
      <AbsoluteFill
        style={{
          background: "#fff",
          opacity: whiteFlash,
          pointerEvents: "none",
        }}
      />
      {frame > 66 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: interpolate(frame, [66, 74], [1, 1]),
          }}
        >
          <div
            style={{
              fontFamily: fraunces,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 180,
              color: "#000",
              letterSpacing: -6,
              opacity: italicIn,
              transform: `translateY(${(1 - italicIn) * 22}px)`,
            }}
          >
            But where?
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
