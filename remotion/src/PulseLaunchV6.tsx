import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { ParallaxVideo } from "./layers/ParallaxVideo";
import { KineticSting } from "./layers/KineticSting";
import { Letterbox } from "./layers/Letterbox";
import { ColorFlash } from "./layers/ColorFlash";
import { WhipPan } from "./layers/WhipPan";
import { BrandOverlay } from "./layers/BrandOverlay";
import { HexBloom } from "./layers/HexBloom";

const C = {
  plum: "#0B0418",
  uv: "#A855F7",
  aqua: "#22D3EE",
  coral: "#FB7185",
  lime: "#A3E635",
  ivory: "#F5F1EA",
};

// Scene timing (all in frames @30fps)
// 0     COLD OPEN          0  → 60   (2.0s)  brand reveal + hex bloom
export const PULSE_V6_TOTAL = 1140;
const VIDEO_SRC = "captures/full-flow-allkey.mp4";
// 105   QUERY              105→ 285  (6.0s)  typing capture, punch-zoom
// 285   STING "IN NOISE."  285→ 330  (1.5s)
// 330   MAP BLOOM          330→ 510  (6.0s)
// 510   MACRO PULSE        510→ 600  (3.0s)
// 600   LOCATION CARD      600→ 780  (6.0s)
// 780   AI ANSWERS MACRO   780→ 870  (3.0s)
// 870   BENCHMARK          870→ 960  (3.0s)
// 960   MONITOR            960→1020  (2.0s)
// 1020  SIGN-OFF           1020→1140 (4.0s)
export const PULSE_V6_TOTAL = 1140;

// Source video is 942 frames (31.43s). We display it during frames 105..1020 of the comp.
// That's 915 comp frames showing 942 source frames → playback ~1.03x (close to natural).
const VIDEO_VISIBLE_START = 105;
const VIDEO_VISIBLE_END = 1020;

// Per-scene camera moves (relative to scene start; absolute composition frames)
const moves = [
  // QUERY: start wide, punch into input area (top-center where the search field is)
  { startFrame: 105, endFrame: 165, scaleFrom: 1.0, scaleTo: 1.15, punch: false },
  { startFrame: 165, endFrame: 180, scaleFrom: 1.15, scaleTo: 1.55, punch: true },
  { startFrame: 180, endFrame: 285, scaleFrom: 1.55, scaleTo: 1.42, punch: false },
  // MAP BLOOM: pull back wide, slow push-in
  { startFrame: 330, endFrame: 510, scaleFrom: 1.05, scaleTo: 1.18, punch: false },
  // MACRO PULSE: aggressive zoom on a hotspot
  { startFrame: 510, endFrame: 525, scaleFrom: 1.18, scaleTo: 2.1, punch: true },
  { startFrame: 525, endFrame: 600, scaleFrom: 2.1, scaleTo: 1.95, punch: false },
  // LOCATION CARD: from zoom-in to cinematic push
  { startFrame: 600, endFrame: 780, scaleFrom: 1.1, scaleTo: 1.22, punch: false },
  // AI ANSWERS: macro
  { startFrame: 780, endFrame: 795, scaleFrom: 1.2, scaleTo: 1.8, punch: true },
  { startFrame: 795, endFrame: 870, scaleFrom: 1.8, scaleTo: 1.65, punch: false },
  // BENCHMARK: pull back, slow push
  { startFrame: 870, endFrame: 960, scaleFrom: 1.0, scaleTo: 1.12, punch: false },
  // MONITOR
  { startFrame: 960, endFrame: 1020, scaleFrom: 1.05, scaleTo: 1.15, punch: false },
];

export const PulseLaunchV6: React.FC = () => {
  const frame = useCurrentFrame();

  // Letterbox active during stings + sign-off + cold open
  const inSting =
    (frame >= 0 && frame < 60) ||
    (frame >= 60 && frame < 105) ||
    (frame >= 285 && frame < 330) ||
    (frame >= 1020 && frame < PULSE_V6_TOTAL);

  // Underlying video pauses on the last visible frame outside its window
  const videoVisible = frame >= VIDEO_VISIBLE_START && frame < VIDEO_VISIBLE_END;
  const videoOpacity = interpolate(
    frame,
    [VIDEO_VISIBLE_START - 6, VIDEO_VISIBLE_START, VIDEO_VISIBLE_END - 6, VIDEO_VISIBLE_END],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: C.plum }}>
      {/* persistent base video with per-shot camera moves */}
          <ParallaxVideo
            src={VIDEO_SRC}
            startFromFrame={0}
            moves={moves}
            origin={{ x: 0.5, y: 0.45 }}
          />
        </div>
      )}

      {/* Color grade wash */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 40%, ${C.uv}22 0%, transparent 60%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }} />

      {/* === COLD OPEN === */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill style={{ background: C.plum }}>
          <BrandOverlay variant="center" accent={C.uv} />
          <HexBloom accent={C.uv} />
          {/* chromatic split lines */}
          <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(90deg, transparent 49.7%, ${C.coral}40 50%, transparent 50.3%)`,
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(90deg, transparent 49.4%, ${C.aqua}40 50%, transparent 49.6%)`,
            }} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>

      {/* === STING 1 === */}
      <Sequence from={60} durationInFrames={45}>
        <KineticSting word="FIND SIGNAL" caption="in a sea of vibes" bg={C.plum} accent={C.coral} />
      </Sequence>
      <Sequence from={60} durationInFrames={6}>
        <ColorFlash color={C.coral} duration={6} />
      </Sequence>
      <Sequence from={99} durationInFrames={6}>
        <WhipPan direction="right" color={C.plum} />
      </Sequence>

      {/* === BRAND CORNER from frame 105 onward === */}
      <Sequence from={105} durationInFrames={PULSE_V6_TOTAL - 105}>
        <BrandOverlay variant="corner" accent={C.uv} />
      </Sequence>

      {/* punch-zoom flash on query enter */}
      <Sequence from={165} durationInFrames={6}>
        <ColorFlash color={C.uv} duration={6} />
      </Sequence>

      {/* === STING 2 === */}
      <Sequence from={279} durationInFrames={6}>
        <WhipPan direction="left" color={C.plum} />
      </Sequence>
      <Sequence from={285} durationInFrames={45}>
        <KineticSting word="IN NOISE" caption="real metrics, real places" bg={C.plum} accent={C.aqua} />
      </Sequence>
      <Sequence from={285} durationInFrames={6}>
        <ColorFlash color={C.aqua} duration={6} />
      </Sequence>
      <Sequence from={324} durationInFrames={6}>
        <WhipPan direction="right" color={C.plum} />
      </Sequence>

      {/* macro pulse beat flash */}
      <Sequence from={510} durationInFrames={8}>
        <ColorFlash color={C.lime} duration={8} />
      </Sequence>

      {/* whip into location card */}
      <Sequence from={594} durationInFrames={6}>
        <WhipPan direction="left" color={C.plum} />
      </Sequence>

      {/* AI answers macro flash */}
      <Sequence from={780} durationInFrames={6}>
        <ColorFlash color={C.aqua} duration={6} />
      </Sequence>

      {/* benchmark coral burst */}
      <Sequence from={870} durationInFrames={8}>
        <ColorFlash color={C.coral} duration={8} />
      </Sequence>

      {/* monitor lime pulse */}
      <Sequence from={960} durationInFrames={8}>
        <ColorFlash color={C.lime} duration={8} />
      </Sequence>

      {/* === SIGN-OFF === */}
      <Sequence from={1014} durationInFrames={6}>
        <WhipPan direction="right" color={C.plum} />
      </Sequence>
      <Sequence from={1020} durationInFrames={120}>
        <AbsoluteFill style={{ background: C.plum }}>
          <HexBloom accent={C.uv} />
          <BrandOverlay variant="center" accent={C.coral} />
          {/* accent pill bottom */}
          <SignoffPill />
        </AbsoluteFill>
      </Sequence>

      {/* letterbox last so it sits above all */}
      <Letterbox active={inSting} />
    </AbsoluteFill>
  );
};

const SignoffPill: React.FC = () => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [20, 50], [0, 360], { extrapolateRight: "clamp" });
  const o = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", bottom: 140, left: "50%",
      transform: "translateX(-50%)",
      width: w, height: 56, borderRadius: 28,
      border: "1.5px solid #FB718588",
      background: "linear-gradient(90deg, #FB718522, #A855F722)",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: o, overflow: "hidden",
      fontFamily: "monospace", color: "#F5F1EA",
      fontSize: 14, letterSpacing: 6, textTransform: "uppercase",
    }}>
      LIVE NOW · GET PULSE
    </div>
  );
};
