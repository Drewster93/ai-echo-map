import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, fraunces, plex } from "../theme";
import { Heartbeat, PulseRing } from "../motion/Cinematic";
import { CINE_IN, OVERSHOOT } from "../motion/easings";

// Shot 5.1 — Rack-focus into a hex → expands fullscreen → EKG line + pulse arcs.
// Stinger card: "FEEL EVERY LOCATION'S HEARTBEAT."
export const Shot5a: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // hex expand 0..40
  const hexExpand = interpolate(frame, [0, 40], [0.3, 14], {
    extrapolateRight: "clamp",
    easing: (v) => v * v,
  });
  const hexFade = interpolate(frame, [30, 45], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ekgIn = spring({ frame: frame - 40, fps, config: CINE_IN });
  const stingerIn = spring({ frame: frame - 100, fps, config: OVERSHOOT });
  const stingerOut = interpolate(frame, [150, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* expanding hex */}
      <svg
        width={500}
        height={500}
        style={{
          position: "absolute",
          transform: `scale(${hexExpand})`,
          opacity: hexFade,
        }}
        viewBox="0 0 500 500"
      >
        <polygon
          points="250,30 460,150 460,350 250,470 40,350 40,150"
          fill={`${COLORS.aqua}22`}
          stroke={COLORS.aquaBright}
          strokeWidth={4}
          style={{ filter: `drop-shadow(0 0 30px ${COLORS.aquaBright})` }}
        />
      </svg>

      {/* pulse ring */}
      <div
        style={{
          position: "absolute",
          opacity: ekgIn * (1 - stingerOut),
        }}
      >
        <PulseRing size={900} bpm={72} color={COLORS.aquaBright} beats={3} />
      </div>

      {/* EKG */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          marginTop: -140,
          opacity: ekgIn * (1 - stingerOut),
          transform: `translateY(${(1 - ekgIn) * 20}px)`,
        }}
      >
        <Heartbeat width={1920} height={280} bpm={72} />
      </div>

      {/* stinger */}
      <div
        style={{
          position: "absolute",
          opacity: stingerIn * (1 - stingerOut),
          textAlign: "center",
          padding: "0 100px",
        }}
      >
        <div
          style={{
            fontFamily: fraunces,
            fontWeight: 700,
            fontSize: 130,
            lineHeight: 0.95,
            color: COLORS.white,
            letterSpacing: -6,
            textShadow: `0 0 60px ${COLORS.ultraviolet}aa`,
          }}
        >
          Feel every location's
        </div>
        <div
          style={{
            fontFamily: fraunces,
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: 180,
            lineHeight: 1,
            color: COLORS.aquaBright,
            letterSpacing: -8,
            textShadow: `0 0 80px ${COLORS.aquaBright}aa`,
          }}
        >
          heartbeat.
        </div>
      </div>
    </AbsoluteFill>
  );
};
