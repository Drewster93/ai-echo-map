import { useState, type ReactNode } from "react";

function brandToDomain(brand: string): string {
  const slug = brand.trim().toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9-]/g, "");
  return `${slug}.com`;
}

function BrandMark({ brand }: { brand: string }) {
  const [errored, setErrored] = useState(false);
  const initial = brand.trim().charAt(0).toUpperCase() || "?";
  if (!brand || errored) {
    return (
      <div className="mt-1 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-ultraviolet to-tech-blue text-sm font-bold text-white shadow-[0_0_24px_rgba(134,14,255,0.6)]">
        {initial}
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${brandToDomain(brand)}&sz=128`}
      alt={`${brand} logo`}
      className="mt-1 h-10 w-10 rounded-xl object-contain bg-white p-1 border border-[#1a0d3d]/10"
      onError={() => setErrored(true)}
    />
  );
}

interface Props {
  brand: string;
  onSwitch: () => void;
  markets: number;
  properties: number;
  quarterLabel?: string;
  scopeLabel?: string;
  right?: ReactNode;
}

export function TopHeader({
  brand,
  onSwitch,
  markets,
  properties,
  quarterLabel = "Q2 2026",
  scopeLabel,
  right,
}: Props) {
  return (
    <header className="absolute inset-x-4 top-4 z-30 rounded-2xl border border-white/40 bg-white/70 px-6 py-4 shadow-[0_8px_32px_rgba(15,8,40,0.12)] backdrop-blur-xl saturate-150">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-ultraviolet">
              <span className="text-[#1a0d3d]/40">◆</span>
              <span>GEO Pulse</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="font-display text-2xl leading-tight text-[#1a0d3d]">{brand}</h1>
              <button
                onClick={onSwitch}
                className="rounded-full border border-[#1a0d3d]/15 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#1a0d3d]/60 transition hover:border-[#1a0d3d]/30 hover:text-[#1a0d3d]"
              >
                switch
              </button>
              <Chip dotColor="#34c759" label={`${markets} ${markets === 1 ? "market" : "markets"}`} />
              <Chip dotColor="#34c759" label={`${properties} ${properties === 1 ? "property" : "properties"}`} />
            </div>
            <p className="mt-1.5 text-xs text-[#1a0d3d]/55">
              Click any pin to inspect city metrics. Zoom in past level 9 to view individual properties.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {right}
          <MentionLegendChip />
        </div>
      </div>
    </header>
  );
}

function Chip({ dotColor, label }: { dotColor: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#1a0d3d]/10 bg-[#1a0d3d]/[0.04] px-3 py-1 text-xs font-medium text-[#1a0d3d]/85">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
      />
      {label}
    </span>
  );
}

function MentionLegendChip() {
  return (
    <div className="flex items-center gap-3 rounded-full border border-[#1a0d3d]/10 bg-[#1a0d3d]/[0.04] px-4 py-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a0d3d]/55">
        Mention %
      </span>
      <span className="flex items-center gap-1.5 text-xs text-[#1a0d3d]">
        <Dot color="#e53935" /> &lt;40
      </span>
      <span className="flex items-center gap-1.5 text-xs text-[#1a0d3d]">
        <Dot color="#f5c518" /> 40–60
      </span>
      <span className="flex items-center gap-1.5 text-xs text-[#1a0d3d]">
        <Dot color="#34c759" /> &gt;60
      </span>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="h-2.5 w-2.5 rounded-full"
      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
    />
  );
}
