interface Props {
  brand: string;
  onSwitch: () => void;
  markets: number;
  properties: number;
  quarterLabel?: string;
}

export function TopHeader({ brand, onSwitch, markets, properties, quarterLabel = "Q2 2026" }: Props) {
  return (
    <header className="absolute inset-x-4 top-4 z-30 rounded-2xl border border-white/40 bg-white/70 px-6 py-4 shadow-[0_8px_32px_rgba(15,8,40,0.12)] backdrop-blur-xl saturate-150">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          {/* logo mark */}
          <div className="mt-1 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-ultraviolet to-tech-blue shadow-[0_0_24px_rgba(134,14,255,0.6)]">
            <div className="h-4 w-4 rotate-45 bg-white/90" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-ultraviolet">
              <span className="text-white/40">◆</span>
              <span>AI Search Presence · {quarterLabel}</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="font-display text-2xl leading-tight text-white">{brand}</h1>
              <button
                onClick={onSwitch}
                className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white/60 transition hover:border-white/30 hover:text-white"
              >
                switch
              </button>
              <Chip dotColor="#34c759" label={`${markets} markets`} />
              <Chip dotColor="#34c759" label={`${properties} properties`} />
            </div>
            <p className="mt-1.5 text-xs text-white/55">
              Click any pin to inspect city metrics. Zoom in past level 9 to view individual properties.
            </p>
          </div>
        </div>

        <MentionLegendChip />
      </div>
    </header>
  );
}

function Chip({ dotColor, label }: { dotColor: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/85">
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
    <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">
        Mention %
      </span>
      <span className="flex items-center gap-1.5 text-xs text-white">
        <Dot color="#e53935" /> &lt;40
      </span>
      <span className="flex items-center gap-1.5 text-xs text-white">
        <Dot color="#f5c518" /> 40–60
      </span>
      <span className="flex items-center gap-1.5 text-xs text-white">
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
