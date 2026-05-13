import type { Assistant, TimeRange } from "../types";

interface Props {
  assistant: Assistant;
  setAssistant: (a: Assistant) => void;
  range: TimeRange;
  setRange: (r: TimeRange) => void;
}

const ASSISTANTS: { id: Assistant; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chatgpt", label: "ChatGPT" },
  { id: "perplexity", label: "Perplexity" },
  { id: "gemini", label: "Gemini" },
  { id: "claude", label: "Claude" },
];
const RANGES: { id: TimeRange; label: string }[] = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
];

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="glass flex items-center gap-0.5 rounded-full p-1">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-medium transition " +
              (active
                ? "bg-ultraviolet text-white shadow-[0_4px_18px_-4px_rgba(134,14,255,0.9)]"
                : "text-white/60 hover:text-white")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterControls({ assistant, setAssistant, range, setRange }: Props) {
  return (
    <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
      <Segmented options={ASSISTANTS} value={assistant} onChange={setAssistant} />
      <Segmented options={RANGES} value={range} onChange={setRange} />
    </div>
  );
}
