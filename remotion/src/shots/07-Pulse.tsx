import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "../theme";
import { Sparkline } from "../ui/Sparkline";
import { AlertToast } from "../ui/AlertToast";
import { HeroType } from "../motion/HeroType";

export const Pulse: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Sparkline delay={0} />

      <Sequence from={80} durationInFrames={180}>
        <AlertToast />
      </Sequence>

      <Sequence from={160} durationInFrames={70}>
        <HeroType
          text="MONITORED DAILY"
          size={130}
          underline
          hold={26}
          inFrames={10}
          outFrames={10}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
