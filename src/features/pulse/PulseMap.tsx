import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import type { HexCell, Location } from "./types";
import { styleForIntensity } from "./hexUtils";

interface Props {
  locations: Location[];
  hexCells: HexCell[];
  onHexSelect: (h3: string | null) => void;
  selectedHex: string | null;
}

export function PulseMap({ locations, hexCells, onHexSelect, selectedHex }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const hexLayerRef = useRef<L.LayerGroup | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
      preferCanvas: false,
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

    // Fly to Berlin after a beat
    setTimeout(() => {
      map.flyTo([52.515, 13.405], 11.2, { duration: 2.6, easeLinearity: 0.2 });
    }, 400);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Markers
  useEffect(() => {
    const layer = markerLayerRef.current;
    if (!layer) return;
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
  }, [locations]);

  // Hex layer (re-render when cells or selection change)
  const cellKey = useMemo(
    () => hexCells.map((c) => `${c.h3}:${c.intensity.toFixed(1)}`).join("|"),
    [hexCells],
  );

  useEffect(() => {
    const layer = hexLayerRef.current;
    if (!layer) return;
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
      polygon.on("mouseover", function () {
        polygon.setStyle({ weight: 2, color: "#7BFFFF" });
      });
      polygon.on("mouseout", function () {
        if (selectedHex !== cell.h3) {
          polygon.setStyle({ weight: style.weight, color: style.color });
        }
      });
      polygon.addTo(layer);
      // Stagger via inline style on the SVG path after add
      queueMicrotask(() => {
        const el = (polygon as unknown as { _path?: SVGPathElement })._path;
        if (el) {
          el.style.setProperty("--delay", `${(idx % 40) * 35}ms`);
          el.style.filter = `drop-shadow(0 0 6px ${style.glow})`;
        }
      });
    });
  }, [cellKey, selectedHex, onHexSelect, hexCells]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}
