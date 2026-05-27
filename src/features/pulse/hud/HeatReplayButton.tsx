interface Props {
  playing: boolean;
  progress: number; // 0-1
  onClick: () => void;
}

export function HeatReplayButton({ playing, progress, onClick }: Props) {
  const R = 7;
  const C = 2 * Math.PI * R;
  return (
    <button
      onClick={onClick}
      className="glass absolute bottom-6 right-[170px] z-20 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:translate-y-[-1px] hover:text-aqua"
    >
      <span className="relative grid h-[14px] w-[14px] place-items-center">
        <svg viewBox="0 0 18 18" className="absolute inset-0 -rotate-90">
          <circle cx="9" cy="9" r={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.6" />
          <circle
            cx="9"
            cy="9"
            r={R}
            fill="none"
            stroke="#7BFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray={`${progress * C} ${C}`}
            style={{ transition: "stroke-dasharray 0.2s linear" }}
          />
        </svg>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" className="relative">
          <path
            d="M3 18 Q 12 2 21 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      {playing ? "Replaying…" : "Heat Replay"}
    </button>
  );
}
