import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

const mono = loadMono();
const serif = loadSerif();

export const BrandOverlay: React.FC<{ variant?: "corner" | "center"; accent?: string }> = ({
  variant = "corner",
  accent = "#A855F7",
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  if (variant === "center") {
    return (
      <AbsoluteFill style={{
        alignItems: "center", justifyContent: "center", opacity: o, pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: serif.fontFamily, color: "#F5F1EA",
          fontSize: 180, letterSpacing: -4, lineHeight: 1,
        }}>
          pulse<span style={{ color: accent }}>.</span>
        </div>
        <div style={{
          fontFamily: mono.fontFamily, color: "#F5F1EA99",
          fontSize: 18, letterSpacing: 8, marginTop: 24, textTransform: "uppercase",
        }}>
          Real performance, mapped
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      <div style={{
        position: "absolute", top: 40, left: 48,
        fontFamily: serif.fontFamily, color: "#F5F1EA",
        fontSize: 32, letterSpacing: -1,
      }}>
        pulse<span style={{ color: accent }}>.</span>
      </div>
      <div style={{
        position: "absolute", top: 52, right: 48,
        fontFamily: mono.fontFamily, color: "#F5F1EA99",
        fontSize: 14, letterSpacing: 4,
      }}>
        REC ● {String(Math.floor(frame / 30)).padStart(2, "0")}:{String(frame % 30).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};
