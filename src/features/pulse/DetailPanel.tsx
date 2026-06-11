import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HexCell, Location, PromptStatus } from "./types";
import { COMPETITORS } from "./mockData";

interface Props {
  hex: HexCell | null;
  locations: Location[];
  onClose: () => void;
}

type TabKey = "competitors" | "locations" | "prompts";

export function DetailPanel({ hex, locations, onClose }: Props) {
  const [tab, setTab] = useState<TabKey>("competitors");

  const hexLocations = hex ? locations.filter((l) => hex.locationIds.includes(l.id)) : [];
  const score = hex ? Math.round(hex.intensity) : 0;
  const cluster = hex?.cluster ?? "";
  const firstLoc = hexLocations[0];
  const city = firstLoc?.city ?? cluster;
  const postcode = (firstLoc?.cluster || city || "").slice(0, 3).toUpperCase();
  const allPromptsFull = hexLocations.flatMap((l) => l.prompts);

  const totalPrompts = allPromptsFull.length || 1;
  const mentionPct = score;
  const competitorPct = Math.round(
    (allPromptsFull.filter((p) => p.status === "competitor_higher" || p.competitor).length /
      totalPrompts) *
      100,
  );
  const citationPct = Math.max(2, Math.round(mentionPct * 0.22));
  const avgPosition = (1 + (100 - mentionPct) / 28).toFixed(2);
  const sovDenom = mentionPct + competitorPct;
  const shareOfVoice = sovDenom > 0 ? ((mentionPct / sovDenom) * 100).toFixed(1) : "0.0";

  const brandName = "Halfords - Autocentre";
  const competitorRows = COMPETITORS.slice(0, 4).map((name, i) => {
    const m = Math.max(5, mentionPct - (i + 1) * 15);
    const pos = (avgPositionForRank(i + 2)).toFixed(2);
    return { name, mention: m, position: pos, rank: i + 2 };
  });

  return (
    <AnimatePresence initial={false}>
      {hex && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-y-0 left-[72px] right-0 z-20 bg-black/10"
          />
          <motion.section
            key={hex.h3}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-[72px] right-0 bottom-0 z-30 max-h-[78vh] overflow-y-auto rounded-t-3xl bg-white px-8 pb-8 pt-6 text-slate-900 shadow-[0_-30px_80px_-20px_rgba(15,8,40,0.25)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">{city}</h2>
                  {postcode && (
                    <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                      {postcode}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {hexLocations.length} {hexLocations.length === 1 ? "store" : "stores"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            {/* KPI tiles */}
            <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
              <Kpi label="Mention Rate" value={`${mentionPct.toFixed(1)}%`} />
              <Kpi label="Citation Rate" value={`${citationPct.toFixed(1)}%`} />
              <Kpi label="Share of Voice" value={shareOfVoice} />
              <Kpi label="Avg Position" value={avgPosition} />
            </div>

            {/* Tabs */}
            <div className="mt-8 flex items-center gap-8 border-b border-slate-200">
              <Tab active={tab === "competitors"} onClick={() => setTab("competitors")}>
                Competitors
              </Tab>
              <Tab active={tab === "locations"} onClick={() => setTab("locations")} count={hexLocations.length}>
                Locations
              </Tab>
              <Tab active={tab === "prompts"} onClick={() => setTab("prompts")} count={allPromptsFull.length}>
                Prompt results
              </Tab>
            </div>

            {/* Tab content */}
            {tab === "competitors" && (
              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Mention rate vs competitors
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {brandName} ranks <span className="font-bold text-slate-900">#1</span> in {city}.
                  Sampled <span className="font-bold text-slate-900">{allPromptsFull.length}</span>{" "}
                  prompts in the last 30 days.
                </p>

                <div className="mt-5 overflow-hidden">
                  <div className="grid grid-cols-[2fr_60px_2fr_80px_80px_80px] gap-4 border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    <span>Brand</span>
                    <span>Rank</span>
                    <span>Mention</span>
                    <span className="text-right">Mention %</span>
                    <span className="text-right">Citation %</span>
                    <span className="text-right">Avg Pos</span>
                  </div>

                  {/* Brand row */}
                  <Row
                    name={brandName}
                    color="#7c3aed"
                    rank="#1"
                    mention={mentionPct}
                    mentionLabel={`${mentionPct.toFixed(1)}%`}
                    citation={`${citationPct.toFixed(1)}%`}
                    position={avgPosition}
                    barColor="#7c3aed"
                    isBrand
                  />

                  {competitorRows.map((c) => (
                    <Row
                      key={c.name}
                      name={c.name}
                      color="#cbd5e1"
                      rank={`#${c.rank}`}
                      mention={c.mention}
                      mentionLabel={`${c.mention.toFixed(1)}%`}
                      citation="—"
                      position={c.position}
                      barColor="#cbd5e1"
                    />
                  ))}
                </div>
              </div>
            )}

            {tab === "locations" && (
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {hexLocations.map((loc) => {
                  const m =
                    (loc.prompts.filter((p) => p.status === "mentioned").length /
                      Math.max(1, loc.prompts.length)) *
                    100;
                  return (
                    <div
                      key={loc.id}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                    >
                      <div className="truncate text-sm font-semibold text-slate-900">{loc.name}</div>
                      <div className="mt-0.5 truncate text-[11px] text-slate-500">{loc.cluster}</div>
                      <div className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-600">
                        Mention <span className="font-bold text-slate-900">{m.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "prompts" && (
              <ul className="mt-6 divide-y divide-slate-100">
                {allPromptsFull.slice(0, 30).map((p, i) => (
                  <li key={`${p.prompt}-${i}`} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="truncate text-sm text-slate-800">{p.prompt}</span>
                    <StatusChip status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}

function avgPositionForRank(rank: number) {
  return 1 + (rank - 1) * 1.6 + (rank * rank) / 4;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{value}</div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative -mb-px pb-3 text-sm font-semibold transition ${
        active ? "text-violet-700" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      <span className="flex items-center gap-1.5">
        {children}
        {typeof count === "number" && (
          <span className={`text-xs font-medium ${active ? "text-violet-400" : "text-slate-400"}`}>
            {count}
          </span>
        )}
      </span>
      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-violet-600" />}
    </button>
  );
}

function Row({
  name,
  color,
  rank,
  mention,
  mentionLabel,
  citation,
  position,
  barColor,
  isBrand,
}: {
  name: string;
  color: string;
  rank: string;
  mention: number;
  mentionLabel: string;
  citation: string;
  position: string;
  barColor: string;
  isBrand?: boolean;
}) {
  return (
    <div className="grid grid-cols-[2fr_60px_2fr_80px_80px_80px] items-center gap-4 border-b border-slate-100 py-3 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
        <span className={`truncate ${isBrand ? "font-bold text-violet-700" : "text-slate-800"}`}>
          {name}
        </span>
      </div>
      <span className="text-slate-700">{rank}</span>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, mention))}%`, background: barColor }}
        />
      </div>
      <span className="text-right font-semibold text-slate-900">{mentionLabel}</span>
      <span className="text-right text-slate-500">{citation}</span>
      <span className="text-right text-slate-900">{position}</span>
    </div>
  );
}

function StatusChip({ status }: { status: PromptStatus }) {
  const map: Record<PromptStatus, { label: string; cls: string }> = {
    mentioned: { label: "Mentioned", cls: "bg-violet-100 text-violet-700" },
    competitor_higher: { label: "Competitor", cls: "bg-amber-100 text-amber-700" },
    not_mentioned: { label: "Missed", cls: "bg-slate-100 text-slate-600" },
  };
  const m = map[status];
  return (
    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${m.cls}`}>
      {m.label}
    </span>
  );
}
