import { Composition } from "remotion";
import { Brainrot } from "./Brainrot";
import { totalMs } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Brainrot"
      component={Brainrot}
      durationInFrames={Math.ceil((totalMs / 1000) * 30)}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
