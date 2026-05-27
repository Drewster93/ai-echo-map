interface Props {
  brand: string;
  avgMention: number;
  competitorPct: number;
  avgCitation: number;
  avgPosition: number;
  monthlySearches: number;
  valueCaptured: number;
  narrative: string;
}

export function WorldwideOverview({
  brand,
  avgMention,
  competitorPct,
  avgCitation,
  avgPosition,
  monthlySearches,
  valueCaptured,
  narrative,
}: Props) {
  return (
    <aside className="absolute left-5 top-[150px] z-20 w-[340px] rounded-2xl bg-white p-5 text-slate-900 shadow-[0_20px_60px_-15px_rgba(15,8,40,0.45)]">
      <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-ultraviolet">
        <span className="h-1.5 w-1.5 rounded-full bg-ultraviolet" />
        Worldwide Overview
      </div>
      <h2 className="font-display text-2xl leading-tight text-slate-900">{brand} AI visibility</h2>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
        <Metric label="Avg Mention %" value={`${avgMention.toFixed(1)}%`} />
        <Metric label="Competitor %" value={`${competitorPct.toFixed(1)}%`} />
        <Metric label="Avg Citation %" value={`${avgCitation.toFixed(1)}%`} />
        <Metric label="Avg Position" value={avgPosition.toFixed(1)} />
        <Metric label="Monthly Searches" value={formatNum(monthlySearches)} smallValue />
        <Metric label="Value Captured" value={`${valueCaptured.toFixed(1)}%`} smallValue />
      </div>

      <hr className="my-4 border-slate-200" />
      <p className="text-[13px] leading-relaxed text-slate-600">{narrative}</p>
    </aside>
  );
}

function Metric({
  label,
  value,
  smallValue = false,
}: {
  label: string;
  value: string;
  smallValue?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p
        className={
          "font-display leading-tight text-slate-900 " + (smallValue ? "text-xl" : "text-3xl")
        }
      >
        {value}
      </p>
    </div>
  );
}

function formatNum(n: number): string {
  return new Intl.NumberFormat("de-DE").format(Math.round(n));
}
