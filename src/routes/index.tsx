import { createFileRoute } from "@tanstack/react-router";
import { MapApp } from "@/features/pulse/MapApp";
import { SideNav } from "@/features/pulse/hud/SideNav";
import { DEFAULT_BRAND, MOCK_LOCATIONS } from "@/features/pulse/mockData";

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
  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden bg-[#05030d] text-white">
      <SideNav brand={DEFAULT_BRAND} />
      <div
        className="relative"
        style={{ marginLeft: 72, width: "calc(100vw - 72px)" }}
      >
        <MapApp brand={DEFAULT_BRAND} locations={MOCK_LOCATIONS} />
      </div>
    </main>
  );
}
