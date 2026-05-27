import type { Location } from "../types";

interface Props {
  brand: string;
  city: string;
  locations: Location[];
  scoreFor: (loc: Location) => number;
}

export function RegionalOverview({ brand, city, locations, scoreFor }: Props) {
  const scored = locations.map((l) => ({ loc: l, score: scoreFor(l) }));
  const avg = scored.reduce((s, x) => s + x.score, 0) / Math.max(1, scored.length);
  const top = [...scored].sort((a, b) => b.score - a.score).slice(0, 3);
  const bottom = [...scored].sort((a, b) => a.score - b.score).slice(0, 3);
  const competitorPct = Math.max(0, Math.min(100, avg * 0.68));

  return (
    <aside className="absolute left-5 top-[150px] z-20 w-[340px] rounded-2xl bg-white p-5 text-slate-900 shadow-[0_20px_60px_-15px_rgba(15,8,40,0.45)]">
      <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-ultraviolet">
        <span className="h-1.5 w-1.5 rounded-full bg-ultraviolet" />
        Regional Overview
      </div>
      <h2 className="font-display text-2xl leading-tight text-slate-900">
        {brand} in {city}
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
        <Metric label="Avg Mention %" value={`${avg.toFixed(1)}%`} />
        <Metric label="Competitor %" value={`${competitorPct.toFixed(1)}%`} />
        <Metric label="Properties" value={String(locations.length)} smallValue />
        <Metric label="Share of voice" value={`${(avg / (avg + competitorPct) * 100 || 0).toFixed(0)}%`} smallValue />
      </div>

      <hr className="my-4 border-slate-200" />

      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
        Top performing
      </p>
      <ul className="space-y-1.5">
        {top.map((t) => (
          <RankRow key={t.loc.id} name={t.loc.name} score={t.score} positive />
        ))}
      </ul>

      <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-rose-700">
        Needs attention
      </p>
      <ul className="space-y-1.5">
        {bottom.map((t) => (
          <RankRow key={t.loc.id} name={t.loc.name} score={t.score} />
        ))}
      </ul>
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

function RankRow({
  name,
  score,
  positive = false,
}: {
  name: string;
  score: number;
  positive?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="truncate text-[#1a0d3d]/80">{name}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        }`}
      >
        {Math.round(score)}%
      </span>
    </li>
  );
}
