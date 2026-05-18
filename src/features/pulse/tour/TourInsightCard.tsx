import { motion } from "framer-motion";
import type { TourStop } from "./selectTourStops";

interface Props {
  stop: TourStop;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function TourInsightCard({ stop }: Props) {
  return (
    <motion.div
      key={stop.kind + stop.city}
      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
      transition={{ duration: 0.45, ease: EASE }}
      className="pointer-events-none absolute left-1/2 top-28 z-30 w-[min(420px,90vw)] -translate-x-1/2"
    >
      <div className="glass rounded-2xl px-6 py-4 text-center">
        <div className="font-display text-[10px] uppercase tracking-[0.25em] text-aqua/90">
          {stop.headline}
        </div>
        <div className="mt-1 font-display text-2xl text-white">{stop.city}</div>
        <div className="mt-2 text-sm leading-snug text-white/80">{stop.insight}</div>
        {stop.comparison && (
          <div className="mt-2 border-t border-white/10 pt-2 text-xs leading-snug text-aqua/90">
            {stop.comparison}
          </div>
        )}
      </div>
    </motion.div>
  );
}
