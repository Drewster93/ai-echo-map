import React from "react";
import { COLORS } from "../theme";

export const GradientText: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  from?: string;
  via?: string;
  to?: string;
}> = ({
  children,
  style,
  from = COLORS.aqua,
  via = COLORS.ultraviolet,
  to = COLORS.orange,
}) => (
  <span
    style={{
      backgroundImage: `linear-gradient(90deg, ${from} 0%, ${via} 50%, ${to} 100%)`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      ...style,
    }}
  >
    {children}
  </span>
);
