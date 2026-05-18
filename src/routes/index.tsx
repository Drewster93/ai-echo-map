import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LandingScreen } from "@/features/pulse/LandingScreen";
import { MapApp } from "@/features/pulse/MapApp";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AI Visibility Pulse · Uberall" },
      {
        name: "description",
        content:
          "See where AI assistants like ChatGPT, Perplexity, Gemini and Claude mention your brand — mapped, hex by hex, in real time.",
      },
    ],
  }),
});

function Index() {
  const [brand, setBrand] = useState<string | null>(null);
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#05030d] text-white">
      <AnimatePresence mode="wait">
        {brand === null ? (
          <LandingScreen key="landing" onSubmit={setBrand} />
        ) : (
          <MapApp key="map" brand={brand} onSwitchBrand={() => setBrand(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
