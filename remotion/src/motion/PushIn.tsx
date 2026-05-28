import { interpolate, useCurrentFrame, Easing } from "remotion";

export const PushIn: React.FC<{
  children: React.ReactNode;
  from?: number;
  to?: number;
  duration?: number;
  origin?: string;
}> = ({ children, from = 1.0, to = 1.08, duration = 90, origin = "50% 50%" }) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, duration], [from, to], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${scale})`,
        transformOrigin: origin,
      }}
    >
      {children}
    </div>
  );
};

export const SnapZoom: React.FC<{
  children: React.ReactNode;
  from?: number;
  to?: number;
  at?: number;
  duration?: number;
  origin?: string;
}> = ({ children, from = 1, to = 2.5, at = 0, duration = 10, origin = "50% 50%" }) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [at, at + duration], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.85, 0, 0.05, 1),
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${scale})`,
        transformOrigin: origin,
      }}
    >
      {children}
    </div>
  );
};
