import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { Location } from "../types";
import { PillSelect } from "../hud/PillSelect";
import { buildLocationReport, formatUsd, type LocationReport, type PromptRow } from "./reportData";

interface Props {
  location: Location;
  brand: string;
  onBack: () => void;
  allLocations?: Location[];
  onSelectLocation?: (id: string) => void;
  roleSwitcher?: React.ReactNode;
}

export function LocationReportView({ location, brand, onBack, allLocations, onSelectLocation, roleSwitcher }: Props) {
  const report = useMemo(() => buildLocationReport(location, brand), [location, brand]);
  const brandFirst = brand.split(/\s+/)[0] || brand;

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "head-to-head", label: "Head-to-Head" },
    { id: "by-topic", label: "By Topic" },
    { id: "top-wins", label: "Top Wins" },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen w-full bg-[#fafaf7] text-[#1a0d3d]"
    >
      {/* Dark top nav bar */}
      <div className="sticky top-0 z-30 w-full border-b border-white/5 bg-[#1a0d3d] text-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-8 py-5">
          <div className="flex items-center gap-4">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/55">
                <span className="text-[#a78bfa]">◆</span> Property Dashboard
                <span className="text-white/30">·</span>
                <span className="text-white/55">Q2 2026</span>
              </p>
              <h1 className="mt-1 font-display text-lg font-bold leading-tight text-white">
                {brand} AI Search Presence · {report.property.name}
              </h1>
            </div>
          </div>
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65 transition hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1080px] px-8 py-12">
        {allLocations && onSelectLocation && allLocations.length > 1 && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1a0d3d]/55">
              Viewing property
            </span>
            <PillSelect
              ariaLabel="Switch property"
              value={location.id}
              onChange={onSelectLocation}
              options={allLocations.map((l) => ({
                value: l.id,
                label: `${l.name} · ${l.city}`,
              }))}
            />
          </div>
        )}
        {/* Dark hero card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0d3d] via-[#22114d] to-[#0f0628] px-10 py-10 text-white shadow-[0_20px_60px_-20px_rgba(15,8,40,0.4)]">
          <div className="pointer-events-none absolute right-0 top-1/2 h-[420px] w-[420px] -translate-y-1/2 translate-x-1/4 rounded-full bg-[#22c55e]/15 blur-[100px]" />
          <div className="relative">
            <StatusBanner status={report.status} />
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] text-white">
              {report.property.name}
            </h1>
            <p className="mt-3 text-sm text-white/55">
              {report.property.address} · {report.property.group}
            </p>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/85">
              {report.narrative}
            </p>
          </div>
        </div>

        <Section
          id="overview"
          eyebrow="Performance overview"
          title={`How you compare to competitors in ${report.property.city}`}
          caption={
            <>
              Each tile shows {brandFirst}'s metric and the gap versus the competitive set (
              {report.competitorSet.join(", ")}).
            </>
          }
        >
          <PerformanceTiles report={report} brandFirst={brandFirst} />
        </Section>

        <Section
          id="head-to-head"
          eyebrow="Head-to-head"
          title="Share of voice in AI answers"
          caption={
            <>
              When someone asks ChatGPT, Claude, Gemini or Perplexity about luxury hotels in{" "}
              {report.property.city} — how often does {report.property.name} appear vs. its
              competitive set?
            </>
          }
        >
          <HeadToHead report={report} brandFirst={brandFirst} />
        </Section>

        <Section
          id="by-topic"
          eyebrow="Where the gap lives"
          title="Performance by guest intent"
          caption={
            <>
              {report.property.name}'s strength is branded search — guests already looking for{" "}
              {brandFirst} find it. The gap is in discovery: prompts where guests describe their
              need (luxury, business, spa, wedding) and AI suggests other hotels.
            </>
          }
        >
          <IntentBreakdown report={report} brandFirst={brandFirst} />
        </Section>

        <Section
          eyebrow="Action list"
          title="Top 7 opportunities, ranked by monthly value lost"
          caption={
            <>
              Monthly value lost = (competitor mention gap %) × (estimated monthly search value).
              These are the prompts where AI is steering guests to your competitors and you're not
              in the conversation.
            </>
          }
        >
          <ActionTable report={report} brandFirst={brandFirst} />
        </Section>

        <Section
          id="top-wins"
          eyebrow="What's working"
          title={`Prompts where ${report.property.name} holds its ground`}
          caption={
            <>
              {report.property.name} wins explicitly branded queries and head-to-head comparisons.
              The challenge isn't reputation — it's discoverability when guests don't yet have the
              brand in mind.
            </>
          }
        >
          <WhatsWorking winners={report.winners} brandFirst={brandFirst} />
        </Section>

        <Section
          eyebrow="Recommended next steps"
          title="Three moves to close the gap"
        >
          <NextSteps report={report} brandFirst={brandFirst} />
        </Section>

        <p className="mt-20 border-t border-[#1a0d3d]/10 pt-6 text-xs text-[#1a0d3d]/50">
          Data: AthenaHQ AI Search Presence · {report.totalPromptsMonitored} prompts monitored
          across ChatGPT, Claude, Gemini, Perplexity · Updated {report.updatedLabel}
        </p>
      </div>
    </motion.div>
  );
}

/* ---------------- Section wrapper ---------------- */

function Section({
  id,
  eyebrow,
  title,
  caption,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  caption?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-28">
      <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-ultraviolet">
        <span className="h-1.5 w-1.5 rounded-full bg-ultraviolet" />
        {eyebrow}
      </div>
      <h2 className="font-display text-3xl leading-tight text-[#1a0d3d]">{title}</h2>
      {caption && (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#1a0d3d]/65">{caption}</p>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}


/* ---------------- Status banner ---------------- */

function StatusBanner({ status }: { status: LocationReport["status"] }) {
  const config = {
    underperforming: { label: "Underperforming · Action required", dot: "#d97706", bg: "#fef3c7", text: "#92400e" },
    critical: { label: "Critical · Immediate action", dot: "#dc2626", bg: "#fee2e2", text: "#991b1b" },
    healthy: { label: "Healthy · On track", dot: "#16a34a", bg: "#dcfce7", text: "#166534" },
  }[status];
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
      style={{ background: config.bg, color: config.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: config.dot }} />
      {config.label}
    </div>
  );
}

/* ---------------- Property header ---------------- */

function PropertyHeader({ report }: { report: LocationReport }) {
  return (
    <div className="mt-6">
      <h1 className="font-display text-5xl leading-[1.05] text-[#1a0d3d]">
        {report.property.name}
      </h1>
      <p className="mt-3 text-sm text-[#1a0d3d]/55">
        {report.property.group} · {report.property.address}
      </p>
      <p className="mt-6 max-w-3xl text-base leading-relaxed text-[#1a0d3d]/75">
        {report.narrative}
      </p>
    </div>
  );
}

/* ---------------- Performance tiles ---------------- */

function PerformanceTiles({ report, brandFirst }: { report: LocationReport; brandFirst: string }) {
  const mentionGap = report.mentionRate - report.competitorMentionRate;
  const citationGap = report.citationRate - report.competitorCitationRate;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Tile
        label="Mention rate"
        value={`${report.mentionRate}%`}
        sub={`${fmtPp(mentionGap)} vs competitors (${report.competitorMentionRate}%)`}
        tone={mentionGap < 0 ? "down" : "up"}
      />
      <Tile
        label="Citation rate"
        value={`${report.citationRate}%`}
        sub={`${fmtPp(citationGap)} vs competitors (${report.competitorCitationRate}%)`}
        tone={citationGap < 0 ? "down" : "up"}
      />
      <Tile
        label="Unbranded mention"
        value={`${report.unbrandedMentionPct}%`}
        sub={`When guests don't say "${brandFirst}"`}
        tone="neutral"
      />
      <Tile
        label="Branded mention"
        value={`${report.brandedMentionPct}%`}
        sub={`When guests ask for ${brandFirst} specifically`}
        tone="up"
      />
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "up" | "down" | "neutral";
}) {
  const subColor =
    tone === "down" ? "text-rose-600" : tone === "up" ? "text-emerald-600" : "text-[#1a0d3d]/50";
  return (
    <div className="rounded-2xl border border-[#1a0d3d]/8 bg-white p-5 shadow-[0_1px_3px_rgba(15,8,40,0.04)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1a0d3d]/45">{label}</p>
      <p className="mt-3 font-display text-4xl leading-none text-[#1a0d3d]">{value}</p>
      <p className={`mt-3 text-xs font-medium ${subColor}`}>{sub}</p>
    </div>
  );
}

/* ---------------- Head-to-head ---------------- */

function HeadToHead({ report, brandFirst }: { report: LocationReport; brandFirst: string }) {
  const brandPct = report.mentionRate;
  const compPct = report.competitorMentionRate;
  const gap = brandPct - compPct;
  return (
    <div className="rounded-2xl border border-[#1a0d3d]/8 bg-white p-7 shadow-[0_1px_3px_rgba(15,8,40,0.04)]">
      <Row label={report.property.name} pct={brandPct} color="#260e5a" labelRight={`${brandPct}%`} />
      <div className="mt-5">
        <Row label="Competitors" pct={compPct} color="#cbd5e1" labelRight={`${compPct}%`} dark />
      </div>
      <div className="mt-7 flex items-baseline gap-3 border-t border-[#1a0d3d]/8 pt-5">
        <span className="text-xs uppercase tracking-[0.22em] text-[#1a0d3d]/50">
          Share of voice gap
        </span>
        <span
          className={`font-display text-2xl ${gap < 0 ? "text-rose-600" : "text-emerald-600"}`}
        >
          {fmtPp(gap)}
        </span>
        <span className="text-xs text-[#1a0d3d]/45">vs {brandFirst.toLowerCase()}.com competitors</span>
      </div>
    </div>
  );
}

function Row({
  label,
  pct,
  color,
  labelRight,
  dark = false,
}: {
  label: string;
  pct: number;
  color: string;
  labelRight: string;
  dark?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className={dark ? "text-[#1a0d3d]/60" : "font-semibold text-[#1a0d3d]"}>{label}</span>
        <span className="font-display text-lg text-[#1a0d3d]">{labelRight}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a0d3d]/6">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ---------------- Intent breakdown ---------------- */

function IntentBreakdown({ report, brandFirst }: { report: LocationReport; brandFirst: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1a0d3d]/8 bg-white shadow-[0_1px_3px_rgba(15,8,40,0.04)]">
      {report.intents.map((intent, i) => {
        const gap = intent.competitorPct - intent.brandPct;
        return (
          <div
            key={intent.name}
            className={`grid grid-cols-[1fr_minmax(280px,1.4fr)_80px] items-center gap-6 px-6 py-5 ${
              i > 0 ? "border-t border-[#1a0d3d]/6" : ""
            }`}
          >
            <div>
              <p className="font-display text-lg text-[#1a0d3d]">{intent.name}</p>
              <p className="mt-1 text-xs text-[#1a0d3d]/50">
                {intent.promptCount} prompt{intent.promptCount !== 1 ? "s" : ""} ·{" "}
                {intent.monthlyValueUsd === 0 ? "—" : `${formatUsd(intent.monthlyValueUsd)}/mo`} at stake
              </p>
            </div>
            <div className="space-y-2">
              <MiniBar label={brandFirst} pct={intent.brandPct} color="#260e5a" />
              <MiniBar label="Competitors" pct={intent.competitorPct} color="#cbd5e1" muted />
            </div>
            <div className="text-right">
              <span
                className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                  gap > 0
                    ? "bg-rose-50 text-rose-700"
                    : gap < 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-[#1a0d3d]/5 text-[#1a0d3d]/60"
                }`}
              >
                {gap > 0 ? "+" : ""}
                {gap}pp
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniBar({
  label,
  pct,
  color,
  muted = false,
}: {
  label: string;
  pct: number;
  color: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-24 text-xs ${muted ? "text-[#1a0d3d]/55" : "font-medium text-[#1a0d3d]"}`}>
        {label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1a0d3d]/6">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-10 text-right text-xs font-medium text-[#1a0d3d]/70">{pct}%</span>
    </div>
  );
}

/* ---------------- Action table ---------------- */

function ActionTable({ report, brandFirst }: { report: LocationReport; brandFirst: string }) {
  const rows = report.prompts
    .filter((p) => p.competitorPct > p.brandPct && p.monthlyValueUsd > 0)
    .slice(0, 7)
    .map((p) => ({
      ...p,
      gap: p.competitorPct - p.brandPct,
      lost: Math.round(((p.competitorPct - p.brandPct) / 100) * p.monthlyValueUsd),
    }));
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1a0d3d]/8 bg-white shadow-[0_1px_3px_rgba(15,8,40,0.04)]">
      <div className="grid grid-cols-[40px_minmax(260px,2fr)_90px_110px_90px_140px] gap-4 border-b border-[#1a0d3d]/8 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1a0d3d]/45">
        <span>#</span>
        <span>Prompt</span>
        <span className="text-right">{brandFirst}</span>
        <span className="text-right">Competitors</span>
        <span className="text-right">Gap</span>
        <span className="text-right">Monthly value lost</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.prompt}
          className="grid grid-cols-[40px_minmax(260px,2fr)_90px_110px_90px_140px] items-center gap-4 px-6 py-4 text-sm transition hover:bg-[#1a0d3d]/[0.02]"
          style={{ borderTop: i > 0 ? "1px solid rgba(26,13,61,0.04)" : "none" }}
        >
          <span className="font-display text-base text-[#1a0d3d]/40">{i + 1}</span>
          <div>
            <p className="text-[#1a0d3d]">{r.prompt}</p>
            <p className="mt-0.5 text-xs text-[#1a0d3d]/45">{r.category}</p>
          </div>
          <span className="text-right text-[#1a0d3d]/55">{r.brandPct}%</span>
          <span className="text-right font-medium text-[#1a0d3d]">{r.competitorPct}%</span>
          <span className="text-right">
            <span className="inline-block rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
              +{r.gap}pp
            </span>
          </span>
          <span className="text-right">
            <span className="font-display text-base text-[#1a0d3d]">{formatUsd(r.lost)}</span>
            <span className="ml-1 text-xs text-[#1a0d3d]/45">/ mo</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- What's working ---------------- */

function WhatsWorking({ winners, brandFirst }: { winners: PromptRow[]; brandFirst: string }) {
  if (winners.length === 0) {
    return (
      <p className="text-sm italic text-[#1a0d3d]/55">No prompts where {brandFirst} currently leads.</p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {winners.map((w) => (
        <div
          key={w.prompt}
          className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 shadow-[0_1px_3px_rgba(15,8,40,0.04)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              {w.category}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Mention {w.brandPct}%
            </span>
          </div>
          <p className="mt-3 font-display text-xl leading-snug text-[#1a0d3d]">"{w.prompt}"</p>
          <p className="mt-3 text-xs text-[#1a0d3d]/55">
            vs competitors {w.competitorPct}%
            {w.citedDomain ? ` · AI cites ${w.citedDomain}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Next steps ---------------- */

function NextSteps({ report, brandFirst }: { report: LocationReport; brandFirst: string }) {
  const top = report.prompts[0];
  const cards = [
    {
      kind: "Content",
      title: `Publish "${report.property.city} luxury hotel" pages`,
      body: `The biggest miss — "${top?.prompt}" — generates ${formatUsd(top?.monthlyValueUsd ?? 0)}/mo of value and ${top?.brandPct ?? 0}% ${brandFirst} presence. Long-form, structured content on ${report.brandDomain}/${report.property.city.toLowerCase()} targeting these exact phrases is the highest-leverage fix.`,
    },
    {
      kind: "PR & Citations",
      title: "Build third-party citations",
      body: `Competitors win partly because they're cited in Condé Nast, Forbes Travel, Tripadvisor "best of" lists, and travel guides. Concentrated PR placements in the sources AI models index will lift mention rate across all topics simultaneously.`,
    },
    {
      kind: "Category Expansion",
      title: "Target spa, business, weddings",
      body: `Four sub-categories — Spa, Business Travel, Suites, Weddings — currently sit at 0% mention. Each is a distinct audience requiring dedicated landing pages, schema markup, and partnership content (e.g. wedding venue directories, MICE platforms).`,
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {cards.map((c, i) => (
        <div
          key={c.title}
          className="rounded-2xl border border-[#1a0d3d]/8 bg-white p-6 shadow-[0_1px_3px_rgba(15,8,40,0.04)]"
        >
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl text-ultraviolet">
              0{i + 1}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1a0d3d]/45">
              · {c.kind}
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl leading-snug text-[#1a0d3d]">{c.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#1a0d3d]/65">{c.body}</p>
        </div>
      ))}
    </div>
  );
}

function fmtPp(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}pp`;
}
