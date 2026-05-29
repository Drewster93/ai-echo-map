import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PulseMap } from "./PulseMap";
import { DetailPanel } from "./DetailPanel";
import { TopHeader } from "./hud/TopHeader";
import { WorldwideOverview } from "./hud/WorldwideOverview";
import { RegionalOverview } from "./hud/RegionalOverview";
import { RoleSwitcher, type Role } from "./hud/RoleSwitcher";
import { MentionRateLegend } from "./hud/MentionRateLegend";
import { FilterControls } from "./hud/FilterControls";
import { HeatReplayButton } from "./hud/HeatReplayButton";
import { CompetitorTogglePill } from "./hud/CompetitorTogglePill";
import { getDateLabels } from "./mockData";
import { buildHexCells } from "./hexUtils";
import { buildCompetitorMarkers, getCityCompetitorStats } from "./competitorData";
import { ResultsSection } from "./ResultsSection";
import { LocationReportView } from "./location/LocationReport";
import type { Assistant, Location, TimeRange } from "./types";

interface Props {
  brand: string;
  onSwitchBrand?: () => void;
  revealing?: boolean;
  locations?: Location[] | null;
}

export function MapApp({ brand, onSwitchBrand = () => {}, revealing = true, locations: locationsProp = null }: Props) {
  const [assistant, setAssistant] = useState<Assistant>("all");
  const [range, setRange] = useState<TimeRange>("7d");
  const [selectedHex, setSelectedHex] = useState<string | null>(null);
  const [replayDay, setReplayDay] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showCompetitors, setShowCompetitors] = useState(false);
  const [role, setRole] = useState<Role>("admin");
  const [regionCity, setRegionCity] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);

  const isLoading = locationsProp === null;
  const isEmpty = locationsProp !== null && locationsProp.length === 0;
  const usingRealData = !!(locationsProp && locationsProp.length > 0);

  const brandedLocations = useMemo<Location[]>(
    () => locationsProp ?? [],
    [locationsProp],
  );



  const scopedLocations = useMemo<Location[]>(() => {
    if (role === "regional" && regionCity) {
      return brandedLocations.filter((l) => l.city === regionCity);
    }
    return brandedLocations;
  }, [brandedLocations, role, regionCity]);

  const scoreFor = useCallback(
    (loc: Location): number => {
      let base =
        assistant === "all"
          ? loc.visibilityScore
          : loc.scoresByAssistant[assistant as Exclude<Assistant, "all">];
      if (replayDay !== null) base = loc.history7d[replayDay];
      else if (range === "24h") base = loc.history7d[6];
      else if (range === "30d") base = (loc.history7d.reduce((a, b) => a + b, 0) / 7) * 0.95;
      return base;
    },
    [assistant, range, replayDay],
  );

  // Admin view aggregates at city scale (coarse H3 res); regional/location
  // views stay at fine resolution so individual properties are visible.
  const hexRes = role === "admin" ? 5 : 8;
  const hexCells = useMemo(
    () => buildHexCells(scopedLocations, scoreFor, hexRes),
    [scopedLocations, scoreFor, hexRes],
  );

  const selected = selectedHex ? hexCells.find((c) => c.h3 === selectedHex) ?? null : null;

  const totalLocations = scopedLocations.length;
  const avgScore =
    scopedLocations.reduce((sum, l) => sum + scoreFor(l), 0) / Math.max(1, totalLocations);
  const promptsTested = scopedLocations.reduce((s, l) => s + l.prompts.length, 0) * 14;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

  const competitorStats = useMemo(
    () => getCityCompetitorStats(scopedLocations),
    [scopedLocations],
  );
  const competitorMarkers = useMemo(
    () => (showCompetitors ? buildCompetitorMarkers(scopedLocations) : []),
    [scopedLocations, showCompetitors],
  );


  // Replay loop (heat replay — separate from tour)
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
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else {
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

  const EASE = [0.16, 1, 0.3, 1] as const;
  const hudVariants = {
    hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { delay: 1.1 + i * 0.09, duration: 0.6, ease: EASE },
    }),
  } as const;

  // Derived metrics for header / overview panel
  const propertiesCount = totalLocations;
  const marketsCount = useMemo(() => {
    const cities = new Set(scopedLocations.map((l) => l.city ?? l.name));
    return cities.size;
  }, [scopedLocations]);
  const competitorPct = Math.max(0, Math.min(100, avgScore * 0.68));
  const avgCitation = Math.max(0, Math.min(100, avgScore * 0.44));
  const avgPosition = Math.max(1, 3 - avgScore / 50);
  const monthlySearches = Math.round(promptsTested * 70);
  const valueCaptured = Math.max(0, Math.min(100, avgScore * 0.45));
  const narrative = `${brand}'s strongest AI presence shows up in heritage and resort markets. Major urban markets underperform with competitor brands dominating share of voice.`;

  // Location Manager / Regional full-page report — short-circuits the map UI
  if (role === "location" || role === "regional") {
    const activeLoc =
      brandedLocations.find((l) => l.id === locationId) ?? brandedLocations[0];
    return (
      <>
        <div className="h-screen w-full overflow-y-auto">
          <LocationReportView
            location={activeLoc}
            brand={brand}
            onBack={() => setRole("admin")}
            allLocations={role === "regional" ? brandedLocations : undefined}
            onSelectLocation={role === "regional" ? setLocationId : undefined}
            roleSwitcher={
              <RoleSwitcher
                role={role}
                setRole={setRole}
                regionCity={regionCity}
                setRegionCity={setRegionCity}
                locationId={locationId}
                setLocationId={setLocationId}
                locations={brandedLocations}
              />
            }
          />
        </div>
      </>
    );
  }

  const scopeLabel = "Worldwide";

  return (
    <>
    <motion.div
      className="relative h-screen w-full"
      animate={{
        opacity: revealing ? 1 : 0.55,
        scale: revealing ? 1 : 1.06,
      }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <PulseMap
        locations={scopedLocations}
        hexCells={hexCells}
        onHexSelect={setSelectedHex}
        selectedHex={selectedHex}
        dive={revealing}
        competitorMarkers={competitorMarkers}
      />

      <AnimatePresence>
        {(isLoading || isEmpty) && (
          <motion.div
            key={isLoading ? "loading" : "empty"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-[#05030d]/85 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              {isLoading ? (
                <>
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <p className="font-display text-lg text-white/90">
                    Searching Google Places for {brand}…
                  </p>
                  <p className="text-sm text-white/50">
                    Pulling live business locations to map your AI footprint.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-xl text-white">
                    No locations found for {brand}
                  </p>
                  <p className="text-sm text-white/60">
                    We couldn't find any matching Google Business Profile listings.
                  </p>
                  <button
                    onClick={onSwitchBrand}
                    className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                  >
                    Try another brand
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {revealing && (
        <>
          <motion.div custom={0} variants={hudVariants} initial="hidden" animate="show">
            <TopHeader
              brand={brand}
              onSwitch={onSwitchBrand}
              markets={marketsCount}
              properties={propertiesCount}
              scopeLabel={scopeLabel}
              right={
                <RoleSwitcher
                  role={role}
                  setRole={setRole}
                  regionCity={regionCity}
                  setRegionCity={setRegionCity}
                  locationId={locationId}
                  setLocationId={setLocationId}
                  locations={brandedLocations}
                />
              }
            />
          </motion.div>

          <motion.div custom={1} variants={hudVariants} initial="hidden" animate="show">
            <WorldwideOverview
              brand={brand.split(/\s+/)[0] || brand}
              avgMention={avgScore}
              competitorPct={competitorPct}
              avgCitation={avgCitation}
              avgPosition={avgPosition}
              monthlySearches={monthlySearches}
              valueCaptured={valueCaptured}
              narrative={narrative}
            />
          </motion.div>

          <motion.div custom={2} variants={hudVariants} initial="hidden" animate="show">
            <MentionRateLegend />
          </motion.div>

          {/* Secondary controls stacked along bottom-left */}
          <motion.div
            custom={3}
            variants={hudVariants}
            initial="hidden"
            animate="show"
            className="absolute bottom-5 left-[365px] z-20 flex items-center gap-2"
          >
            <FilterControls
              assistant={assistant}
              setAssistant={setAssistant}
              range={range}
              setRange={setRange}
            />
            <HeatReplayButton playing={playing} progress={replayProgress} onClick={startReplay} />
            <CompetitorTogglePill
              active={showCompetitors}
              onToggle={() => setShowCompetitors((v) => !v)}
            />
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
              <span className="font-display text-lg text-white">{dateLabels[replayDay]}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
    <DetailPanel
      hex={selected}
      locations={scopedLocations}
      onClose={() => setSelectedHex(null)}
    />
    {revealing && (
      <ResultsSection
        brand={brand}
        locations={scopedLocations}
        assistant={assistant}
        avgScore={avgScore}
      />
    )}
    </>

  );
}

