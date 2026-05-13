interface Props {
  brand: string;
  onSwitch: () => void;
}

export function BrandPill({ brand, onSwitch }: Props) {
  const initial = brand.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="glass absolute left-5 top-5 z-20 flex items-center gap-3 rounded-full px-3 py-2 pr-4">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-ultraviolet to-tech-blue text-sm font-bold text-white">
        {initial}
      </div>
      <div className="leading-tight">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Brand</p>
        <p className="text-sm font-bold text-white">{brand}</p>
      </div>
      <button
        onClick={onSwitch}
        className="ml-2 text-xs font-medium text-aqua hover:underline"
      >
        switch brand →
      </button>
    </div>
  );
}
