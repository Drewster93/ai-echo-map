import { motion } from "framer-motion";
import { useState } from "react";
import { PulseArc } from "./PulseArc";

interface Props {
  onSubmit: (brand: string) => void;
}

export function LandingScreen({ onSubmit }: Props) {
  const [value, setValue] = useState("");

  function handle(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim() || "Lumen Coffee";
    onSubmit(v);
  }

  return (
    <motion.div
      key="landing"
      className="mesh-bg relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Pulse arc behind input */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[40%]">
        <PulseArc size={900} color="#FFFFFF" opacity={0.13} />
      </div>

      {/* Top brand */}
      <div className="absolute left-8 top-7 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-ultraviolet shadow-[0_0_12px_#860EFF]" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
          Uberall · AI Visibility Pulse
        </span>
      </div>

      <motion.div
        className="relative z-10 mx-auto w-full max-w-3xl text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-white/50">
          Real-time AI mention intelligence
        </p>
        <h1 className="font-display text-balance text-5xl leading-[1.05] text-white md:text-7xl">
          Enter your brand to see{" "}
          <em className="not-italic">
            <span className="font-display italic text-ultraviolet">where AI is talking</span>
          </em>{" "}
          about you.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-white/60">
          ChatGPT, Perplexity, Gemini and Claude — mapped, hex by hex, across every
          location you operate.
        </p>

        <form onSubmit={handle} className="mx-auto mt-12 flex max-w-xl flex-col gap-4">
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-ultraviolet via-tech-blue to-ultraviolet opacity-50 blur-xl transition group-focus-within:opacity-90" />
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Starbucks"
              className="relative w-full rounded-2xl border border-white/15 bg-dark-plum/80 px-6 py-5 text-center text-xl text-white placeholder:text-white/30 focus:border-ultraviolet focus:outline-none"
            />
          </div>
          <div className="group/cta relative mx-auto">
            <div className="absolute -inset-0.5 rounded-2xl bg-ultraviolet opacity-50 blur-lg transition duration-500 group-hover/cta:opacity-80 group-hover/cta:blur-xl" />
            <button
              type="submit"
              className="relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-ultraviolet px-10 py-5 text-base font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_50px_-10px_rgba(134,14,255,0.9)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_20px_70px_-10px_rgba(134,14,255,1)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/cta:translate-x-full" />
              <span className="relative">Reveal my visibility</span>
              <span aria-hidden className="relative text-lg transition-transform duration-300 group-hover/cta:translate-x-1">→</span>
            </button>
          </div>
        </form>

        <p className="mt-10 text-xs italic text-white/50">
          Try any brand name — the demo dataset adapts instantly.
        </p>
      </motion.div>

      <div className="absolute bottom-6 right-8 text-[10px] uppercase tracking-[0.3em] text-white/30">
        Internal product validation · v0.1
      </div>
    </motion.div>
  );
}
