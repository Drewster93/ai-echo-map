interface Props {
  playing: boolean;
  progress: number; // 0-1
  onClick: () => void;
}

export function HeatReplayButton({ playing, progress, onClick }: Props) {
  const R = 16;
  const C = 2 * Math.PI * R;
  return (
    <button
      onClick={onClick}
      className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-tech-blue px-5 py-3 text-sm font-bold text-white shadow-[0_10px_40px_-10px_rgba(48,114,252,0.95)] transition hover:translate-y-[-1px] hover:shadow-[0_14px_50px_-10px_rgba(48,114,252,1)]"
    >
      <span className="relative grid h-9 w-9 place-items-center">
        <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
          <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <circle
            cx="20"
            cy="20"
            r={R}
            fill="none"
            stroke="#7BFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${progress * C} ${C}`}
            style={{ transition: "stroke-dasharray 0.2s linear" }}
          />
        </svg>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="relative">
          <path
            d="M3 18 Q 12 2 21 18"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      {playing ? "Replaying 7 days…" : "Heat Replay"}
    </button>
  );
}
