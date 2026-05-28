import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { COLORS } from "../theme";
import { WorldMap } from "../ui/WorldMap";
import { HexGrid } from "../ui/HexGrid";
import { HeroType } from "../motion/HeroType";
import { Sequence } from "remotion";

export const MapBloom: React.FC = () => {
  const f = useCurrentFrame();
  const mapScale = interpolate(f, [0, 90], [1.0, 2.4], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const mapO = interpolate(f, [70, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hexO = interpolate(f, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${mapScale})`,
          transformOrigin: "62% 38%",
          opacity: mapO,
        }}
      >
        <WorldMap highlight={{ x: 1190, y: 410, appearAt: 20 }} dim={0.7} />
      </div>

      <div style={{ opacity: hexO }}>
        <HexGrid radius={5} size={64} bloomDelay={95} highlightCenter />
      </div>

      <Sequence from={140} durationInFrames={50}>
        <HeroType
          text="LOCATION-LEVEL"
          size={150}
          italic={false}
          underline
          hold={20}
          inFrames={10}
          outFrames={10}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
