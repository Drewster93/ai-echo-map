import { motion } from "framer-motion";
import { useEffect } from "react";
import { PulseArc } from "./PulseArc";

interface Props {
  onDone: () => void;
}

const TOTAL_MS = 3200;

export function IntroSequence({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, TOTAL_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      key="intro"
      className="landing-bg absolute inset-0 z-40 flex flex-col items-center justify-center overflow-hidden px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >

      {/* Expanding pulse rings */}
      {[0, 0.25, 0.5, 0.75].map((delay, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            boxShadow: "0 0 0 1px rgba(168,85,247,0.6)",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 80, 140],
          }}
          transition={{
            duration: 2.4,
            delay,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 0.2,
          }}
        />
      ))}

      {/* Central pulse arc reveal */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <PulseArc size={700} color="#FFFFFF" opacity={0.18} />
      </motion.div>

      {/* Brand mark + wordmark */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="mb-6 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ultraviolet opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ultraviolet" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/70">
            Uberall
          </span>
        </motion.div>

        <motion.div
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-ultraviolet/40 bg-ultraviolet/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-ultraviolet"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="h-1 w-1 rounded-full bg-ultraviolet" />
          World's First · Local GEO
        </motion.div>

        <motion.h1
          className="font-display text-balance text-5xl leading-[1.05] text-white md:text-7xl"
          initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          AI Visibility{" "}
          <em className="not-italic font-display italic text-ultraviolet">Pulse</em>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-lg text-balance text-sm leading-relaxed text-white/60 md:text-base"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0, ease: "easeOut" }}
        >
          The first platform for <span className="text-white/90">Local Generative Engine Optimization</span> — see how ChatGPT, Perplexity, Gemini and Claude answer for your locations, hex by hex.
        </motion.p>


        {/* Loading sweep */}
        <motion.div
          className="relative mt-12 h-px w-48 overflow-hidden bg-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.4 }}
        >
          <motion.span
            className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-ultraviolet to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.4,
              delay: 1.4,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
