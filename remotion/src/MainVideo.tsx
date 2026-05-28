import React from "react";
import { AbsoluteFill, Series, Sequence } from "remotion";
import { PulseArcBg } from "./components/PulseArcBg";
import { CutFlash } from "./motion/CutFlash";
import {
  CameraRig,
  FilmOverlays,
  LightLeak,
} from "./motion/Cinematic";
import { COLORS } from "./theme";

import { Shot1a } from "./shots/Shot1a";
import { Shot1b } from "./shots/Shot1b";
import { Shot2a } from "./shots/Shot2a";
import { Shot2b } from "./shots/Shot2b";
import { Shot3a } from "./shots/Shot3a";
import { Shot3b } from "./shots/Shot3b";
import { Shot4a } from "./shots/Shot4a";
import { Shot4b } from "./shots/Shot4b";
import { Shot5a } from "./shots/Shot5a";
import { Shot5b } from "./shots/Shot5b";
import { Shot6a } from "./shots/Shot6a";
import { Shot6b } from "./shots/Shot6b";

// 50s @ 30fps = 1500 frames. 6 acts, 12 shots.
export const SHOT_DURATIONS = {
  s1a: 90,
  s1b: 90,
  s2a: 110,
  s2b: 130,
  s3a: 120,
  s3b: 120,
  s4a: 100,
  s4b: 230,
  s5a: 170,
  s5b: 130,
  s6a: 130,
  s6b: 80,
};

export const TOTAL_FRAMES = Object.values(SHOT_DURATIONS).reduce(
  (a, b) => a + b,
  0,
);

type ShotProps = {
  duration: number;
  rig: React.ComponentProps<typeof CameraRig>["rig"];
  flash?: string;
  bg?: boolean;
  children: React.ReactNode;
};

const Shot: React.FC<ShotProps> = ({ duration, rig, flash, bg = true, children }) => (
  <>
    {bg && <PulseArcBg intensity={0.7} />}
    <CameraRig duration={duration} rig={rig}>
      {children}
    </CameraRig>
    <CutFlash color={flash ?? COLORS.ultraviolet} />
  </>
);

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Series>
        {/* ACT 1 — HOOK */}
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s1a}>
          <Shot duration={SHOT_DURATIONS.s1a} rig={{ kind: "dolly", from: 1, to: 1.08 }} bg={false}>
            <Shot1a />
          </Shot>
        </Series.Sequence>
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s1b}>
          <Shot duration={SHOT_DURATIONS.s1b} rig={{ kind: "dolly", from: 0.9, to: 1.15 }} bg={false} flash={COLORS.aqua}>
            <Shot1b />
          </Shot>
        </Series.Sequence>

        {/* ACT 2 — THE LIE */}
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s2a}>
          <Shot duration={SHOT_DURATIONS.s2a} rig={{ kind: "dolly", from: 1.04, to: 1.0 }} flash={COLORS.ultraviolet}>
            <Shot2a />
          </Shot>
        </Series.Sequence>
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s2b}>
          <Shot duration={SHOT_DURATIONS.s2b} rig={{ kind: "whipPan", axis: "x", px: 1600, at: 6, window: 8 }} flash={COLORS.coral}>
            <Shot2b />
          </Shot>
          <LightLeak at={6} color={COLORS.coral} side="left" />
        </Series.Sequence>

        {/* ACT 3 — THE PIVOT */}
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s3a}>
          <Shot duration={SHOT_DURATIONS.s3a} rig={{ kind: "dolly", from: 1, to: 1.18 }} flash={COLORS.coral}>
            <Shot3a />
          </Shot>
        </Series.Sequence>
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s3b}>
          <Shot duration={SHOT_DURATIONS.s3b} rig={{ kind: "dolly", from: 1.05, to: 1.0 }} flash={COLORS.aqua}>
            <Shot3b />
          </Shot>
          <LightLeak at={0} color={COLORS.aqua} side="right" />
        </Series.Sequence>

        {/* ACT 4 — MEET THE PULSE */}
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s4a}>
          <Shot duration={SHOT_DURATIONS.s4a} rig={{ kind: "dolly", from: 0.95, to: 1.04 }} flash={COLORS.aqua}>
            <Shot4a />
          </Shot>
        </Series.Sequence>
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s4b}>
          <Shot duration={SHOT_DURATIONS.s4b} rig={{ kind: "dolly", from: 0.98, to: 1.06 }} flash={COLORS.ultraviolet}>
            <Shot4b />
          </Shot>
        </Series.Sequence>

        {/* ACT 5 — THE PULSE METAPHOR */}
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s5a}>
          <Shot duration={SHOT_DURATIONS.s5a} rig={{ kind: "rackFocus", sharpAt: 50 }} flash={COLORS.aquaBright}>
            <Shot5a />
          </Shot>
        </Series.Sequence>
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s5b}>
          <Shot duration={SHOT_DURATIONS.s5b} rig={{ kind: "orbit", degrees: 8 }} flash={COLORS.aqua}>
            <Shot5b />
          </Shot>
        </Series.Sequence>

        {/* ACT 6 — CLOSE */}
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s6a}>
          <Shot duration={SHOT_DURATIONS.s6a} rig={{ kind: "crane", fromScale: 1, toScale: 0.9, fromY: 0, toY: 40 }} flash={COLORS.ultraviolet}>
            <Shot6a />
          </Shot>
        </Series.Sequence>
        <Series.Sequence durationInFrames={SHOT_DURATIONS.s6b}>
          <Shot duration={SHOT_DURATIONS.s6b} rig={{ kind: "dolly", from: 1.02, to: 1.0 }} flash={COLORS.aquaBright}>
            <Shot6b />
          </Shot>
          <LightLeak at={4} color={COLORS.aquaBright} side="left" />
        </Series.Sequence>
      </Series>

      {/* Always-on film overlays */}
      <FilmOverlays grain={0.06} vignette={0.55} />
    </AbsoluteFill>
  );
};
