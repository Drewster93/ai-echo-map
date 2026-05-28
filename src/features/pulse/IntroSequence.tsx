import { motion, useAnimationFrame } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PulseArc } from "./PulseArc";
import uberallLogo from "@/assets/uberall-logo.png";


interface Props {
  onDone: () => void;
}

const TOTAL_MS = 6200;

const ASSISTANTS = ["ChatGPT", "Perplexity", "Gemini", "Claude"];
const CITIES = [
  "Berlin",
  "New York",
  "Tokyo",
  "São Paulo",
  "London",
  "Sydney",
  "Lagos",
  "Paris",
];

// Deterministic pseudo-random positions for ambient hex pings (avoid SSR mismatch)
const PINGS = Array.from({ length: 14 }, (_, i) => {
  const a = Math.sin(i * 13.37) * 10000;
  const b = Math.cos(i * 7.91) * 10000;
  return {
    left: ((a - Math.floor(a)) * 86 + 7).toFixed(2) + "%",
    top: ((b - Math.floor(b)) * 76 + 12).toFixed(2) + "%",
    delay: (i % 7) * 0.35,
    size: 4 + (i % 3) * 2,
  };
});

export function IntroSequence({ onDone }: Props) {
  const [assistantIdx, setAssistantIdx] = useState(0);
  const [cityIdx, setCityIdx] = useState(0);
  const [counter, setCounter] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(onDone, TOTAL_MS);
    const aInt = setInterval(
      () => setAssistantIdx((i) => (i + 1) % ASSISTANTS.length),
      650,
    );
    const cInt = setInterval(
      () => setCityIdx((i) => (i + 1) % CITIES.length),
      520,
    );
    return () => {
      clearTimeout(t);
      clearInterval(aInt);
      clearInterval(cInt);
    };
  }, [onDone]);

  // Animated scanned-locations counter (cinematic telemetry)
  useAnimationFrame((t) => {
    if (startRef.current === null) startRef.current = t;
    const elapsed = (t - startRef.current) / 1000;
    const eased = 1 - Math.pow(1 - Math.min(elapsed / 5, 1), 3);
    setCounter(Math.floor(eased * 184729));
  });

  return (
    <motion.div
      key="intro"
      className="landing-bg absolute inset-0 z-40 flex flex-col items-center justify-center overflow-hidden px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(12px)", scale: 1.04 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Cinematic letterbox bars */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-30 bg-black"
        initial={{ height: "50%" }}
        animate={{ height: "6vh" }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-black"
        initial={{ height: "50%" }}
        animate={{ height: "6vh" }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />

      {/* Grid backdrop */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%)",
        }}
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Radar sweep */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[140vmin] w-[140vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(134,14,255,0.18) 30deg, transparent 60deg)",
          maskImage:
            "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 75%)",
        }}
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.9, rotate: 360 }}
        transition={{
          opacity: { duration: 1.2 },
          rotate: { duration: 4.5, ease: "linear", repeat: Infinity },
        }}
      />

      {/* Concentric range rings */}
      {[1, 2, 3].map((r) => (
        <motion.span
          key={r}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          style={{ width: `${r * 28}vmin`, height: `${r * 28}vmin` }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.2 + r * 0.15, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}

      {/* Expanding pulse rings */}
      {[0, 0.4, 0.8, 1.2].map((delay, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ boxShadow: "0 0 0 1px rgba(168,85,247,0.7)" }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0, 90, 160] }}
          transition={{
            duration: 3,
            delay,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 0.1,
          }}
        />
      ))}

      {/* Ambient hex pings (locations being scanned) */}
      {PINGS.map((p, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute z-[2] rounded-full bg-ultraviolet"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 12px rgba(134,14,255,0.9)",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 0.8] }}
          transition={{
            duration: 1.8,
            delay: 0.6 + p.delay,
            repeat: Infinity,
            repeatDelay: 1.2,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Central pulse arc reveal */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <PulseArc size={760} color="#FFFFFF" opacity={0.2} />
      </motion.div>

      {/* Top HUD: telemetry */}
      <motion.div
        className="absolute left-0 right-0 top-[7vh] z-20 flex items-center justify-between px-8 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 md:px-14"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live · Global Sweep
        </span>
        <span className="hidden md:inline">
          Lat 52.520 · Lon 13.405 · H3 Res 8
        </span>
        <span>{counter.toLocaleString()} hexes scanned</span>
      </motion.div>

      {/* Bottom HUD: cycling assistant */}
      <motion.div
        className="absolute bottom-[7vh] left-0 right-0 z-20 flex items-center justify-between px-8 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 md:px-14"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
      >
        <span>Querying →&nbsp;
          <motion.span
            key={assistantIdx}
            className="text-white/90"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {ASSISTANTS[assistantIdx]}
          </motion.span>
        </span>
        <span className="hidden md:inline">
          Region ·&nbsp;
          <motion.span
            key={cityIdx}
            className="text-white/90"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {CITIES[cityIdx]}
          </motion.span>
        </span>
        <span>Sys 1.0.0</span>
      </motion.div>

      {/* Brand mark + wordmark */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="mb-6 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img
            src={uberallLogo}
            alt="Uberall"
            className="h-10 w-auto object-contain md:h-12"
          />
        </motion.div>

        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-ultraviolet/40 bg-ultraviolet/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-ultraviolet"
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="h-1 w-1 rounded-full bg-ultraviolet" />
          World's First · Local GEO
        </motion.div>

        {/* Word-by-word headline reveal */}
        <h1 className="font-display text-balance text-5xl leading-[1.05] text-white md:text-7xl">
          {["Local", "GEO"].map((word, i) => (
            <motion.span
              key={word}
              className="mr-3 inline-block"
              initial={{ opacity: 0, y: 28, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 1.1,
                delay: 0.7 + i * 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          ))}
          <motion.em
            className="not-italic font-display italic text-ultraviolet"
            initial={{ opacity: 0, y: 28, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              textShadow: "0 0 40px rgba(134,14,255,0.6)",
            }}
          >
            Pulse
          </motion.em>
        </h1>

        <motion.p
          className="mt-7 max-w-xl text-balance text-sm leading-relaxed text-white/60 md:text-base"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6, ease: "easeOut" }}
        >
          The first platform for{" "}
          <span className="text-white/90">
            Local Generative Engine Optimization
          </span>{" "}
          — see how ChatGPT, Perplexity, Gemini and Claude answer for your
          locations, hex by hex.
        </motion.p>

        {/* Loading sweep */}
        <motion.div
          className="relative mt-12 h-px w-64 overflow-hidden bg-white/10"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 2.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-ultraviolet to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.6,
              delay: 2.2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </motion.div>

        <motion.div
          className="mt-3 font-mono text-[10px] uppercase tracking-[0.4em] text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.6 }}
        >
          Calibrating signal
        </motion.div>
      </motion.div>

      {/* Vignette + film grain feel */}
      <div
        className="pointer-events-none absolute inset-0 z-[15]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </motion.div>
  );
}
