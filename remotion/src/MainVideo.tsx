import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { PulseArcBg } from "./components/PulseArcBg";
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

export const SCENE_DURATIONS = {
  s01: 165,
  s02: 95,
  s03: 140,
  s04: 170,
  s05: 175,
  s06: 300,
  s07: 210,
  s08: 310,
  s09: 215,
  s10: 245,
  s11: 270,
};

export const TOTAL_FRAMES = Object.values(SCENE_DURATIONS).reduce(
  (a, b) => a + b,
  0,
);

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#05030d" }}>
      <PulseArcBg />
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s01}>
          <Scene01Problem />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s02}>
          <Scene02Meet />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s03}>
          <Scene03Promise />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s04}>
          <Scene04Scale />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s05}>
          <Scene05Coverage />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s06}>
          <Scene06Query />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s07}>
          <Scene07Compare />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s08}>
          <Scene08Drill />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s09}>
          <Scene09Edge />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s10}>
          <Scene10Api />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s11}>
          <Scene11CTA />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
