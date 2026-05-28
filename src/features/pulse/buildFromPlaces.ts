import type { GooglePlacesLocation } from "@/lib/googlePlaces/types";
import type { Assistant, Location, PromptResult } from "./types";
import { rand } from "./mockData";

const ASSISTANTS: Exclude<Assistant, "all">[] = ["chatgpt", "perplexity", "gemini", "claude"];
const COMPETITORS = ["Competitor A", "Competitor B", "Competitor C", "Competitor D"];

function extractCity(address: string): string {
  // Take second-to-last comma part (typically "<postcode> City") and strip leading postcode/digits.
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return parts[0] || "Unknown";
  const candidate = parts[parts.length - 2];
  return candidate.replace(/^[\d\s-]+/, "").trim() || candidate;
}

function buildPrompts(brand: string, city: string, score: number, rng: () => number): PromptResult[] {
  const templates = [
    `Best ${brand} location in ${city}`,
    `${brand} near me ${city}`,
    `Is ${brand} good in ${city}?`,
    `Top alternatives to ${brand} in ${city}`,
    `${brand} ${city} reviews`,
    `Where to find ${brand} in ${city}`,
    `${brand} opening hours ${city}`,
  ];
  const count = 5 + Math.floor(rng() * 3);
  const picked = [...templates].sort(() => rng() - 0.5).slice(0, count);
  return picked.map((prompt) => {
    const r = rng() * 100;
    let status: PromptResult["status"];
    if (r < score - 10) status = "mentioned";
    else if (r < score + 25) status = "competitor_higher";
    else status = "not_mentioned";
    return {
      prompt,
      status,
      assistant: ASSISTANTS[Math.floor(rng() * ASSISTANTS.length)],
      competitor:
        status !== "mentioned"
          ? COMPETITORS[Math.floor(rng() * COMPETITORS.length)]
          : undefined,
    };
  });
}

export function buildLocationsFromPlaces(
  places: GooglePlacesLocation[],
  brand: string,
): Location[] {
  return places
    .filter((p) => p.latitude && p.longitude)
    .map((p, i) => {
      const rng = rand(1000 + i);
      const city = extractCity(p.address);
      // Seed score from real review signals so the map reflects something tangible.
      const reviewBoost = Math.min(25, Math.log10(Math.max(1, p.reviewCount)) * 8);
      const ratingBoost = p.rating ? (p.rating - 3) * 12 : 0;
      const base = Math.max(
        15,
        Math.min(95, 50 + ratingBoost + reviewBoost + (rng() - 0.5) * 12),
      );
      const scoresByAssistant = ASSISTANTS.reduce(
        (acc, a) => {
          acc[a] = Math.max(0, Math.min(100, base + Math.floor((rng() - 0.5) * 30)));
          return acc;
        },
        {} as Record<Exclude<Assistant, "all">, number>,
      );
      const history7d = Array.from({ length: 7 }, (_, d) => {
        const drift = (rng() - 0.4) * 8;
        return Math.max(5, Math.min(98, base - 14 + d * 2.5 + drift));
      });
      return {
        id: `gbp-${p.placeId || i}`,
        city,
        cluster: city,
        name: p.name,
        lat: p.latitude,
        lng: p.longitude,
        visibilityScore: base,
        scoresByAssistant,
        history7d,
        prompts: buildPrompts(brand, city, base, rng),
      };
    });
}
