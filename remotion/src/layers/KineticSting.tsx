import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const serif = loadSerif();
const mono = loadMono();

interface Props {
  word: string;
  caption?: string;
  bg: string;
  accent: string;
}

export const KineticSting: React.FC<Props> = ({ word, caption, bg, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  const y = interpolate(enter, [0, 1], [60, 0]);
  const blur = interpolate(enter, [0, 1], [18, 0]);
  const opacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: bg,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        opacity,
      }}
    >
      {/* corner ticks */}
      <div style={{
        position: "absolute", top: 60, left: 60,
        fontFamily: mono.fontFamily, color: accent,
        fontSize: 18, letterSpacing: 4,
      }}>
        ◢ PULSE / 0{Math.floor(frame / 6) + 1}
      </div>
      <div style={{
        position: "absolute", top: 60, right: 60,
        fontFamily: mono.fontFamily, color: "#F5F1EA88",
        fontSize: 18, letterSpacing: 4,
      }}>
        SIGNAL.LIVE
      </div>

      <div
        style={{
          fontFamily: serif.fontFamily,
          color: "#F5F1EA",
          fontSize: 280,
          fontWeight: 400,
          letterSpacing: -8,
          lineHeight: 0.9,
          transform: `translateY(${y}px)`,
          filter: `blur(${blur}px)`,
          textAlign: "center",
        }}
      >
        {word}
        <span style={{ color: accent }}>.</span>
      </div>

      {caption && (
        <div
          style={{
            fontFamily: mono.fontFamily,
            color: "#F5F1EA99",
            fontSize: 22,
            letterSpacing: 6,
            marginTop: 24,
            textTransform: "uppercase",
            transform: `translateY(${y * 0.4}px)`,
            opacity: interpolate(frame, [8, 18], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {caption}
        </div>
      )}

      {/* accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          width: interpolate(enter, [0, 1], [0, 240]),
          height: 3,
          background: accent,
          transform: "translateX(-50%)",
        }}
      />
    </AbsoluteFill>
  );
};
