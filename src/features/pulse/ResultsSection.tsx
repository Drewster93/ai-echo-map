import { motion } from "framer-motion";
import { useMemo } from "react";
import type { Assistant, Location } from "./types";
import { getCityCompetitorStats } from "./competitorData";

interface Props {
  brand: string;
  locations: Location[];
  assistant: Assistant;
  avgScore: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const ASSISTANT_LABEL: Record<Exclude<Assistant, "all">, string> = {
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
  claude: "Claude",
};

export function ResultsSection({ brand, locations, assistant, avgScore }: Props) {
  const stats = useMemo(() => {
    let totalPrompts = 0;
    let mentioned = 0;
    let competitorHigher = 0;
    let notMentioned = 0;
    const byAssistant: Record<string, { total: number; mentioned: number }> = {};
    const competitorWins = new Map<string, number>();

    for (const l of locations) {
      for (const p of l.prompts) {
        totalPrompts++;
        const a = p.assistant;
        byAssistant[a] = byAssistant[a] ?? { total: 0, mentioned: 0 };
        byAssistant[a].total++;
        if (p.status === "mentioned") {
          mentioned++;
          byAssistant[a].mentioned++;
        } else if (p.status === "competitor_higher") {
          competitorHigher++;
          if (p.competitor)
            competitorWins.set(p.competitor, (competitorWins.get(p.competitor) ?? 0) + 1);
        } else {
          notMentioned++;
        }
      }
    }

    const mentionRate = totalPrompts ? (mentioned / totalPrompts) * 100 : 0;
    const brandWins = mentioned;
    const sovDenom = brandWins + competitorHigher;
    const shareOfVoice = sovDenom ? (brandWins / sovDenom) * 100 : 0;

    const cityStats = Array.from(getCityCompetitorStats(locations).values());

    const topCompetitor = Array.from(competitorWins.entries()).sort((a, b) => b[1] - a[1])[0];

    const assistantRows = (Object.keys(byAssistant) as Array<Exclude<Assistant, "all">>)
      .map((key) => ({
        key,
        label: ASSISTANT_LABEL[key] ?? key,
        rate: byAssistant[key].total
          ? (byAssistant[key].mentioned / byAssistant[key].total) * 100
          : 0,
        total: byAssistant[key].total,
      }))
      .sort((a, b) => b.rate - a.rate);

    return {
      totalPrompts,
      mentioned,
      competitorHigher,
      notMentioned,
      mentionRate,
      shareOfVoice,
      cityStats,
      topCompetitor,
      assistantRows,
    };
  }, [locations]);

  const assistantContext =
    assistant === "all" ? "across all assistants" : `on ${ASSISTANT_LABEL[assistant]}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="relative z-20 mx-auto w-full max-w-7xl bg-white px-6 py-20 text-[#260e5a]"
    >
      <header className="mb-10 flex flex-col gap-2">
        <span className="font-display text-[10px] uppercase tracking-[0.3em] text-[#260e5a]/80">
          Pulse Report
        </span>
        <h2 className="font-display text-4xl text-[#260e5a] md:text-5xl">
          How {brand} shows up in AI answers
        </h2>
        <p className="max-w-2xl text-sm text-[#260e5a]/60">
          Aggregated from {stats.totalPrompts.toLocaleString()} prompts {assistantContext},
          across {stats.cityStats.length} cities in the last 7 days.
        </p>
      </header>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Share of Voice"
          value={`${stats.shareOfVoice.toFixed(1)}%`}
          hint={`vs ${stats.competitorHigher} competitor wins`}
          accent
        />
        <Kpi
          label="Mention Rate"
          value={`${stats.mentionRate.toFixed(1)}%`}
          hint={`${stats.mentioned}/${stats.totalPrompts} prompts`}
        />
        <Kpi
          label="Avg Visibility"
          value={`${avgScore.toFixed(0)}`}
          hint="0–100 across locations"
        />
        <Kpi
          label="Top Competitor"
          value={stats.topCompetitor?.[0] ?? "—"}
          hint={
            stats.topCompetitor ? `${stats.topCompetitor[1]} wins over ${brand}` : "No wins logged"
          }
        />
      </div>

      {/* Breakdown grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Mention rate by assistant" className="lg:col-span-2">
          <div className="flex flex-col gap-3">
            {stats.assistantRows.map((row) => (
              <div key={row.key} className="flex items-center gap-4">
                <div className="w-24 text-sm text-[#260e5a]/80">{row.label}</div>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#260e5a]/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${Math.max(2, row.rate)}%`,
                      background:
                        "linear-gradient(90deg, #4B1A99 0%, #860EFF 60%, #C026FF 100%)",
                      boxShadow: "0 0 12px rgba(134,14,255,0.45)",
                    }}
                  />
                </div>
                <div className="w-20 text-right font-display text-sm tabular-nums text-[#260e5a]">
                  {row.rate.toFixed(0)}%
                </div>
                <div className="hidden w-16 text-right text-[11px] text-[#260e5a]/40 md:block">
                  {row.total} pr.
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Prompt outcome split */}
        <Panel title="Prompt outcomes">
          <OutcomeBar
            segments={[
              { label: "Mentioned", value: stats.mentioned, color: "#3DDC97" },
              {
                label: "Competitor higher",
                value: stats.competitorHigher,
                color: "#C026FF",
              },
              { label: "Not mentioned", value: stats.notMentioned, color: "#2A1452" },
            ]}
            total={stats.totalPrompts}
          />
        </Panel>

      {/* City breakdown */}
      <div className="mt-6">
        <Panel title="City performance">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {stats.cityStats.map((c) => {
              const rate = c.totalPrompts ? (c.userMentioned / c.totalPrompts) * 100 : 0;
              return (
                <div
                  key={c.city}
                  className="rounded-xl border border-[#260e5a]/10 bg-[#260e5a]/[0.03] p-4"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="font-display text-lg text-[#260e5a]">{c.city}</div>
                    <div className="font-display text-xl tabular-nums text-[#4B1A99]">
                      {rate.toFixed(0)}%
                    </div>
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-[#260e5a]/40">
                    Mention rate
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-[#260e5a]/60">
                    <span>{c.userMentioned}/{c.totalPrompts} prompts</span>
                    <span className="text-[#260e5a]/40">
                      {c.leader ? `vs ${c.leader}` : "no rival"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </motion.section>
  );
}

function Kpi({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
function Kpi({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border border-[#260e5a]/10 bg-[#260e5a]/[0.03] p-5"
      style={
        accent
          ? {
              borderColor: "rgba(134,14,255,0.35)",
              boxShadow: "0 0 32px rgba(134,14,255,0.18)",
            }
          : undefined
      }
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#260e5a]/60">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl text-[#260e5a]">{value}</div>
      {hint && <div className="mt-1 text-xs text-[#260e5a]/50">{hint}</div>}
    </div>
  );
}
}
function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[#260e5a]/10 bg-[#260e5a]/[0.03] p-5 ${className}`}>
      <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[#260e5a]/60">
        {title}
      </div>
      {children}
    </div>
  );
}

function OutcomeBar({
  segments,
  total,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5">
        {segments.map((s) => {
          const pct = total ? (s.value / total) * 100 : 0;
          if (pct <= 0) return null;
          return (
            <div
              key={s.label}
              style={{
                width: `${pct}%`,
                background: s.color,
                boxShadow: `0 0 12px ${s.color}55`,
              }}
            />
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((s) => {
          const pct = total ? (s.value / total) * 100 : 0;
          return (
            <div key={s.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
                />
                {s.label}
              </div>
              <div className="font-display tabular-nums text-white">
                {pct.toFixed(0)}%
                <span className="ml-2 text-xs text-white/40">{s.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
