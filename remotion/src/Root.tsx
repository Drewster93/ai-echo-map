import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { SquareVideo } from "./adapters/SquareVideo";
import { VerticalVideo } from "./adapters/VerticalVideo";

// Master total = sum of scene durations minus transition overlaps.
// 11 scenes; see MainVideo for breakdown. Master = 2280 frames @ 30fps = 76s.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="main"
        component={MainVideo}
        durationInFrames={2280}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="square"
        component={SquareVideo}
        durationInFrames={2280}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="vertical"
        component={VerticalVideo}
        durationInFrames={2280}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
