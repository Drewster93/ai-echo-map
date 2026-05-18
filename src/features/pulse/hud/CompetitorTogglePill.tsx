interface Props {
  active: boolean;
  onToggle: () => void;
}

export function CompetitorTogglePill({ active, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      className={`glass absolute right-5 top-[72px] z-20 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition hover:translate-y-[-1px] ${
        active ? "text-aqua ring-1 ring-aqua/60" : "text-white/85"
      }`}
    >
      <span
        className={`grid h-4 w-4 place-items-center rounded-full border ${
          active ? "border-aqua bg-aqua/20" : "border-white/40"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full transition ${
            active ? "bg-aqua" : "bg-white/40"
          }`}
        />
      </span>
      Competitor reveal
    </button>
  );
}
