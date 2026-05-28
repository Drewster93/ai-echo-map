import { Composition } from "remotion";
import { MainVideo, TOTAL_FRAMES } from "./MainVideo";
import { SquareVideo } from "./adapters/SquareVideo";
import { VerticalVideo } from "./adapters/VerticalVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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

    </>
  );
};
