import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { plex, COLORS } from "../theme";

export const AlertToast: React.FC<{
  delay?: number;
  title?: string;
  body?: string;
}> = ({
  delay = 0,
  title = "Visibility up +12 this week",
  body = "ChatGPT now ranks Lumen Coffee #1 in Williamsburg",
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: f - delay,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.6 },
  });
  const ty = interpolate(s, [0, 1], [-40, 0]);
  const o = interpolate(s, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        right: 60,
        width: 460,
        padding: "18px 22px",
        background: "rgba(15,8,35,0.95)",
        border: `1px solid ${COLORS.ultraviolet}`,
        borderRadius: 14,
        boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(134,14,255,0.4)`,
        opacity: o,
        transform: `translateY(${ty}px)`,
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: COLORS.ultraviolet,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          ▲
        </div>
        <div>
          <div
            style={{
              fontFamily: plex,
              fontSize: 17,
              fontWeight: 700,
              color: COLORS.white,
              lineHeight: 1.3,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: plex,
              fontSize: 14,
              fontWeight: 400,
              color: COLORS.dim,
              marginTop: 4,
              lineHeight: 1.4,
            }}
          >
            {body}
          </div>
        </div>
      </div>
    </div>
  );
};
