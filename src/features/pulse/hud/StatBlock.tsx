import { useEffect, useRef, useState } from "react";
import { PulseCircle } from "../PulseCircle";

interface Props {
  totalLocations: number;
  avgScore: number;
  promptsTested: number;
  trendPct: number;
}

function useCountUp(target: number, duration = 1200) {
  const [v, setV] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    startRef.current = null;
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

export function StatBlock({ totalLocations, avgScore, promptsTested, trendPct }: Props) {
  const total = useCountUp(totalLocations);
  const avg = useCountUp(avgScore);
  const tested = useCountUp(promptsTested);
  const positive = trendPct >= 0;

  return (
    <div className="glass absolute bottom-5 right-5 z-20 w-[320px] overflow-hidden rounded-2xl px-5 py-4">
      <div className="absolute -right-6 -top-6 opacity-50">
        <PulseCircle size={150} color="#3072FC" opacity={0.18} />
      </div>
      <div className="relative grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
            Locations
          </p>
          <p className="font-display text-2xl text-white">{Math.round(total)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
            Avg. visibility
          </p>
          <p className="font-display text-2xl text-ultraviolet">
            {Math.round(avg)}
            <span className="text-base text-white/40">/100</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
            Prompts / week
          </p>
          <p className="text-base font-bold text-white">{Math.round(tested).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
            7d trend
          </p>
          <p
            className={
              "text-base font-bold " + (positive ? "text-soft-green" : "text-orange-uberall")
            }
          >
            {positive ? "▲" : "▼"} {positive ? "+" : ""}
            {trendPct.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
