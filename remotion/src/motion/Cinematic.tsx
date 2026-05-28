import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { cineEase, whip, OVERSHOOT, SNAP, CINE_IN } from "./easings";

// ──────────────────────────────────────────────────────────────────────
// Film overlays: always-on persistent layers stacked above scenes.
// ──────────────────────────────────────────────────────────────────────

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  // small per-frame offset so grain shimmers
  const ox = (frame * 7) % 13;
  const oy = (frame * 11) % 17;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "overlay",
        opacity,
        backgroundImage:
          "repeating-radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px), repeating-radial-gradient(circle at 70% 70%, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)",
        backgroundSize: "3px 3px, 4px 4px",
        backgroundPosition: `${ox}px ${oy}px, ${-ox}px ${oy}px`,
      }}
    />
  );
};

export const Vignette: React.FC<{ intensity?: number }> = ({
  intensity = 0.55,
}) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,${intensity}) 100%)`,
    }}
  />
);

export const AnamorphicBars: React.FC<{
  show: boolean;
  height?: number;
}> = ({ show, height = 110 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: show ? frame : 0, fps, config: CINE_IN });
  const h = p * height;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: h,
          background: "#000",
          zIndex: 30,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: h,
          background: "#000",
          zIndex: 30,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export const LightLeak: React.FC<{
  at?: number;
  color?: string;
  side?: "left" | "right";
}> = ({ at = 0, color = COLORS.aqua, side = "left" }) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < 0 || local > 30) return null;
  const op = interpolate(local, [0, 6, 30], [0, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background:
          side === "left"
            ? `linear-gradient(90deg, ${color}aa 0%, transparent 35%)`
            : `linear-gradient(-90deg, ${color}aa 0%, transparent 35%)`,
        mixBlendMode: "screen",
        opacity: op,
        filter: "blur(40px)",
      }}
    />
  );
};

export const ChromaticSplit: React.FC<{
  children: React.ReactNode;
  amount?: number;
  fade?: number; // 0..1 how much split
}> = ({ children, amount = 6, fade = 1 }) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          color: COLORS.coral,
          transform: `translateX(${-amount * fade}px)`,
          mixBlendMode: "screen",
          opacity: 0.7 * fade,
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          color: COLORS.aqua,
          transform: `translateX(${amount * fade}px)`,
          mixBlendMode: "screen",
          opacity: 0.7 * fade,
        }}
      >
        {children}
      </div>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Camera rig
// ──────────────────────────────────────────────────────────────────────

type Rig =
  | { kind: "dolly"; from?: number; to?: number }
  | { kind: "orbit"; degrees?: number }
  | { kind: "crane"; fromY?: number; toY?: number; fromScale?: number; toScale?: number }
  | { kind: "whipPan"; axis?: "x" | "y"; px?: number; at?: number; window?: number }
  | { kind: "rackFocus"; sharpAt?: number };

export const CameraRig: React.FC<{
  duration: number;
  rig: Rig;
  children: React.ReactNode;
}> = ({ duration, rig, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
    easing: cineEase,
  });

  let transform = "";
  let filter = "";

  switch (rig.kind) {
    case "dolly": {
      const s = (rig.from ?? 1) + ((rig.to ?? 1.12) - (rig.from ?? 1)) * p;
      transform = `scale(${s})`;
      break;
    }
    case "orbit": {
      const d = (rig.degrees ?? 12) * p;
      transform = `perspective(2000px) rotateY(${d}deg) scale(${1 + p * 0.04})`;
      break;
    }
    case "crane": {
      const y =
        (rig.fromY ?? 0) + ((rig.toY ?? -140) - (rig.fromY ?? 0)) * p;
      const s =
        (rig.fromScale ?? 1) +
        ((rig.toScale ?? 1.25) - (rig.fromScale ?? 1)) * p;
      transform = `translateY(${y}px) scale(${s})`;
      break;
    }
    case "whipPan": {
      const at = rig.at ?? Math.floor(duration / 2);
      const win = rig.window ?? 10;
      const px = rig.px ?? 1800;
      const w = interpolate(frame, [at - win, at, at + win], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: whip,
      });
      const dir = frame < at ? 1 : -1;
      const t = w * px * dir;
      const blur = w * 16;
      transform =
        rig.axis === "y" ? `translateY(${t}px)` : `translateX(${t}px)`;
      filter = `blur(${blur}px)`;
      break;
    }
    case "rackFocus": {
      const sharpAt = rig.sharpAt ?? Math.floor(duration * 0.5);
      const b = interpolate(
        frame,
        [0, sharpAt - 6, sharpAt + 6, duration],
        [8, 0, 0, 6],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      filter = `blur(${b}px)`;
      transform = `scale(${1 + p * 0.05})`;
      break;
    }
  }

  return (
    <AbsoluteFill
      style={{
        transform,
        transformOrigin: "50% 50%",
        filter,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Odometer-style rolling counter
// ──────────────────────────────────────────────────────────────────────

export const OdometerCounter: React.FC<{
  to: number;
  duration?: number;
  suffix?: string;
  style?: React.CSSProperties;
  delay?: number;
}> = ({ to, duration = 50, suffix = "", style, delay = 0 }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame - delay, [0, duration], [0, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: cineEase,
  });
  // overshoot wobble
  const overshoot =
    1 +
    Math.sin(
      Math.max(0, Math.min(1, (frame - delay - duration) / 10)) * Math.PI,
    ) *
      0.04;
  return (
    <span
      style={{
        display: "inline-block",
        transform: `scale(${overshoot})`,
        ...style,
      }}
    >
      {Math.round(v).toLocaleString("en-US")}
      {suffix}
    </span>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Heartbeat / EKG line
// ──────────────────────────────────────────────────────────────────────

export const Heartbeat: React.FC<{
  width?: number;
  height?: number;
  bpm?: number;
  color?: string;
  thickness?: number;
}> = ({
  width = 1800,
  height = 280,
  bpm = 72,
  color = COLORS.aquaBright,
  thickness = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const periodFrames = (60 / bpm) * fps;
  const t = (frame % periodFrames) / periodFrames; // 0..1 per beat

  // build pts: flat-flat-spike-spike-flat
  const pts: [number, number][] = [];
  const samples = 220;
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * width;
    const u = (i / (samples - 1) + t) % 1; // scroll
    let y = height / 2;
    // QRS complex
    const c = 0.5;
    const d = u - c;
    if (Math.abs(d) < 0.005) y = height / 2 - height * 0.42; // R peak
    else if (d > -0.018 && d < -0.005) y = height / 2 + height * 0.12; // Q
    else if (d > 0.005 && d < 0.018) y = height / 2 + height * 0.18; // S
    else if (d > 0.025 && d < 0.06) y = height / 2 - height * 0.1; // T
    pts.push([x, y]);
  }
  const d = pts
    .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="ekgFade" x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.15" stopColor={color} stopOpacity="1" />
          <stop offset="0.85" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="url(#ekgFade)"
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 12px ${color})` }}
      />
    </svg>
  );
};

// Radial pulse ring synced to bpm
export const PulseRing: React.FC<{
  size?: number;
  bpm?: number;
  color?: string;
  beats?: number;
}> = ({ size = 700, bpm = 72, color = COLORS.aquaBright, beats = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const periodFrames = (60 / bpm) * fps;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      {Array.from({ length: beats }).map((_, i) => {
        const local = frame - i * (periodFrames / beats);
        const t = ((local % periodFrames) + periodFrames) % periodFrames;
        const p = t / periodFrames;
        const scale = 0.2 + p * 1;
        const op = (1 - p) * 0.7;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${color}`,
              boxShadow: `0 0 60px ${color}`,
              transform: `scale(${scale})`,
              opacity: op,
            }}
          />
        );
      })}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Kinetic line: stacked typographic lines that whip in line-by-line
// ──────────────────────────────────────────────────────────────────────

export const KineticLine: React.FC<{
  lines: Array<{
    text: string;
    color?: string;
    strike?: boolean;
    italic?: boolean;
    size?: number;
    delay?: number;
    weight?: number;
  }>;
  font?: string;
  align?: "left" | "center" | "right";
}> = ({ lines, font = fraunces, align = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems:
          align === "left"
            ? "flex-start"
            : align === "right"
              ? "flex-end"
              : "center",
        gap: 6,
      }}
    >
      {lines.map((L, i) => {
        const delay = L.delay ?? i * 6;
        const p = spring({
          frame: frame - delay,
          fps,
          config: OVERSHOOT,
        });
        const strikeP = L.strike
          ? interpolate(frame - delay, [10, 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: whip,
            })
          : 0;
        return (
          <div
            key={i}
            style={{
              position: "relative",
              fontFamily: font,
              fontWeight: L.weight ?? 700,
              fontStyle: L.italic ? "italic" : "normal",
              fontSize: L.size ?? 140,
              color: L.color ?? COLORS.white,
              letterSpacing: -4,
              lineHeight: 1,
              opacity: p,
              transform: `translateX(${(1 - p) * -120}px) skewX(${(1 - p) * -12}deg)`,
              filter: `blur(${(1 - p) * 5}px)`,
            }}
          >
            {L.text}
            {L.strike && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "50%",
                  height: 8,
                  background: COLORS.coral,
                  transform: `scaleX(${strikeP})`,
                  transformOrigin: "left",
                  boxShadow: `0 0 18px ${COLORS.coral}`,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Letterbox/anamorphic helper (always-on)
// ──────────────────────────────────────────────────────────────────────

export const FilmOverlays: React.FC<{ grain?: number; vignette?: number }> = ({
  grain = 0.06,
  vignette = 0.55,
}) => (
  <>
    <Vignette intensity={vignette} />
    <Grain opacity={grain} />
  </>
);
