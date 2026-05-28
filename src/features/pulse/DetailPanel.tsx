import { useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HexCell, Location } from "./types";
import { COMPETITORS } from "./mockData";
import { PulseCircle } from "./PulseCircle";

interface Props {
  hex: HexCell | null;
  locations: Location[];
  onClose: () => void;
  onImproveVisibility?: (locationId: string) => void;
}

const STATUS_DOT: Record<string, string> = {
  mentioned: "bg-soft-green shadow-[0_0_10px_#DAFFB6]",
  competitor_higher: "bg-orange-uberall shadow-[0_0_10px_#FF5B02]",
  not_mentioned: "border border-white/30 bg-dark-plum",
};
const STATUS_LABEL: Record<string, string> = {
  mentioned: "Mentioned",
  competitor_higher: "Mentioned · competitor ranked higher",
  not_mentioned: "Not mentioned",
};

export function DetailPanel({ hex, locations, onClose, onImproveVisibility }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (hex && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hex?.h3]);
  const score = hex ? Math.round(hex.intensity) : 0;
  const cluster = hex?.cluster ?? "";
  const allPromptsFull = hexLocations.flatMap((l) => l.prompts);
  const allPrompts = allPromptsFull.slice(0, 8);
  const competitorsMentioned = Array.from(
    new Set(allPromptsFull.map((p) => p.competitor).filter(Boolean) as string[]),
  ).slice(0, 4);
  const fallbackCompetitors = competitorsMentioned.length
    ? competitorsMentioned
    : COMPETITORS.slice(0, 3);

  // Derived metrics for the stat row
  const totalPrompts = allPromptsFull.length || 1;
  const mentionPct = score; // aggregated mention rate (0-100)
  const competitorPct = Math.round(
    (allPromptsFull.filter((p) => p.status === "competitor_higher" || p.competitor).length /
      totalPrompts) *
      100,
  );
  const gapPp = mentionPct - competitorPct;
  // Mock-but-deterministic citation rate + avg position derived from score
  const citationPct = Math.max(2, Math.round(mentionPct * 0.22));
  const avgPosition = (1 + (100 - mentionPct) / 28).toFixed(1);

  const mentionBand =
    mentionPct >= 60 ? { label: "Strong", cls: "bg-soft-green/20 text-soft-green" }
    : mentionPct >= 40 ? { label: "Moderate", cls: "bg-yellow-400/15 text-yellow-300" }
    : { label: "Low", cls: "bg-orange-uberall/20 text-orange-uberall" };

  return (
    <AnimatePresence initial={false}>
      {hex && (
        <motion.section
          key={hex.h3}
          className="relative z-10 w-full border-t border-white/10 bg-[#05030d] px-6 pb-8 pt-6"
        >
          {/* Header bar */}
          <div className="glass flex items-center justify-between rounded-2xl border border-white/5 px-6 py-4 shadow-[0_20px_60px_-30px_rgba(134,14,255,0.6)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-aqua/80">
                <span className="mr-2 inline-block h-2 w-2 rounded-sm bg-soft-green align-middle" />
                Market overview
              </p>
              <h3 className="mt-1 font-display text-2xl leading-tight text-white">{cluster}</h3>
              <p className="mt-1 text-sm text-white/55">
                {hexLocations.length} {hexLocations.length === 1 ? "property" : "properties"} ·{" "}
                {(hexLocations.length * 1400).toLocaleString()} monthly searches ·{" "}
                {Math.round(hexLocations.length * 880).toLocaleString()} estimated impressions
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hexLocations[0] && (
                <button
                  onClick={() => onImproveVisibility?.(hexLocations[0].id)}
                  className="rounded-xl bg-ultraviolet px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_30px_-8px_rgba(134,14,255,0.9)] transition hover:translate-y-[-1px]"
                >
                  Improve visibility →
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-md border border-white/15 px-2.5 py-1 text-sm text-white/60 hover:border-ultraviolet hover:text-white"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 4-up metrics row */}
          <div className="mt-4 grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Mention Rate"
              value={`${mentionPct.toFixed(1)}%`}
              footer={<span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mentionBand.cls}`}>{mentionBand.label}</span>}
            />
            <Metric
              label="Competitor Mention"
              value={`${competitorPct.toFixed(1)}%`}
              footer={
                <span className="text-[11px] text-white/60">
                  Gap: <span className={gapPp >= 0 ? "font-bold text-soft-green" : "font-bold text-orange-uberall"}>
                    {gapPp >= 0 ? "+" : ""}{gapPp.toFixed(1)}pp
                  </span>
                </span>
              }
            />
            <Metric
              label="Citation Rate"
              value={`${citationPct.toFixed(1)}%`}
              footer={<span className="text-[11px] text-white/50">Prompts citing brand</span>}
            />
            <Metric
              label="Avg Position"
              value={avgPosition}
              footer={<span className="text-[11px] text-white/50">Where brand is mentioned</span>}
            />
          </div>
        </motion.section>
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
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl leading-none text-white">{value}</div>
      {footer && <div className="mt-1.5">{footer}</div>}
    </div>
  );
}
