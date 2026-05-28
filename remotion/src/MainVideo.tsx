import React from "react";
import { AbsoluteFill, Series, Sequence } from "remotion";
import { PulseArcBg } from "./components/PulseArcBg";
import { CameraPush } from "./motion/CameraPush";
import { CutFlash } from "./motion/CutFlash";
import { TitleCard } from "./motion/TitleCard";
import { COLORS } from "./theme";
import { Scene01Problem } from "./scenes/Scene01Problem";
import { Scene02Meet } from "./scenes/Scene02Meet";
import { Scene03Promise } from "./scenes/Scene03Promise";
import { Scene04Scale } from "./scenes/Scene04Scale";
import { Scene05Coverage } from "./scenes/Scene05Coverage";
import { Scene06Query } from "./scenes/Scene06Query";
import { Scene07Compare } from "./scenes/Scene07Compare";
import { Scene08Drill } from "./scenes/Scene08Drill";
import { Scene09Edge } from "./scenes/Scene09Edge";
import { Scene10Api } from "./scenes/Scene10Api";
import { Scene11CTA } from "./scenes/Scene11CTA";

// Tightened durations (~30% shorter than original) — kinetic pacing.
export const SCENE_DURATIONS = {
  s01: 150,
  s02: 90,
  card1: 36,
  s03: 110,
  s04: 145,
  s05: 150,
  card2: 36,
  s06: 240,
  s07: 180,
  s08: 260,
  s09: 180,
  s10: 200,
  card3: 36,
  s11: 230,
};

  s11: 200,
};

export const TOTAL_FRAMES = Object.values(SCENE_DURATIONS).reduce(
  (a, b) => a + b,
  0,
);

type Dir = React.ComponentProps<typeof CameraPush>["direction"];

const Beat: React.FC<{
  duration: number;
  direction?: Dir;
  amount?: number;
  flashColor?: string;
  children: React.ReactNode;
}> = ({ duration, direction = "in", amount = 0.06, flashColor, children }) => (
  <>
    <CameraPush duration={duration} direction={direction} amount={amount}>
      {children}
    </CameraPush>
    <CutFlash color={flashColor} />
  </>
);

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <PulseArcBg />
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s01}>
          <Beat duration={SCENE_DURATIONS.s01} direction="in" amount={0.08}>
            <Scene01Problem />
          </Beat>
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.s02}>
          <Beat
            duration={SCENE_DURATIONS.s02}
            direction="in"
            amount={0.05}
            flashColor={COLORS.aqua}
          >
            <Scene02Meet />
          </Beat>
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.card1}>
          <Sequence durationInFrames={SCENE_DURATIONS.card1}>
            <TitleCard
              words={["BRAND-LEVEL", "ISN'T", "ENOUGH."]}
              accent={COLORS.orange}
              italicLast
            />
          </Sequence>
          <CutFlash color={COLORS.orange} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.s03}>
          <Beat duration={SCENE_DURATIONS.s03} direction="left" amount={0.06}>
            <Scene03Promise />
          </Beat>
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.s04}>
          <Beat
            duration={SCENE_DURATIONS.s04}
            direction="in"
            amount={0.07}
            flashColor={COLORS.aqua}
          >
            <Scene04Scale />
          </Beat>
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.s05}>
          <Beat duration={SCENE_DURATIONS.s05} direction="right" amount={0.05}>
            <Scene05Coverage />
          </Beat>
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.card2}>
          <Sequence durationInFrames={SCENE_DURATIONS.card2}>
            <TitleCard
              words={["LOCATION", "BY", "LOCATION."]}
              accent={COLORS.ultraviolet}
              italicLast
            />
          </Sequence>
          <CutFlash color={COLORS.ultraviolet} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.s06}>
          <Beat duration={SCENE_DURATIONS.s06} direction="in" amount={0.05}>
            <Scene06Query />
          </Beat>
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.s07}>
          <Beat
            duration={SCENE_DURATIONS.s07}
            direction="up"
            amount={0.04}
            flashColor={COLORS.blue}
          >
            <Scene07Compare />
          </Beat>
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.s08}>
          <Beat duration={SCENE_DURATIONS.s08} direction="in" amount={0.09}>
            <Scene08Drill />
          </Beat>
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.s09}>
          <Beat
            duration={SCENE_DURATIONS.s09}
            direction="left"
            amount={0.05}
            flashColor={COLORS.aqua}
          >
            <Scene09Edge />
          </Beat>
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.s10}>
          <Beat duration={SCENE_DURATIONS.s10} direction="in" amount={0.06}>
            <Scene10Api />
          </Beat>
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.card3}>
          <Sequence durationInFrames={SCENE_DURATIONS.card3}>
            <TitleCard
              words={["OWN", "THE", "HEX."]}
              accent={COLORS.aqua}
              italicLast
            />
          </Sequence>
          <CutFlash color={COLORS.aqua} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.s11}>
          <Beat
            duration={SCENE_DURATIONS.s11}
            direction="in"
            amount={0.08}
            flashColor={COLORS.ultraviolet}
          >
            <Scene11CTA />
          </Beat>
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
