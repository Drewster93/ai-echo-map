import { Composition } from "remotion";
import { MainVideo, TOTAL_FRAMES } from "./MainVideo";
import { SquareVideo } from "./adapters/SquareVideo";
import { VerticalVideo } from "./adapters/VerticalVideo";
import { PulseLaunch, PULSE_TOTAL } from "./PulseLaunch";
import { PulseLaunchV6, PULSE_V6_TOTAL } from "./PulseLaunchV6";

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <>
      <Composition
        id="pulse-launch-v6"
        component={PulseLaunchV6}
        durationInFrames={PULSE_V6_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
        component={PulseLaunch}
        durationInFrames={PULSE_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="main"
        component={MainVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="square"
        component={SquareVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="vertical"
        component={VerticalVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

