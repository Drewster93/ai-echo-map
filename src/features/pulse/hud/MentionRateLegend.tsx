export function MentionRateLegend() {
  return (
    <div className="absolute bottom-5 right-5 z-20 w-[280px] rounded-2xl bg-white p-4 text-slate-900 shadow-[0_20px_60px_-15px_rgba(15,8,40,0.4)]">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-700">
          AI Mention Rate
        </span>
        <span className="text-[10px] text-slate-400">% of prompts</span>
      </div>
      <ul className="space-y-2 text-sm">
        <Row color="#34c759" label="Strong presence" range="≥ 60%" />
        <Row color="#f5c518" label="Moderate" range="40–60%" />
        <Row color="#e53935" label="Underperforming" range="< 40%" />
      </ul>
    </div>
  );
}

function Row({ color, label, range }: { color: string; label: string; range: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2.5 text-slate-800">
        <span
          className="h-3 w-3 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}55` }}
        />
        {label}
      </span>
      <span className="text-xs text-slate-500">{range}</span>
    </li>
  );
}
