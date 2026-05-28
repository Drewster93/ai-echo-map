import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { IntroSequence } from "@/features/pulse/IntroSequence";
import { LandingScreen } from "@/features/pulse/LandingScreen";
import { MapApp } from "@/features/pulse/MapApp";
import { SideNav } from "@/features/pulse/hud/SideNav";
import { buildLocationsFromPlaces } from "@/features/pulse/buildFromPlaces";
import { MOCK_LOCATIONS } from "@/features/pulse/mockData";
import { searchBrandLocations } from "@/lib/googlePlaces/search.functions";
import type { GooglePlacesLocation } from "@/lib/googlePlaces/types";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AI Performance Pulse" },
      {
        name: "description",
        content:
          "See where AI assistants like ChatGPT, Perplexity, Gemini and Claude mention your brand — mapped, hex by hex, in real time.",
      },
    ],
  }),
});

function Index() {
  const [introDone, setIntroDone] = useState(false);
  const [brand, setBrand] = useState<string | null>(null);
  const [places, setPlaces] = useState<GooglePlacesLocation[] | null>(null);
  const [demoLocations, setDemoLocations] = useState<ReturnType<typeof buildLocationsFromPlaces> | null>(null);
  const revealing = brand !== null;
  const fetchLocations = useServerFn(searchBrandLocations);

  const locations = useMemo(
    () =>
      demoLocations ??
      (places && brand ? buildLocationsFromPlaces(places, brand) : null),
    [demoLocations, places, brand],
  );

  function applyDemoFallback(value: string, toastId: string | number) {
    const mapped = MOCK_LOCATIONS.map((l) => ({ ...l, brand: value }));
    setDemoLocations(mapped);
    toast.success(`Demo mode · ${mapped.length} sample locations for ${value}`, {
      id: toastId,
    });
  }

  async function handleBrand(value: string) {
    setBrand(value);
    setPlaces(null);
    setDemoLocations(null);
    const toastId = toast.loading(`Searching Google Places for "${value}"…`);
    try {
      const res = await fetchLocations({
        data: { brand: value, country: "global", maxLocations: 20 },
      });
      if (res.error || res.locations.length === 0) {
        applyDemoFallback(value, toastId);
        return;
      }
      setPlaces(res.locations);
      const mapped = buildLocationsFromPlaces(res.locations, value);
      toast.success(`Found ${mapped.length} locations for ${value}`, { id: toastId });
    } catch (err) {
      console.error(err);
      applyDemoFallback(value, toastId);
    }
  }


  return (
    <main
      className={
        revealing
          ? "relative min-h-screen w-screen overflow-x-hidden bg-[#05030d] text-white"
          : "relative h-screen w-screen overflow-hidden bg-[#05030d] text-white"
      }
    >
      {revealing && <SideNav brand={brand} />}
      {revealing && (
        <div
          className="relative"
          style={{ marginLeft: 72, width: "calc(100vw - 72px)" }}
        >
          <MapApp
            brand={brand ?? "Preview"}
            onSwitchBrand={() => {
              setBrand(null);
              setPlaces(null);
              setDemoLocations(null);
            }}
            revealing={revealing}
            locations={locations}
          />
        </div>
      )}
      <AnimatePresence mode="popLayout">
        {!revealing && introDone && (
          <LandingScreen key="landing" onSubmit={handleBrand} />
        )}
        {!introDone && (
          <IntroSequence key="intro" onDone={() => setIntroDone(true)} />
        )}
      </AnimatePresence>
    </main>
  );
}




