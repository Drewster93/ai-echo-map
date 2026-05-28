import React from "react";
import { COLORS } from "../theme";

// Recreated app chrome: dark plum sidebar + main canvas area with pulse-arc header.
export const ProductFrame: React.FC<{
  width?: number;
  height?: number;
  brand?: string;
  children?: React.ReactNode;
  sidebar?: React.ReactNode;
  showCursor?: { x: number; y: number } | null;
}> = ({
  width = 1500,
  height = 900,
  brand = "Starbucks",
  children,
  sidebar,
  showCursor = null,
}) => {
  return (
    <div
      style={{
        width,
        height,
        background: COLORS.bg,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(134,14,255,0.35)",
        boxShadow:
          "0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(134,14,255,0.25)",
        display: "flex",
        position: "relative",
        fontFamily: "system-ui",
      }}
    >
      {/* sidebar */}
      <div
        style={{
          width: 64,
          background: COLORS.plum,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 0",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.ultraviolet}, ${COLORS.aqua})`,
          }}
        />
        {["map", "list", "data", "set"].map((k) => (
          <div
            key={k}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>
      {/* main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* topbar */}
        <div
          style={{
            height: 56,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            padding: "0 22px",
            gap: 16,
            background: "rgba(38,14,90,0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 14px",
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
            <span style={{ color: "white", fontSize: 14, fontWeight: 600 }}>
              {brand}
            </span>
          </div>
          <div
            style={{
              color: COLORS.dim,
              fontSize: 13,
            }}
          >
            Global · Last 24h
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.ultraviolet}, ${COLORS.blue})`,
              color: "white",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Export
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", position: "relative" }}>
          <div style={{ flex: 1, position: "relative" }}>{children}</div>
          {sidebar && (
            <div
              style={{
                width: 340,
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(5,3,13,0.85)",
                padding: 22,
                color: "white",
                fontSize: 14,
              }}
            >
              {sidebar}
            </div>
          )}
        </div>
      </div>
      {showCursor && (
        <div
          style={{
            position: "absolute",
            left: showCursor.x,
            top: showCursor.y,
            pointerEvents: "none",
            transition: "none",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path
              d="M3 2 L3 20 L8 15 L11 22 L14 21 L11 14 L18 14 Z"
              fill="white"
              stroke="black"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
