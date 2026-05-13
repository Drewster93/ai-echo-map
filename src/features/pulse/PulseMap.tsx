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
      }).setView([51.0, 5.0], 5);
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap · CARTO",
          subdomains: "abcd",
          maxZoom: 19,
        },
      ).addTo(map);
      mapRef.current = map;
      hexLayerRef.current = L.layerGroup().addTo(map);
      markerLayerRef.current = L.layerGroup().addTo(map);
      readyRef.current = true;
      // Fly to Berlin
      setTimeout(() => {
        map.flyTo([52.515, 13.405], 11.2, { duration: 2.6, easeLinearity: 0.2 });
      }, 400);
      // Force a re-render-ish by touching state via micro-tick: we rely on subsequent effects firing
      // because deps include [locations] / [hexCells] which already changed before this resolved.
      // Manually invoke renderers:
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
        opacity: isSelected ? 1 : 0.85,
        className: "hex-fade-in",
        interactive: true,
        bubblingMouseEvents: false,
      });
      polygon.on("click", () => onHexSelect(cell.h3));
      polygon.on("mouseover", () => {
        polygon.setStyle({ weight: 2, color: "#7BFFFF" });
      });
      polygon.on("mouseout", () => {
        if (selectedHex !== cell.h3) {
          polygon.setStyle({ weight: style.weight, color: style.color });
        }
      });
      polygon.addTo(layer);
      queueMicrotask(() => {
        const el = (polygon as unknown as { _path?: SVGPathElement })._path;
        if (el) {
          el.style.setProperty("--delay", `${(idx % 40) * 35}ms`);
          el.style.filter = `drop-shadow(0 0 6px ${style.glow})`;
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
