import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { IntroSequence } from "@/features/pulse/IntroSequence";
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
  const [introDone, setIntroDone] = useState(false);
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
        {!revealing && introDone && (
          <LandingScreen key="landing" onSubmit={setBrand} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!introDone && <IntroSequence key="intro" onDone={() => setIntroDone(true)} />}
      </AnimatePresence>
    </main>
  );
}

