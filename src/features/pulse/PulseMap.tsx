import { useEffect, useMemo, useRef } from "react";
import type { HexCell, Location } from "./types";
import { styleForIntensity } from "./hexUtils";

interface Props {
  locations: Location[];
  hexCells: HexCell[];
  onHexSelect: (h3: string | null) => void;
  selectedHex: string | null;
  /** When true, dive from high-altitude into Berlin. */
  dive?: boolean;
}

// Dynamically loaded leaflet (client only) to avoid SSR `window is not defined`.
type LeafletNS = typeof import("leaflet");

export function PulseMap({ locations, hexCells, onHexSelect, selectedHex, dive = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const LRef = useRef<LeafletNS | null>(null);
  const hexLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const readyRef = useRef(false);
  const dovedRef = useRef(false);
  const dataRenderedRef = useRef(false);

  // Init map once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        worldCopyJump: true,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
      }).setView([52.515, 13.405], 5);
      // Realistic satellite basemap (Esri World Imagery) — same look as
      // Uber/Kepler.gl realistic mode.
      const baseLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics",
          maxZoom: 19,
          keepBuffer: 4,
        },
      ).addTo(map);
      // Reference overlay: roads, boundaries, place labels on top of imagery
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          pane: "shadowPane",
          opacity: 0.9,
        },
      ).addTo(map);
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          pane: "shadowPane",
          opacity: 0.85,
        },
      ).addTo(map);
      mapRef.current = map;
      hexLayerRef.current = L.layerGroup().addTo(map);
      // Make the hex SVG overlay additively blend so overlapping cells bloom
      // like Uber/kepler.gl heatmaps.
      const overlayPane = map.getPanes().overlayPane;
      if (overlayPane) {
        overlayPane.classList.add("hex-overlay-pane");
      }
      markerLayerRef.current = L.layerGroup().addTo(map);
      readyRef.current = true;
      // Defer heavy hex/marker rendering — only paint them once we arrive,
      // otherwise the 31 multi-pass drop-shadow polygons stutter the flyTo.
      if (dive && !dovedRef.current) {
        dovedRef.current = true;
        runDive(map);
      } else if (!dive) {
        // Not revealing yet — render nothing; the map just preloads tiles.
      }
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderMarkers() {
    const L = LRef.current;
    const layer = markerLayerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    locations.forEach((loc) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="sonar"><span class="sonar-ring"></span><span class="sonar-ring delay"></span><span class="sonar-dot"></span></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([loc.lat, loc.lng], { icon, interactive: false }).addTo(layer);
    });
  }

  function renderHex() {
    const L = LRef.current;
    const layer = hexLayerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    hexCells.forEach((cell, idx) => {
      const style = styleForIntensity(cell.intensity);
      const isSelected = selectedHex === cell.h3;
      const polygon = L.polygon(cell.boundary, {
        fillColor: style.fillColor,
        fillOpacity: style.fillOpacity,
        color: isSelected ? "#7BFFFF" : style.color,
        weight: isSelected ? 2 : style.weight,
        opacity: isSelected ? 1 : 0.55,
        lineJoin: "round",
        className: "hex-fade-in hex-cell",
        interactive: true,
        bubblingMouseEvents: false,
      });
      polygon.on("click", () => onHexSelect(cell.h3));
      polygon.on("mouseover", () => {
        polygon.setStyle({ weight: 2, color: "#7BFFFF", opacity: 1 });
      });
      polygon.on("mouseout", () => {
        if (selectedHex !== cell.h3) {
          polygon.setStyle({ weight: style.weight, color: style.color, opacity: 0.55 });
        }
      });
      polygon.addTo(layer);
      queueMicrotask(() => {
        const el = (polygon as unknown as { _path?: SVGPathElement })._path;
        if (el) {
          el.style.setProperty("--delay", `${(idx % 40) * 35}ms`);
          // Multi-pass bloom: tight inner halo + mid glow + wide atmospheric
          // bloom. Each pass scales with intensity so hot cells visibly bleed
          // light into their neighbors while cold cells stay crisp.
          const t = Math.max(0, Math.min(1, cell.intensity / 100));
          const inner = (2 + t * 6).toFixed(1);
          const mid = (6 + t * 18).toFixed(1);
          const wide = (12 + t * 38).toFixed(1);
          el.style.filter = [
            `drop-shadow(0 0 ${inner}px ${style.glow})`,
            `drop-shadow(0 0 ${mid}px ${style.glow})`,
            `drop-shadow(0 0 ${wide}px ${style.glow})`,
          ].join(" ");
          el.style.setProperty("opacity", String(0.85 + t * 0.15));
        }
      });
    });
  }

  function paintData() {
    if (dataRenderedRef.current) return;
    dataRenderedRef.current = true;
    renderMarkers();
    renderHex();
  }

  function runDive(map: import("leaflet").Map) {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      map.setView([52.515, 13.405], 12);
      paintData();
      return;
    }
    // Short dive (z5 → z12) — fewer levels means smoother animation and
    // far fewer satellite tiles to fetch mid-flight.
    map.flyTo([52.515, 13.405], 12, {
      duration: 2.0,
      easeLinearity: 0.25,
    });
    // Paint heavy hex/marker layers only after we arrive, so the flyTo stays
    // fluid. `moveend` fires once the camera settles.
    map.once("moveend", () => {
      paintData();
    });
  }

  // Kick off the dive when `dive` flips true after the map is ready
  useEffect(() => {
    if (!dive || dovedRef.current) return;
    const map = mapRef.current;
    if (!readyRef.current || !map) return;
    dovedRef.current = true;
    runDive(map);
  }, [dive]);

  // Re-render markers when locations change (only after first paint)
  useEffect(() => {
    if (readyRef.current && dataRenderedRef.current) renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  // Re-render hex layer (only after first paint)
  const cellKey = useMemo(
    () => hexCells.map((c) => `${c.h3}:${c.intensity.toFixed(1)}`).join("|"),
    [hexCells],
  );
  useEffect(() => {
    if (readyRef.current && dataRenderedRef.current) renderHex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellKey, selectedHex]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}
