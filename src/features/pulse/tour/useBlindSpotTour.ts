import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Location } from "../types";
import type { CityCompetitorStats } from "../competitorData";
import { selectTourStops, summaryLine, type TourStop } from "./selectTourStops";

export type TourPhase = "idle" | "preroll" | "stop" | "outro" | "done";

export interface PulseMapHandle {
  flyTo: (center: [number, number], zoom: number, durationSec?: number) => Promise<void>;
  flyToInitial: (durationSec?: number) => Promise<void>;
  stop: () => void;
}

export interface TourFocus {
  center: [number, number];
  radiusKm: number;
}

interface Args {
  mapHandle: PulseMapHandle | null;
  locations: Location[];
  scoreFor: (loc: Location) => number;
  reducedMotion: boolean;
}

export function useBlindSpotTour({ mapHandle, locations, scoreFor, reducedMotion }: Args) {
  const [phase, setPhase] = useState<TourPhase>("idle");
  const [currentStop, setCurrentStop] = useState<TourStop | null>(null);
  const [focus, setFocus] = useState<TourFocus | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const timersRef = useRef<number[]>([]);
  const cancelledRef = useRef(false);
  const runningRef = useRef(false);
  const stopsRef = useRef<TourStop[]>([]);

  const scoreForRef = useRef(scoreFor);
  scoreForRef.current = scoreFor;
  const locationsRef = useRef(locations);
  locationsRef.current = locations;

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      if (!cancelledRef.current) fn();
    }, ms);
    timersRef.current.push(id);
  }, []);

  const wait = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        schedule(() => resolve(), ms);
      }),
    [schedule],
  );

  const cancel = useCallback(() => {
    if (!runningRef.current) return;
    cancelledRef.current = true;
    runningRef.current = false;
    clearTimers();
    mapHandle?.stop();
    setCurrentStop(null);
    setFocus(null);
    setPhase("done");
  }, [clearTimers, mapHandle]);

  const start = useCallback(async () => {
    if (!mapHandle) return;
    if (runningRef.current) return;
    const stops = selectTourStops(locationsRef.current, scoreForRef.current);
    if (stops.length === 0) {
      setPhase("done");
      return;
    }
    stopsRef.current = stops;
    setSummary(summaryLine(stops));
    cancelledRef.current = false;
    runningRef.current = true;
    setPhase("preroll");

    // pre-roll
    if (!reducedMotion) await wait(700);
    if (cancelledRef.current) return;

    for (let i = 0; i < stops.length; i++) {
      if (cancelledRef.current) return;
      const stop = stops[i];
      setPhase("stop");
      setCurrentStop(stop);
      setFocus({ center: stop.center, radiusKm: 40 });

      // Ease
      const flyDuration = reducedMotion ? 0 : 1.2;
      try {
        await mapHandle.flyTo(stop.center, stop.zoom, flyDuration);
      } catch {
        return;
      }
      if (cancelledRef.current) return;

      // Insight hold
      await wait(reducedMotion ? 2200 : 2000);
      if (cancelledRef.current) return;

      // Handoff fade-out window
      setCurrentStop(null);
      await wait(300);
      if (cancelledRef.current) return;
    }

    // Outro
    setPhase("outro");
    setFocus(null);
    try {
      await mapHandle.flyToInitial(reducedMotion ? 0 : 1.2);
    } catch {
      return;
    }
    if (cancelledRef.current) return;
    runningRef.current = false;
    setPhase("done");
  }, [mapHandle, reducedMotion, wait]);

  useEffect(
    () => () => {
      cancelledRef.current = true;
      clearTimers();
    },
    [clearTimers],
  );

  const isActive = phase === "preroll" || phase === "stop" || phase === "outro";

  return useMemo(
    () => ({
      phase,
      currentStop,
      focus,
      summary,
      isActive,
      start,
      cancel,
    }),
    [phase, currentStop, focus, summary, isActive, start, cancel],
  );
}
