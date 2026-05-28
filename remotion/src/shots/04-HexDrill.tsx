import { AbsoluteFill, interpolate, useCurrentFrame, Sequence } from "remotion";
import { COLORS } from "../theme";
import { HexGrid } from "../ui/HexGrid";
import { LocationReportCard } from "../ui/LocationReportCard";
import { Cursor } from "../motion/Cursor";

export const HexDrill: React.FC = () => {
  const f = useCurrentFrame();
  const hexScale = interpolate(f, [0, 20], [1, 2.6], {
    extrapolateRight: "clamp",
  });
  const hexO = interpolate(f, [20, 40], [1, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${hexScale})`,
          transformOrigin: "50% 50%",
          opacity: hexO,
        }}
      >
        <HexGrid radius={5} size={64} bloomDelay={-100} highlightCenter />
      </div>

      <Sequence from={30} durationInFrames={180}>
        <LocationReportCard score={87} delay={0} />
      </Sequence>

      <Sequence from={70} durationInFrames={140}>
        <Cursor
          path={[
            { f: 0, x: 1400, y: 800 },
            { f: 25, x: 460, y: 320 },
            { f: 45, x: 240, y: 480 },
          ]}
          label="Lumen Coffee · Bedford Ave"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
