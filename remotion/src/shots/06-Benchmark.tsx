import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "../theme";
import { CompetitorBars } from "../ui/CompetitorBars";
import { HeroType } from "../motion/HeroType";
import { Whip } from "../motion/Whip";

export const Benchmark: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <CompetitorBars delay={0} />
      <Whip at={0} duration={8} direction="ltr" />

      <Sequence from={170} durationInFrames={60}>
        <HeroType
          text="BENCHMARK"
          size={180}
          underline
          hold={24}
          inFrames={10}
          outFrames={10}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
