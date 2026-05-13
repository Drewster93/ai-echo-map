interface Props {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

// Single arch — Uberall "1-Arch Pulse" stylized
export function PulseArc({ size = 600, color = "#FFFFFF", opacity = 0.15, className }: Props) {
  return (
    <svg
      width={size}
      height={size / 2}
      viewBox="0 0 600 300"
      fill="none"
      className={className}
      style={{ opacity }}
      aria-hidden
    >
      <path
        d="M20 280 Q 300 -40 580 280"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M60 280 Q 300 10 540 280"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M100 280 Q 300 60 500 280"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M140 280 Q 300 110 460 280"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.25"
      />
    </svg>
  );
}
