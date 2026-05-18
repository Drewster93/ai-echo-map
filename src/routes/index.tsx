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
  const revealing = brand !== null;
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#05030d] text-white">
      {revealing && (
        <MapApp
          brand={brand ?? "Preview"}
          onSwitchBrand={() => setBrand(null)}
          revealing={revealing}
        />
      )}
      <AnimatePresence>
        {!revealing && <LandingScreen key="landing" onSubmit={setBrand} />}
      </AnimatePresence>
    </main>
  );
}
