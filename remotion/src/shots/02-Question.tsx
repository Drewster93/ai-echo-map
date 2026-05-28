import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { fraunces, plex, COLORS } from "../theme";
import { WorldMap } from "../ui/WorldMap";

export const Question: React.FC = () => {
  const f = useCurrentFrame();
  const mapO = interpolate(f, [0, 18], [0, 0.5], {
    extrapolateRight: "clamp",
  });
  const enter = interpolate(f, [10, 28], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const exit = interpolate(f, [110, 130], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = Math.min(enter, exit);
  const scale = interpolate(enter, [0, 1], [1.04, 1]);

  // word swap mid-shot for kinetic feel
  const showSecond = f >= 65;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <div style={{ opacity: mapO }}>
        <WorldMap dim={0.4} />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(5,3,13,0.4), rgba(5,3,13,0.95))",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: o,
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: plex,
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: COLORS.ultraviolet,
            marginBottom: 32,
          }}
        >
          The Question
        </div>
        <div
          style={{
            fontFamily: fraunces,
            fontWeight: 700,
            fontSize: 160,
            lineHeight: 0.92,
            letterSpacing: -5,
            color: COLORS.white,
            maxWidth: 1500,
          }}
        >
          {showSecond ? (
            <>
              <span style={{ fontStyle: "italic" }}>where</span> does AI
              <br />
              send people?
            </>
          ) : (
            <>
              Every day,
              <br />
              they ask AI.
            </>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
