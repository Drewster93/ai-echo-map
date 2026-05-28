import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";
import { HexGrid } from "./HexGrid";

// Stylized globe / world map: equirectangular continent rectangles overlaid with hex grid.
// Pins flare at named coordinates.
export type Pin = {
  x: number; // 0..1 across width
  y: number; // 0..1 across height
  delay: number; // frames
  color?: string;
  label?: string;
};

const CONTINENTS = [
  // very rough rectangles in 0..1 space (just for visual hint)
  { x: 0.08, y: 0.18, w: 0.2, h: 0.28 }, // N America
  { x: 0.22, y: 0.5, w: 0.12, h: 0.28 }, // S America
  { x: 0.42, y: 0.18, w: 0.16, h: 0.22 }, // Europe
  { x: 0.45, y: 0.42, w: 0.18, h: 0.32 }, // Africa
  { x: 0.6, y: 0.2, w: 0.28, h: 0.34 }, // Asia
  { x: 0.78, y: 0.58, w: 0.12, h: 0.18 }, // Oceania
];

export const MapGlobe: React.FC<{
  width?: number;
  height?: number;
  pins?: Pin[];
  hexLit?: number;
  hexSeed?: number;
}> = ({
  width = 1600,
  height = 800,
  pins = [],
  hexLit = 0.35,
  hexSeed = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, rgba(38,14,90,0.6) 0%, rgba(5,3,13,0.9) 100%)",
        boxShadow:
          "inset 0 0 80px rgba(123,255,255,0.08), 0 30px 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* lat/long grid */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0, opacity: 0.18 }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={(i / 12) * width}
            y1={0}
            x2={(i / 12) * width}
            y2={height}
            stroke={COLORS.aqua}
            strokeWidth={0.5}
          />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={(i / 7) * height}
            x2={width}
            y2={(i / 7) * height}
            stroke={COLORS.aqua}
            strokeWidth={0.5}
          />
        ))}
      </svg>
      {/* continents */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        {CONTINENTS.map((c, i) => (
          <rect
            key={i}
            x={c.x * width}
            y={c.y * height}
            width={c.w * width}
            height={c.h * height}
            rx={18}
            fill={COLORS.ultraviolet}
            fillOpacity={0.18}
            stroke={COLORS.ultraviolet}
            strokeOpacity={0.45}
            strokeWidth={1}
          />
        ))}
      </svg>
      {/* hex overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
        <HexGrid
          cols={Math.floor(width / 38)}
          rows={Math.floor(height / 48)}
          size={22}
          lit={hexLit}
          seed={hexSeed}
          width={width}
          height={height}
        />
      </div>
      {/* pins */}
      {pins.map((p, i) => {
        const local = frame - p.delay;
        const appear = interpolate(local, [0, 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const pulse = 1 + Math.sin(local / 8) * 0.15;
        const ring = interpolate(local % 60, [0, 60], [0, 90]);
        const ringOp = interpolate(local % 60, [0, 60], [0.7, 0]);
        const color = p.color ?? COLORS.aqua;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${appear * pulse})`,
              opacity: appear,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -ring / 2,
                top: -ring / 2,
                width: ring,
                height: ring,
                borderRadius: "50%",
                border: `2px solid ${color}`,
                opacity: ringOp,
              }}
            />
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 24px ${color}, 0 0 60px ${color}`,
              }}
            />
            {p.label && (
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  top: -6,
                  color: COLORS.white,
                  fontSize: 14,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                }}
              >
                {p.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const Globe = MapGlobe;
