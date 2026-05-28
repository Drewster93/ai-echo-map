import { motion } from "framer-motion";
import { useState } from "react";
import uberallLogo from "@/assets/uberall-logo.png";
import { PulseArc } from "./PulseArc";

interface Props {
  onSubmit: (brand: string) => void;
}

export function LandingScreen({ onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handle(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const v = value.trim() || "Lumen Coffee";
    setSubmitting(true);
    // Tiny delay lets the input "pulse" feedback render before exit kicks in.
    setTimeout(() => onSubmit(v), 120);
  }

  return (
    <motion.div
      key="landing"
      className="landing-bg absolute inset-0 z-30 items-center justify-center overflow-hidden px-6 flex flex-col"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{
        opacity: 0,
        scale: 1.25,
        filter: "blur(14px)",
      }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >

      <div className="landing-grain" />

      {/* Aperture flash that emanates from the input on exit */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(134,14,255,0.55), rgba(48,114,252,0.18) 35%, transparent 65%)",
          mixBlendMode: "screen",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: [0, 0.9, 0] }}
        transition={{ duration: 1.1, ease: "easeOut", times: [0, 0.35, 1] }}
      />

      {/* Pulse arc behind input */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-[40%]">
        <PulseArc size={900} color="#FFFFFF" opacity={0.13} />
      </div>

      <motion.div
        className="relative z-10 mx-auto w-full max-w-3xl text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src={uberallLogo}
          alt="Uberall"
          className="mx-auto mb-4 h-12 w-auto object-contain md:h-16"
        />
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-white/50">
          Discover your AI Performance Pulse
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

        <form onSubmit={handle} className="mx-auto mt-12 max-w-xl">
          <motion.div
            className="group relative"
            animate={submitting ? { scale: [1, 1.03, 0.98] } : { scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="absolute -inset-1 rounded-full bg-ultraviolet opacity-40 blur-2xl transition duration-500 group-focus-within:opacity-80 group-focus-within:blur-3xl" />
            <div className="relative flex items-center gap-2 rounded-full border border-white/15 bg-dark-plum/80 p-2 pl-6 backdrop-blur-xl transition focus-within:border-ultraviolet/60">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0 text-white/40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter a brand name…"
                className="min-w-0 flex-1 bg-transparent py-3 text-lg text-white placeholder:text-white/30 focus:outline-none"
              />
              <button
                type="submit"
                className="group/cta relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full bg-ultraviolet px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_8px_30px_-8px_rgba(134,14,255,0.9)] transition-all duration-300 hover:shadow-[0_14px_50px_-8px_rgba(134,14,255,1)]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/cta:translate-x-full" />
                <span className="relative">Reveal</span>
                <span aria-hidden className="relative text-base transition-transform duration-300 group-hover/cta:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
