import { AbsoluteFill, Series } from "remotion";
import { COLORS } from "./theme";
import { Wordmark } from "./shots/01-Wordmark";
import { Question } from "./shots/02-Question";
import { MapBloom } from "./shots/03-MapBloom";
import { HexDrill } from "./shots/04-HexDrill";
import { QueryStream } from "./shots/05-QueryStream";
import { Benchmark } from "./shots/06-Benchmark";
import { Pulse } from "./shots/07-Pulse";
import { Signoff } from "./shots/08-Signoff";

// 30fps. Total = 75+135+210+210+240+240+240+120 = 1470 frames = 49s
export const PULSE_TOTAL = 1470;

export const PulseLaunch: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Series>
        <Series.Sequence durationInFrames={75}>
          <Wordmark />
        </Series.Sequence>
        <Series.Sequence durationInFrames={135}>
          <Question />
        </Series.Sequence>
        <Series.Sequence durationInFrames={210}>
          <MapBloom />
        </Series.Sequence>
        <Series.Sequence durationInFrames={210}>
          <HexDrill />
        </Series.Sequence>
        <Series.Sequence durationInFrames={240}>
          <QueryStream />
        </Series.Sequence>
        <Series.Sequence durationInFrames={240}>
          <Benchmark />
        </Series.Sequence>
        <Series.Sequence durationInFrames={240}>
          <Pulse />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <Signoff />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
