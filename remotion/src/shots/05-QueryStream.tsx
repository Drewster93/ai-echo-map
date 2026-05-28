import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "../theme";
import { AnswerStream } from "../ui/AnswerStream";
import { HeroType } from "../motion/HeroType";
import { Cursor } from "../motion/Cursor";

export const QueryStream: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <AnswerStream
        query="best coffee in Williamsburg right now"
        delay={0}
      />

      <Sequence from={50} durationInFrames={90}>
        <Cursor
          path={[
            { f: 0, x: 1700, y: 200 },
            { f: 30, x: 600, y: 540 },
            { f: 60, x: 960, y: 720 },
          ]}
        />
      </Sequence>

      <Sequence from={170} durationInFrames={70}>
        <HeroType
          text="QUERY COVERAGE"
          size={140}
          italic={false}
          underline
          hold={28}
          inFrames={10}
          outFrames={10}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
