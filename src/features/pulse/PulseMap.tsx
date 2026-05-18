import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { HexCell, Location } from "./types";
import { styleForIntensity } from "./hexUtils";
import type { PulseMapHandle, TourFocus } from "./tour/useBlindSpotTour";
import type { CompetitorMarker } from "./competitorData";

interface Props {
  locations: Location[];
  hexCells: HexCell[];
  onHexSelect: (h3: string | null) => void;
  selectedHex: string | null;
  /** When true, dive from high-altitude into the initial framing. */
  dive?: boolean;
  /** Fires once after the initial dive finishes. */
  onArrived?: () => void;
  /** Fires when the user touches the map (drag/wheel/touch). */
  onUserInteract?: () => void;
  /** Active focus window — non-focused cells dim out. */
  focus?: TourFocus | null;
  /** Ghost competitor markers — rendered when non-empty. */
  competitorMarkers?: CompetitorMarker[];
}

type LeafletNS = typeof import("leaflet");

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function cellCentroid(boundary: [number, number][]): [number, number] {
  let lat = 0;
  let lng = 0;
  for (const [a, b] of boundary) {
    lat += a;
    lng += b;
  }
  return [lat / boundary.length, lng / boundary.length];
}

export const PulseMap = forwardRef<PulseMapHandle, Props>(function PulseMap(
  { locations, hexCells, onHexSelect, selectedHex, dive = true, onArrived, onUserInteract, focus = null, competitorMarkers = [] },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const LRef = useRef<LeafletNS | null>(null);
  const hexLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const competitorLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const readyRef = useRef(false);
  const dovedRef = useRef(false);
  const dataRenderedRef = useRef(false);
  const initialBoundsRef = useRef<import("leaflet").LatLngBounds | null>(null);
  const arrivedFiredRef = useRef(false);
  const focusRef = useRef<TourFocus | null>(focus);
  focusRef.current = focus;
  const onUserInteractRef = useRef(onUserInteract);
  onUserInteractRef.current = onUserInteract;
  const onArrivedRef = useRef(onArrived);
  onArrivedRef.current = onArrived;

  useImperativeHandle(
    ref,
    (): PulseMapHandle => ({
      flyTo: (center, zoom, durationSec = 1.2) =>
        new Promise((resolve) => {
          const map = mapRef.current;
          if (!map) {
            resolve();
            return;
          }
          if (durationSec <= 0) {
            map.setView(center, zoom);
            resolve();
            return;
          }
          map.flyTo(center, zoom, { duration: durationSec, easeLinearity: 0.25 });
          map.once("moveend", () => resolve());
        }),
      flyToInitial: (durationSec = 1.2) =>
        new Promise((resolve) => {
          const map = mapRef.current;
          const bounds = initialBoundsRef.current;
          if (!map || !bounds) {
            resolve();
            return;
          }
          if (durationSec <= 0) {
            map.fitBounds(bounds, { padding: [120, 120], animate: false });
            resolve();
            return;
          }
          map.flyToBounds(bounds, {
            padding: [120, 120],
            duration: durationSec,
            easeLinearity: 0.25,
          });
          map.once("moveend", () => resolve());
        }),
      stop: () => {
        mapRef.current?.stop();
      },
    }),
    [],
  );

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
      });
      const bounds = computeBounds(locations);
      initialBoundsRef.current = bounds;
      if (bounds) {
        map.fitBounds(bounds, { padding: [120, 120], animate: false });
        map.setZoom(Math.max(map.getZoom() - 1.5, 3));
      } else {
        map.setView([50, 5], 4);
      }
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics",
          maxZoom: 19,
          keepBuffer: 4,
        },
      ).addTo(map);
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, pane: "shadowPane", opacity: 0.9 },
      ).addTo(map);
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, pane: "shadowPane", opacity: 0.85 },
      ).addTo(map);
      mapRef.current = map;
      hexLayerRef.current = L.layerGroup().addTo(map);
      const overlayPane = map.getPanes().overlayPane;
      if (overlayPane) overlayPane.classList.add("hex-overlay-pane");
      markerLayerRef.current = L.layerGroup().addTo(map);
      competitorLayerRef.current = L.layerGroup().addTo(map);
      readyRef.current = true;

      // User-interact listeners — cancel tour on real user input
      const fireInteract = () => onUserInteractRef.current?.();
      const container = map.getContainer();
      container.addEventListener("mousedown", fireInteract);
      container.addEventListener("wheel", fireInteract, { passive: true });
      container.addEventListener("touchstart", fireInteract, { passive: true });

      if (dive && !dovedRef.current) {
        dovedRef.current = true;
        runDive(map);
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
    const activeFocus = focusRef.current;
    hexCells.forEach((cell, idx) => {
      const style = styleForIntensity(cell.intensity);
      const isSelected = selectedHex === cell.h3;
      let dim = false;
      if (activeFocus) {
        const c = cellCentroid(cell.boundary);
        const dist = haversineKm(c, activeFocus.center);
        dim = dist > activeFocus.radiusKm;
      }
      const fillOpacity = dim ? 0.08 : style.fillOpacity;
      const strokeOpacity = dim ? 0.12 : 0.55;
      const polygon = L.polygon(cell.boundary, {
        fillColor: style.fillColor,
        fillOpacity,
        color: isSelected ? "#7BFFFF" : style.color,
        weight: isSelected ? 2 : style.weight,
        opacity: isSelected ? 1 : strokeOpacity,
        lineJoin: "round",
        className: dim ? "hex-cell hex-dim" : "hex-fade-in hex-cell",
        interactive: true,
        bubblingMouseEvents: false,
      });
      polygon.on("click", () => onHexSelect(cell.h3));
      polygon.on("mouseover", () => {
        polygon.setStyle({ weight: 2, color: "#7BFFFF", opacity: 1 });
      });
      polygon.on("mouseout", () => {
        if (selectedHex !== cell.h3) {
          polygon.setStyle({ weight: style.weight, color: style.color, opacity: strokeOpacity });
        }
      });
      polygon.addTo(layer);
      queueMicrotask(() => {
        const el = (polygon as unknown as { _path?: SVGPathElement })._path;
        if (!el) return;
        el.style.setProperty("--delay", `${(idx % 40) * 35}ms`);
        if (dim) {
          el.style.filter = "none";
          el.style.setProperty("opacity", "0.45");
          return;
        }
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
      });
    });
  }

  function renderCompetitors() {
    const L = LRef.current;
    const layer = competitorLayerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    competitorMarkers.forEach((m) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="ghost-marker"><span class="ghost-ring"></span><span class="ghost-initial">${m.initial}</span></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker([m.lat, m.lng], { icon, interactive: false, keyboard: false }).addTo(layer);
    });
  }

  function paintData() {
    if (dataRenderedRef.current) return;
    dataRenderedRef.current = true;
    renderMarkers();
    renderHex();
    renderCompetitors();
  }

  function runDive(map: import("leaflet").Map) {
    const L = LRef.current;
    const bounds = computeBounds(locations);
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!L || !bounds) {
      paintData();
      fireArrived();
      return;
    }
    const padded = bounds.pad(0.15);
    const targetCenter = padded.getCenter();
    const targetZoom = Math.min(map.getBoundsZoom(padded), 7);
    initialBoundsRef.current = bounds;
    if (reduced) {
      map.setView(targetCenter, targetZoom);
      paintData();
      fireArrived();
      return;
    }
    map.flyTo(targetCenter, targetZoom, { duration: 3.6, easeLinearity: 0.1 });
    map.once("moveend", () => {
      paintData();
      fireArrived();
    });
  }

  function fireArrived() {
    if (arrivedFiredRef.current) return;
    arrivedFiredRef.current = true;
    onArrivedRef.current?.();
  }

  function computeBounds(locs: Location[]): import("leaflet").LatLngBounds | null {
    const L = LRef.current;
    if (!L || locs.length === 0) return null;
    return L.latLngBounds(locs.map((l) => [l.lat, l.lng] as [number, number]));
  }

  useEffect(() => {
    if (!dive || dovedRef.current) return;
    const map = mapRef.current;
    if (!readyRef.current || !map) return;
    dovedRef.current = true;
    runDive(map);
  }, [dive]);

  useEffect(() => {
    if (readyRef.current && dataRenderedRef.current) renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  const cellKey = useMemo(
    () => hexCells.map((c) => `${c.h3}:${c.intensity.toFixed(1)}`).join("|"),
    [hexCells],
  );
  const focusKey = focus ? `${focus.center[0]},${focus.center[1]},${focus.radiusKm}` : "none";
  useEffect(() => {
    if (readyRef.current && dataRenderedRef.current) renderHex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellKey, selectedHex, focusKey]);

  const competitorKey = useMemo(
    () => competitorMarkers.map((m) => `${m.lat},${m.lng},${m.name}`).join("|"),
    [competitorMarkers],
  );
  useEffect(() => {
    if (readyRef.current && dataRenderedRef.current) renderCompetitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitorKey]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
});
