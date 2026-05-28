import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { IntroSequence } from "@/features/pulse/IntroSequence";
import { LandingScreen } from "@/features/pulse/LandingScreen";
import { MapApp } from "@/features/pulse/MapApp";
import { SideNav } from "@/features/pulse/hud/SideNav";
import { buildLocationsFromPlaces } from "@/features/pulse/buildFromPlaces";
import { searchBrandLocations } from "@/lib/googlePlaces/search.functions";
import type { GooglePlacesLocation } from "@/lib/googlePlaces/types";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Local GEO Pulse · Uberall" },
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
  const revealing = brand !== null;
  const fetchLocations = useServerFn(searchBrandLocations);

  const locations = useMemo(
    () => (places && brand ? buildLocationsFromPlaces(places, brand) : null),
    [places, brand],
  );

  async function handleBrand(value: string) {
    setBrand(value);
    setPlaces(null);
    const toastId = toast.loading(`Searching Google Places for "${value}"…`);
    try {
      const res = await fetchLocations({
        data: { brand: value, country: "global", maxLocations: 20 },
      });
      if (res.error) {
        toast.error(`Google Places: ${res.error}`, { id: toastId });
        return;
      }
      setPlaces(res.locations);
      const mapped = buildLocationsFromPlaces(res.locations, value);
      toast.success(`Found ${mapped.length} locations for ${value}`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to reach Google Places", { id: toastId });
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




