import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PulseMap } from "./PulseMap";
import { DetailPanel } from "./DetailPanel";
import { BrandPill } from "./hud/BrandPill";
import { FilterControls } from "./hud/FilterControls";
import { Legend } from "./hud/Legend";
import { StatBlock } from "./hud/StatBlock";
import { HeatReplayButton } from "./hud/HeatReplayButton";
import { MOCK_LOCATIONS, getDateLabels } from "./mockData";
import { buildHexCells } from "./hexUtils";
import type { Assistant, Location, TimeRange } from "./types";

interface Props {
  brand: string;
  onSwitchBrand: () => void;
  revealing?: boolean;
}

export function MapApp({ brand, onSwitchBrand, revealing = true }: Props) {
  const [assistant, setAssistant] = useState<Assistant>("all");
  const [range, setRange] = useState<TimeRange>("7d");
  const [selectedHex, setSelectedHex] = useState<string | null>(null);
  const [replayDay, setReplayDay] = useState<number | null>(null); // 0-6 if playing
  const [playing, setPlaying] = useState(false);

  const locations: Location[] = MOCK_LOCATIONS;

  // Replace brand in cluster names for display flair
  const brandedLocations = useMemo<Location[]>(
    () =>
      locations.map((l) => ({
        ...l,
        name: l.name.replace("Lumen", brand.split(/\s+/)[0] || "Lumen"),
      })),
    [brand, locations],
  );

  const scoreFor = (loc: Location): number => {
    let base =
      assistant === "all"
        ? loc.visibilityScore
        : loc.scoresByAssistant[assistant as Exclude<Assistant, "all">];
    if (replayDay !== null) {
      base = loc.history7d[replayDay];
    } else if (range === "24h") {
      base = loc.history7d[6];
    } else if (range === "30d") {
      base = (loc.history7d.reduce((a, b) => a + b, 0) / 7) * 0.95;
    }
    return base;
  };

  const hexCells = useMemo(
    () => buildHexCells(brandedLocations, scoreFor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brandedLocations, assistant, range, replayDay],
  );

  const selected = selectedHex ? hexCells.find((c) => c.h3 === selectedHex) ?? null : null;

  // Stats
  const totalLocations = brandedLocations.length;
  const avgScore =
    brandedLocations.reduce((sum, l) => sum + scoreFor(l), 0) / Math.max(1, totalLocations);
  const promptsTested = brandedLocations.reduce((s, l) => s + l.prompts.length, 0) * 14;
  const trendPct = useMemo(() => {
    const first = brandedLocations.reduce((s, l) => s + l.history7d[0], 0) / totalLocations;
    const last = brandedLocations.reduce((s, l) => s + l.history7d[6], 0) / totalLocations;
    return ((last - first) / Math.max(1, first)) * 100;
  }, [brandedLocations, totalLocations]);

  // Replay loop
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 6000;
  function startReplay() {
    if (playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setPlaying(false);
      setReplayDay(null);
      setReplayProgress(0);
      return;
    }
    setPlaying(true);
    startRef.current = null;
    const step = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / DURATION);
      setReplayProgress(p);
      const day = Math.min(6, Math.floor(p * 7));
      setReplayDay(day);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setPlaying(false);
        setTimeout(() => {
          setReplayDay(null);
          setReplayProgress(0);
        }, 800);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }
  const [replayProgress, setReplayProgress] = useState(0);
  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const dateLabels = useMemo(() => getDateLabels(), []);

  // HUD staggered reveal — starts ~60% through the dive
  const hudVariants = {
    hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: 1.1 + i * 0.09,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <motion.div
      className="relative h-full w-full"
      animate={{
        opacity: revealing ? 1 : 0.55,
        scale: revealing ? 1 : 1.06,
      }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <PulseMap
        locations={brandedLocations}
        hexCells={hexCells}
        onHexSelect={setSelectedHex}
        selectedHex={selectedHex}
        dive={revealing}
      />

      {/* vignette + scrim — intensifies as we land */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,3,13,0.7)_100%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: revealing ? 1 : 0.2 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: revealing ? 0.6 : 0 }}
      />

      {revealing && (
        <>
          <motion.div custom={0} variants={hudVariants} initial="hidden" animate="show">
            <BrandPill brand={brand} onSwitch={onSwitchBrand} />
          </motion.div>
          <motion.div custom={1} variants={hudVariants} initial="hidden" animate="show">
            <FilterControls
              assistant={assistant}
              setAssistant={setAssistant}
              range={range}
              setRange={setRange}
            />
          </motion.div>
          <motion.div custom={2} variants={hudVariants} initial="hidden" animate="show">
            <Legend />
          </motion.div>
          <motion.div custom={3} variants={hudVariants} initial="hidden" animate="show">
            <StatBlock
              totalLocations={totalLocations}
              avgScore={avgScore}
              promptsTested={promptsTested}
              trendPct={trendPct}
            />
          </motion.div>
          <motion.div custom={4} variants={hudVariants} initial="hidden" animate="show">
            <HeatReplayButton playing={playing} progress={replayProgress} onClick={startReplay} />
          </motion.div>
        </>
      )}

      {/* Replay date label */}
      <AnimatePresence>
        {replayDay !== null && (
          <motion.div
            key="date"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-1/2 top-20 z-20 -translate-x-1/2"
          >
            <div className="glass rounded-full px-5 py-2">
              <span className="font-display text-lg text-white">
                {dateLabels[replayDay]}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DetailPanel
        hex={selected}
        locations={brandedLocations}
        onClose={() => setSelectedHex(null)}
      />
    </motion.div>
  );
}
