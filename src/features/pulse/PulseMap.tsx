import { useEffect, useMemo, useRef } from "react";
import type { HexCell, Location } from "./types";
import { styleForIntensity } from "./hexUtils";

interface Props {
  locations: Location[];
  hexCells: HexCell[];
  onHexSelect: (h3: string | null) => void;
  selectedHex: string | null;
}

// Dynamically loaded leaflet (client only) to avoid SSR `window is not defined`.
type LeafletNS = typeof import("leaflet");

export function PulseMap({ locations, hexCells, onHexSelect, selectedHex }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const LRef = useRef<LeafletNS | null>(null);
  const hexLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const readyRef = useRef(false);

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
      }).setView([30.0, 10.0], 2.5);
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap · CARTO",
          subdomains: "abcd",
          maxZoom: 19,
        },
      ).addTo(map);
      // Labels-only overlay so streets/places remain legible above hex layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
          pane: "shadowPane",
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
      // Fly to Berlin
      // Cinematic two-stage cinematic zoom: a slow continental glide first,
      // then a smooth flyTo into Berlin using flyTo's parabolic interpolation
      // so altitude eases out instead of snapping.
      setTimeout(() => {
        map.flyTo([52.515, 13.405], 11.6, {
          duration: 4.2,
          easeLinearity: 0.12,
          noMoveStart: false,
        });
      }, 650);
      renderMarkers();
      renderHex();
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

  // Re-render markers when locations change
  useEffect(() => {
    if (readyRef.current) renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  // Re-render hex layer
  const cellKey = useMemo(
    () => hexCells.map((c) => `${c.h3}:${c.intensity.toFixed(1)}`).join("|"),
    [hexCells],
  );
  useEffect(() => {
    if (readyRef.current) renderHex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellKey, selectedHex]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}
