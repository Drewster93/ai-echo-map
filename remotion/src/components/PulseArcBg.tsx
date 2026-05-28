import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

// Persistent dark cosmic background with drifting pulse arcs.
export const PulseArcBg: React.FC<{ intensity?: number }> = ({
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 120) * 20;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${COLORS.plum} 0%, ${COLORS.bg} 65%, #000 100%)`,
      }}
    >
      {/* Subtle grain via repeating gradient */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 30% 30%, rgba(255,255,255,0.02) 0 2px, transparent 2px 4px)",
          opacity: 0.6,
        }}
      />
      {/* Pulse arcs */}
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "flex-end" }}
      >
        <svg
          width="2200"
          height="1400"
          viewBox="0 0 2200 1400"
          style={{
            transform: `translateY(${200 + drift}px)`,
            opacity: 0.55 * intensity,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const r = 280 + i * 130;
            const o = 0.55 - i * 0.08;
            const tilt = Math.sin((frame + i * 30) / 90) * 6;
            return (
              <path
                key={i}
                d={`M ${1100 - r} 1100 Q 1100 ${1100 - r * 1.3 + tilt} ${1100 + r} 1100`}
                fill="none"
                stroke={i % 2 === 0 ? COLORS.ultraviolet : COLORS.aqua}
                strokeOpacity={o}
                strokeWidth={i === 0 ? 2 : 1.2}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </AbsoluteFill>
      {/* Floating spheres */}
      <AbsoluteFill>
        {[
          { x: 12, y: 18, s: 220, c: COLORS.ultraviolet, o: 0.35 },
          { x: 78, y: 22, s: 160, c: COLORS.blue, o: 0.3 },
          { x: 85, y: 70, s: 260, c: COLORS.aqua, o: 0.18 },
          { x: 8, y: 75, s: 200, c: COLORS.orange, o: 0.22 },
        ].map((b, i) => {
          const dy = Math.sin((frame + i * 40) / 80) * 18;
          const dx = Math.cos((frame + i * 30) / 100) * 14;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.s,
                height: b.s,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${b.c} 0%, transparent 70%)`,
                opacity: b.o * intensity,
                filter: "blur(40px)",
                transform: `translate(${dx}px, ${dy}px)`,
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
