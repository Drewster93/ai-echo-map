import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SNAP } from "./easings";

// Per-word kinetic typography. Each word arrives on a perspective tilt.
export const KineticWords: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
}> = ({ text, delay = 0, stagger = 3, style, wordStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        gap: "0.28em",
        justifyContent: "center",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: SNAP,
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `perspective(900px) rotateX(${(1 - p) * -22}deg) translateY(${(1 - p) * 26}px)`,
              filter: `blur(${(1 - p) * 5}px)`,
              ...wordStyle,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Per-character kinetic typography for hero moments.
export const KineticChars: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, stagger = 1.5, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span style={{ display: "inline-block", ...style }}>
      {Array.from(text).map((c, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: SNAP,
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * 22}px) scale(${0.8 + p * 0.2})`,
              whiteSpace: c === " " ? "pre" : "normal",
            }}
          >
            {c}
          </span>
        );
      })}
    </span>
  );
};

// Stretch-smear ghost copy for stinger entries (poor-man motion blur).
export const SmearGhost: React.FC<{
  children: React.ReactNode;
  startFrame?: number;
  duration?: number;
}> = ({ children, startFrame = 0, duration = 4 }) => {
  const frame = useCurrentFrame();
  const t = (frame - startFrame) / duration;
  if (t < 0 || t > 1) return null;
  const scaleY = 1 + (1 - t) * 0.6;
  const opacity = (1 - t) * 0.35;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scaleY(${scaleY})`,
        opacity,
        filter: "blur(4px)",
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};
