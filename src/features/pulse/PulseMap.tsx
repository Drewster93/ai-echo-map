import { useEffect, useMemo, useRef } from "react";
import type { HexCell, Location } from "./types";
import { styleForIntensity } from "./hexUtils";
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

export function PulseMap({
  locations,
  hexCells,
  onHexSelect,
  selectedHex,
  dive = true,
  onArrived,
  onUserInteract,
  competitorMarkers = [],
}: Props) {
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
  const locationsRef = useRef<Location[]>(locations);
  locationsRef.current = locations;
  const hexCellsRef = useRef<HexCell[]>(hexCells);
  hexCellsRef.current = hexCells;
  const onHexSelectRef = useRef(onHexSelect);
  onHexSelectRef.current = onHexSelect;
  const onUserInteractRef = useRef(onUserInteract);
  onUserInteractRef.current = onUserInteract;
  const onArrivedRef = useRef(onArrived);
  onArrivedRef.current = onArrived;

  // Init map once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(containerRef.current, {
        zoomControl: true,
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
      // Light basemap — Google-Maps style standard view
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
          keepBuffer: 6,
          className: "basemap-tiles",
        },
      ).addTo(map);
      mapRef.current = map;
      hexLayerRef.current = L.layerGroup().addTo(map);
      const overlayPane = map.getPanes().overlayPane;
      if (overlayPane) overlayPane.classList.add("hex-overlay-pane");
      // Dedicated high-z pane for pins so they always sit above tiles/overlays.
      const pinPane = map.createPane("pulse-pins");
      pinPane.style.zIndex = "650";
      pinPane.style.pointerEvents = "auto";
      markerLayerRef.current = L.layerGroup().addTo(map);
      competitorLayerRef.current = L.layerGroup().addTo(map);
      readyRef.current = true;

      // User-interact listeners
      const fireInteract = () => onUserInteractRef.current?.();
      const container = map.getContainer();
      container.addEventListener("mousedown", fireInteract);
      container.addEventListener("wheel", fireInteract, { passive: true });
      container.addEventListener("touchstart", fireInteract, { passive: true });

      // Always re-render markers after map transforms so pins survive zooms and pans.
      const repaintMarkers = () => {
        renderMarkers();
        requestAnimationFrame(renderMarkers);
      };
      map.on("zoomend moveend viewreset", repaintMarkers);

      if (dive && !dovedRef.current) {
        dovedRef.current = true;
        runDive(map);
      } else {
        // No dive — paint immediately so pins appear without waiting on a moveend.
        paintData();
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

  function pinColorForScore(score: number): { fill: string; ring: string } {
    if (score >= 60) return { fill: "#34c759", ring: "#1f8b3d" }; // green
    if (score >= 40) return { fill: "#f5c518", ring: "#a8870b" }; // yellow
    return { fill: "#e53935", ring: "#9b1c1c" }; // red
  }

  function pinSvg(fill: string, ring: string, size: "sm" | "md" = "md"): string {
    const w = size === "md" ? 34 : 30;
    const h = size === "md" ? 44 : 38;
    const path =
      size === "md"
        ? "M17 1.5 C8.7 1.5 2 8.2 2 16.5 c0 10.5 15 25.5 15 25.5 s15-15 15-25.5 C32 8.2 25.3 1.5 17 1.5 z"
        : "M15 1 C7.3 1 1 7.3 1 15 c0 9.5 14 22 14 22 s14-12.5 14-22 C29 7.3 22.7 1 15 1 z";
    const cx = size === "md" ? 17 : 15;
    const cy = size === "md" ? 16.5 : 15;
    const r = size === "md" ? 5 : 4.5;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <filter id="ds" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" flood-opacity="0.45"/>
        </filter>
      </defs>
      <path filter="url(#ds)" d="${path}" fill="${fill}" stroke="white" stroke-width="3"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="${ring}" stroke-width="1"/>
    </svg>`;
  }

  const CITY_ZOOM_THRESHOLD = 9;

  function renderMarkers() {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!L || !layer || !map) return;
    layer.clearLayers();

    // Only render locations with valid coordinates so nothing silently disappears.
    const currentLocations = locationsRef.current;
    const currentHexCells = hexCellsRef.current;
    const validLocations = currentLocations.filter(
      (l) =>
        Number.isFinite(l.lat) &&
        Number.isFinite(l.lng) &&
        !(l.lat === 0 && l.lng === 0),
    );
    if (validLocations.length === 0) return;

    // Map each location to its current hex intensity so colors stay in sync with filters
    const scoreByLoc = new Map<string, number>();
    currentHexCells.forEach((c) => {
      c.locationIds?.forEach((id: string) => scoreByLoc.set(id, c.intensity));
    });

    const zoom = map.getZoom();

    // Coordinate-bucket size shrinks as you zoom in, so groups split apart
    // and every retrieved location remains represented by at least one pin.
    function bucketKey(loc: Location): string {
      const cityKey = (loc.city || loc.cluster || "").trim().toLowerCase();
      const grid = zoom < 4 ? 4 : zoom < 6 ? 2 : zoom < 8 ? 1 : 0.25;
      const latB = Math.round(loc.lat / grid) * grid;
      const lngB = Math.round(loc.lng / grid) * grid;
      return cityKey ? `${cityKey}@${latB},${lngB}` : `${latB},${lngB}`;
    }

    if (zoom < CITY_ZOOM_THRESHOLD) {
      // Aggregate per bucket — every group ALWAYS produces a visible pin,
      // including groups with a single location.
      const groups = new Map<string, Location[]>();
      validLocations.forEach((loc) => {
        const key = bucketKey(loc);
        const arr = groups.get(key) ?? [];
        arr.push(loc);
        groups.set(key, arr);
      });
      groups.forEach((locs) => {
        if (locs.length === 0) return;
        const lat = locs.reduce((s, l) => s + l.lat, 0) / locs.length;
        const lng = locs.reduce((s, l) => s + l.lng, 0) / locs.length;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        const avg =
          locs.reduce((s, l) => s + (scoreByLoc.get(l.id) ?? l.visibilityScore), 0) /
          locs.length;
        const { fill, ring } = pinColorForScore(avg);
        const count = locs.length;
        const icon = L.divIcon({
          className: "pulse-pin-wrap",
          html: `<div class="pulse-pin" style="position:relative">${pinSvg(fill, ring)}${
            count > 1
              ? `<span style="position:absolute;top:-6px;right:-6px;background:#111;color:#fff;border:1.5px solid #fff;border-radius:9999px;font-size:10px;font-weight:600;line-height:1;padding:3px 5px;min-width:16px;text-align:center;">${count}</span>`
              : ""
          }</div>`,
          iconSize: [36, 44],
          iconAnchor: [18, 42],
        });
        const marker = L.marker([lat, lng], { icon, riseOnHover: true, pane: "pulse-pins" }).addTo(layer);
        marker.on("click", () => {
          const locIds = new Set(locs.map((l) => l.id));
          const cell = hexCellsRef.current.find((c) => c.locationIds?.some((id) => locIds.has(id)));
          if (cell) onHexSelectRef.current(cell.h3);
          else {
            mapRef.current?.flyTo([lat, lng], CITY_ZOOM_THRESHOLD + 0.5, { duration: 0.8 });
          }
        });
      });
      return;
    }

    validLocations.forEach((loc) => {
      const score = scoreByLoc.get(loc.id) ?? loc.visibilityScore;
      const { fill, ring } = pinColorForScore(score);
      const icon = L.divIcon({
        className: "pulse-pin-wrap",
        html: `<div class="pulse-pin">${pinSvg(fill, ring, "md")}</div>`,
        iconSize: [34, 44],
        iconAnchor: [17, 42],
      });
      const marker = L.marker([loc.lat, loc.lng], { icon, riseOnHover: true, pane: "pulse-pins" }).addTo(layer);
      marker.on("click", () => {
        const cell = hexCellsRef.current.find((c) => c.locationIds?.includes(loc.id));
        if (cell) onHexSelectRef.current(cell.h3);
      });
    });
  }

  function renderHex() {
    // Hexes intentionally not rendered — premium pin-marker layout
    const layer = hexLayerRef.current;
    layer?.clearLayers();
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
    const padded = bounds.pad(0.35);
    const targetCenter = padded.getCenter();
    const targetZoom = Math.min(map.getBoundsZoom(padded), 5);
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
    if (!readyRef.current) return;
    // Always (re)paint when locations change. Marks dataRendered so other
    // effects know data has been drawn at least once.
    dataRenderedRef.current = true;
    renderMarkers();
    renderHex();
    renderCompetitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  const cellKey = useMemo(
    () => hexCells.map((c) => `${c.h3}:${c.intensity.toFixed(1)}`).join("|"),
    [hexCells],
  );
  useEffect(() => {
    if (!readyRef.current) return;
    renderHex();
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellKey, selectedHex]);

  const competitorKey = useMemo(
    () => competitorMarkers.map((m) => `${m.lat},${m.lng},${m.name}`).join("|"),
    [competitorMarkers],
  );
  useEffect(() => {
    if (readyRef.current) renderCompetitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitorKey]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}
