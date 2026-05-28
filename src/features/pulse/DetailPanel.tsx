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
  const hexLocations = hex ? locations.filter((l) => hex.locationIds.includes(l.id)) : [];
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

  // SVG ring math
  const R = 54;
  const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;

  return (
    <AnimatePresence initial={false}>
      {hex && (
        <motion.section
          key={hex.h3}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full bg-[#05030d] px-6 pb-10 pt-6"
        >
          {/* Header bar */}
          <div className="glass flex items-center justify-between rounded-2xl border border-white/5 px-6 py-4 shadow-[0_20px_60px_-30px_rgba(134,14,255,0.6)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-aqua/80">
                <span className="mr-2 inline-block h-2 w-2 rounded-sm bg-soft-green align-middle" />
                Market overview
              </p>
              <h3 className="mt-1 font-display text-3xl leading-tight text-white">{cluster}</h3>
              <p className="mt-1 text-sm text-white/55">
                {hexLocations.length} {hexLocations.length === 1 ? "property" : "properties"} ·{" "}
                {(hexLocations.length * 1400).toLocaleString()} monthly searches ·{" "}
                {Math.round(hexLocations.length * 880).toLocaleString()} estimated impressions
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md border border-white/15 px-2.5 py-1 text-sm text-white/60 hover:border-ultraviolet hover:text-white"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          {/* 4-up metrics row */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Mention %"
              value={`${mentionPct.toFixed(1)}%`}
              footer={<span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mentionBand.cls}`}>{mentionBand.label}</span>}
            />
            <Metric
              label="Competitor Mention %"
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
              label="Citation %"
              value={`${citationPct.toFixed(1)}%`}
              footer={<span className="text-[11px] text-white/50">Prompts citing brand</span>}
            />
            <Metric
              label="Avg Position"
              value={avgPosition}
              footer={<span className="text-[11px] text-white/50">Where brand is mentioned</span>}
            />
          </div>

          {/* Two-column body: score + prompts/competitors */}
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="glass flex items-center gap-5 rounded-2xl border border-white/5 px-6 py-5">
              <div className="relative h-[140px] w-[140px] shrink-0">
                <div className="absolute inset-0 grid place-items-center">
                  <PulseCircle size={140} color="#3072FC" opacity={0.25} />
                </div>
                <svg viewBox="0 0 140 140" className="absolute inset-0 -rotate-90">
                  <defs>
                    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3072FC" />
                      <stop offset="100%" stopColor="#860EFF" />
                    </linearGradient>
                  </defs>
                  <circle cx="70" cy="70" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
                  <circle
                    cx="70"
                    cy="70"
                    r={R}
                    stroke="url(#ring)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${C}`}
                    style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)" }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="font-display text-4xl text-white">{score}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">/ 100</div>
                  </div>
                </div>
              </div>
              <div className="text-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
                  AI Visibility Score
                </div>
                <p className="mt-2 leading-snug text-white/70">
                  Aggregated mention rate across all assistants for prompts in this area.
                </p>
              </div>
            </div>

            <div className="glass flex flex-col gap-4 rounded-2xl border border-white/5 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
                  Prompts tested
                </p>
                <ul className="thin-scroll mt-2 grid max-h-[220px] grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
                  {allPrompts.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                    >
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[p.status]}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">{p.prompt}</p>
                        <p className="text-[11px] text-white/45">
                          {STATUS_LABEL[p.status]} · {p.assistant}
                          {p.competitor ? ` · ${p.competitor}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
                  Top competitors mentioned instead
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {fallbackCompetitors.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-tech-blue/50 bg-dark-plum px-3 py-1 text-xs text-white"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  const target = hexLocations[0]?.id;
                  if (target) onImproveVisibility?.(target);
                }}
                disabled={!hexLocations[0]}
                className="mt-1 w-full rounded-xl bg-ultraviolet py-3 text-sm font-bold text-white shadow-[0_8px_30px_-8px_rgba(134,14,255,0.9)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-start sm:px-8"
              >
                Improve visibility →
              </button>
            </div>
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
