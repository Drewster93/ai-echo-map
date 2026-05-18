import { motion } from "framer-motion";

interface Props {
  summary: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function TourOutroSummary({ summary }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 6, filter: "blur(6px)" }}
      transition={{ duration: 0.7, ease: EASE }}
      className="pointer-events-none absolute left-1/2 top-28 z-30 w-[min(460px,90vw)] -translate-x-1/2"
    >
      <div className="glass rounded-2xl px-6 py-4 text-center">
        <div className="font-display text-[10px] uppercase tracking-[0.25em] text-aqua/90">
          Tour complete
        </div>
        <div className="mt-1 font-display text-lg leading-snug text-white">{summary}</div>
      </div>
    </motion.div>
  );
}
