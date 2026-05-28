import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HexCell, Location } from "./types";
import { COMPETITORS } from "./mockData";

interface Props {
  hex: HexCell | null;
  locations: Location[];
  onClose: () => void;
}

export function DetailPanel({ hex, locations, onClose }: Props) {
  const hexLocations = hex ? locations.filter((l) => hex.locationIds.includes(l.id)) : [];
  const score = hex ? Math.round(hex.intensity) : 0;
  const cluster = hex?.cluster ?? "";
  const allPromptsFull = hexLocations.flatMap((l) => l.prompts);
  const competitorsMentioned = Array.from(
    new Set(allPromptsFull.map((p) => p.competitor).filter(Boolean) as string[]),
  ).slice(0, 4);
  const _fallbackCompetitors = competitorsMentioned.length
    ? competitorsMentioned
    : COMPETITORS.slice(0, 3);

  const totalPrompts = allPromptsFull.length || 1;
  const mentionPct = score;
  const competitorPct = Math.round(
    (allPromptsFull.filter((p) => p.status === "competitor_higher" || p.competitor).length /
      totalPrompts) *
      100,
  );
  const gapPp = mentionPct - competitorPct;
  const citationPct = Math.max(2, Math.round(mentionPct * 0.22));
  const avgPosition = (1 + (100 - mentionPct) / 28).toFixed(1);

  const mentionBand =
    mentionPct >= 60 ? { label: "Strong", cls: "bg-[#22c55e]/25 text-[#15803d]" }
    : mentionPct >= 40 ? { label: "Moderate", cls: "bg-[#eab308]/25 text-[#a16207]" }
    : { label: "Low", cls: "bg-[#f97316]/25 text-[#c2410c]" };

  return (
    <AnimatePresence initial={false}>
      {hex && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-y-0 left-[72px] right-0 z-20 bg-black/30 backdrop-blur-[1px]"
          />
          <motion.section
            key={hex.h3}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-[72px] right-0 bottom-0 z-30 rounded-t-3xl border-t border-white/15 bg-[#260e5a] px-6 pb-8 pt-6 text-white shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.25)]"
          >
            <div className="w-full">

              {/* Header bar */}
              <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-6 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                    <span className="mr-2 inline-block h-2 w-2 rounded-sm bg-white align-middle" />
                    Market overview
                  </p>
                  <h3 className="mt-1 font-display text-2xl leading-tight text-white">{cluster}</h3>
                  <p className="mt-1 text-sm text-white/65">
                    {hexLocations.length} {hexLocations.length === 1 ? "property" : "properties"} ·{" "}
                    {(hexLocations.length * 1400).toLocaleString()} monthly searches ·{" "}
                    {Math.round(hexLocations.length * 880).toLocaleString()} estimated impressions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="rounded-md border border-white/25 px-2.5 py-1 text-sm text-white/70 hover:border-white hover:text-white"
                    aria-label="Close panel"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 4-up metrics row */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric
                  label="Mention Rate"
                  value={`${mentionPct.toFixed(1)}%`}
                  footer={<span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mentionBand.cls}`}>{mentionBand.label}</span>}
                />
                <Metric
                  label="Competitor Mention"
                  value={`${competitorPct.toFixed(1)}%`}
                  footer={
                    <span className="text-[11px] text-[#260e5a]/65">
                      Gap: <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${gapPp >= 0 ? "bg-[#22c55e]/25 text-[#15803d]" : "bg-[#f97316]/25 text-[#c2410c]"}`}>
                        {gapPp >= 0 ? "+" : ""}{gapPp.toFixed(1)}pp
                      </span>
                    </span>
                  }
                />
                <Metric
                  label="Citation Rate"
                  value={`${citationPct.toFixed(1)}%`}
                  footer={<span className="text-[11px] text-[#260e5a]/55">Prompts citing brand</span>}
                />
                <Metric
                  label="Avg Position"
                  value={avgPosition}
                  footer={<span className="text-[11px] text-[#260e5a]/55">Where brand is mentioned</span>}
                />
              </div>

              {/* Properties grouped by city */}
              {hexLocations.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 border-b border-white/15 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                      Properties
                    </span>
                    <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {hexLocations.length}
                    </span>
                  </div>

                  <div className="mt-3 max-h-[260px] space-y-4 overflow-y-auto pr-1">
                    {Object.entries(
                      hexLocations.reduce<Record<string, Location[]>>((acc, loc) => {
                        (acc[loc.city] ??= []).push(loc);
                        return acc;
                      }, {}),
                    ).map(([city, locs]) => (
                      <div key={city}>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">
                            {city}
                          </span>
                          <span className="text-[10px] text-white/45">
                            {locs.length} {locs.length === 1 ? "property" : "properties"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {locs.map((loc) => {
                            const mention =
                              (loc.prompts.filter((p) => p.status === "mentioned").length /
                                Math.max(1, loc.prompts.length)) *
                              100;
                            const confidence =
                              loc.prompts.length >= 8
                                ? { label: "High confidence", cls: "bg-[#22c55e]/25 text-[#15803d]" }
                                : loc.prompts.length >= 4
                                  ? { label: "Medium", cls: "bg-[#eab308]/25 text-[#a16207]" }
                                  : { label: "Low", cls: "bg-[#f97316]/25 text-[#c2410c]" };
                            return (
                              <div
                                key={loc.id}
                                className="rounded-xl border border-[#260e5a]/10 bg-[#260e5a]/[0.03] px-3 py-2.5"
                              >
                                <div className="truncate text-sm font-semibold text-[#260e5a]">
                                  {loc.name}
                                </div>
                                <div className="mt-0.5 truncate text-[11px] text-[#260e5a]/60">
                                  {loc.cluster}
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#260e5a]/10 pt-2">
                                  <span className="text-[11px] text-[#260e5a]/70">
                                    Mention{" "}
                                    <span className="font-bold text-[#260e5a]">
                                      {mention.toFixed(1)}%
                                    </span>
                                  </span>
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${confidence.cls}`}
                                  >
                                    {confidence.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>

        </>
      )}
    </AnimatePresence>
  );
}




function Metric({
  label,
  value,
  footer,
}: {
  label: string;
  value: string;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#260e5a]/10 bg-[#260e5a]/[0.03] px-3 py-2.5">
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#260e5a]/55">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl leading-none text-[#260e5a]">{value}</div>
      {footer && <div className="mt-1.5">{footer}</div>}
    </div>
  );
}

