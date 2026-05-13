interface Props {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

// Concentric circle pulse — Uberall "Full-Circle Pulse"
export function PulseCircle({ size = 220, color = "#3072FC", opacity = 0.35, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      style={{ opacity }}
      aria-hidden
    >
      {[20, 40, 60, 80, 95].map((r, i) => (
        <circle
          key={r}
          cx="100"
          cy="100"
          r={r}
          stroke={color}
          strokeWidth="1"
          opacity={1 - i * 0.15}
        />
      ))}
    </svg>
  );
}
