import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface CameraMove {
  // Each entry: from frame X (relative to sequence), apply transform
  startFrame: number;
  endFrame: number;
  scaleFrom: number;
  scaleTo: number;
  xFrom?: number;
  xTo?: number;
  yFrom?: number;
  yTo?: number;
  punch?: boolean; // if true, use spring-snap from scaleFrom→scaleTo over 4 frames then drift to scaleTo*0.95
}

interface Props {
  src?: string;
  startFromFrame?: number; // offset into source video in frames @30fps
  moves: CameraMove[];
  /** Optional fixed crop focal point (0-1 normalized) for the entire shot */
  origin?: { x: number; y: number };
}

export const ParallaxVideo: React.FC<Props> = ({
  src = "captures/full-flow.mp4",
  startFromFrame = 0,
  moves,
  origin = { x: 0.5, y: 0.5 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let scale = 1;
  let tx = 0;
  let ty = 0;

  for (const m of moves) {
    if (frame >= m.startFrame && frame <= m.endFrame) {
      const local = frame - m.startFrame;
      const duration = m.endFrame - m.startFrame;
      if (m.punch) {
        const s = spring({
          frame: local,
          fps,
          config: { damping: 12, stiffness: 220 },
          durationInFrames: 6,
        });
        scale = interpolate(s, [0, 1], [m.scaleFrom, m.scaleTo]);
      } else {
        // sinusoidal ease
        const t = local / Math.max(1, duration);
        const eased = 0.5 - 0.5 * Math.cos(t * Math.PI);
        scale = interpolate(eased, [0, 1], [m.scaleFrom, m.scaleTo]);
        if (m.xFrom !== undefined && m.xTo !== undefined) {
          tx = interpolate(eased, [0, 1], [m.xFrom, m.xTo]);
        }
        if (m.yFrom !== undefined && m.yTo !== undefined) {
          ty = interpolate(eased, [0, 1], [m.yFrom, m.yTo]);
        }
      }
      break;
    }
  }

  return (
    <AbsoluteFill style={{ background: "#0B0418", overflow: "hidden" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: `${origin.x * 100}% ${origin.y * 100}%`,
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={startFromFrame}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          muted
        />
      </div>
      {/* subtle vignette */}
      <AbsoluteFill style={{
        background: "radial-gradient(ellipse at center, transparent 55%, rgba(11,4,24,0.55) 100%)",
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};
