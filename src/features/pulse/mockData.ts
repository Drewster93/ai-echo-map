import type { Location, PromptResult, Assistant } from "./types";

export const COMPETITORS = ["Brewline", "Northsip", "Caffea", "Morningfox", "Grindhouse"];

const PROMPTS_BY_CITY: Record<string, string[]> = {
  Berlin: [
    "Best coffee shop near Alexanderplatz",
    "Where can I work from a café in Berlin?",
    "Pet-friendly coffee shops in Mitte",
    "Coffee with the best WiFi in Berlin",
    "Specialty coffee Kreuzberg",
    "Quiet café Prenzlauer Berg",
    "Best flat white Berlin",
    "Coffee shops open late Berlin",
  ],
  Paris: [
    "Best specialty coffee in Le Marais",
    "Where to work remotely in Paris",
    "Coffee shop near Louvre",
    "Best espresso Saint-Germain",
    "Pet-friendly café Paris",
    "Quiet coffee shop Montmartre",
    "Coffee with terrace Paris",
  ],
  London: [
    "Best coffee shop in Shoreditch",
    "Where to work from a café in London",
    "Specialty coffee Soho",
    "Coffee with WiFi London Bridge",
    "Quiet café Notting Hill",
    "Best flat white London",
    "Coffee near Liverpool Street",
  ],
};

const ASSISTANTS: Exclude<Assistant, "all">[] = ["chatgpt", "perplexity", "gemini", "claude"];

// Berlin
const berlinSeeds: Array<[string, string, number, number]> = [
  ["Mitte", "Lumen Mitte Flagship", 52.524, 13.404],
  ["Mitte", "Lumen Hackescher Markt", 52.5225, 13.4023],
  ["Mitte", "Lumen Rosenthaler", 52.526, 13.4015],
  ["Mitte", "Lumen Friedrichstraße", 52.519, 13.388],
  ["Kreuzberg", "Lumen Bergmannkiez", 52.491, 13.39],
  ["Kreuzberg", "Lumen Kotti", 52.499, 13.418],
  ["Kreuzberg", "Lumen Görlitzer", 52.497, 13.43],
  ["Prenzlauer Berg", "Lumen Kollwitzplatz", 52.537, 13.418],
  ["Prenzlauer Berg", "Lumen Helmholtzplatz", 52.547, 13.42],
  ["Friedrichshain", "Lumen Boxhagener", 52.512, 13.462],
  ["Friedrichshain", "Lumen RAW", 52.508, 13.453],
  ["Charlottenburg", "Lumen Savignyplatz", 52.506, 13.32],
  ["Neukölln", "Lumen Reuterkiez", 52.488, 13.428],
];

// Paris
const parisSeeds: Array<[string, string, number, number]> = [
  ["Le Marais", "Lumen Marais", 48.857, 2.359],
  ["Le Marais", "Lumen Saint-Paul", 48.854, 2.362],
  ["Saint-Germain", "Lumen Saint-Germain", 48.853, 2.333],
  ["Montmartre", "Lumen Abbesses", 48.884, 2.338],
  ["Canal Saint-Martin", "Lumen Canal", 48.872, 2.366],
  ["Bastille", "Lumen Bastille", 48.853, 2.369],
  ["Latin Quarter", "Lumen Sorbonne", 48.848, 2.344],
  ["Pigalle", "Lumen Pigalle", 48.882, 2.337],
  ["Belleville", "Lumen Belleville", 48.872, 2.378],
];

// London
const londonSeeds: Array<[string, string, number, number]> = [
  ["Shoreditch", "Lumen Shoreditch", 51.526, -0.078],
  ["Shoreditch", "Lumen Old Street", 51.525, -0.087],
  ["Soho", "Lumen Soho", 51.513, -0.133],
  ["Soho", "Lumen Carnaby", 51.513, -0.139],
  ["Covent Garden", "Lumen Covent", 51.512, -0.123],
  ["Notting Hill", "Lumen Portobello", 51.515, -0.205],
  ["Camden", "Lumen Camden", 51.539, -0.142],
  ["London Bridge", "Lumen Borough", 51.505, -0.09],
  ["Hackney", "Lumen Broadway Market", 51.535, -0.063],
];

export function rand(seed: number) {
  // Mulberry32
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPrompts(city: string, score: number, rng: () => number): PromptResult[] {
  const pool = PROMPTS_BY_CITY[city];
  const count = 5 + Math.floor(rng() * 4); // 5-8
  const picked = [...pool].sort(() => rng() - 0.5).slice(0, count);
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

function buildLocations(): Location[] {
  const rng = rand(42);
  const all: Array<[string, string, string, number, number]> = [
    ...berlinSeeds.map((s) => ["Berlin", ...s] as [string, string, string, number, number]),
    ...parisSeeds.map((s) => ["Paris", ...s] as [string, string, string, number, number]),
    ...londonSeeds.map((s) => ["London", ...s] as [string, string, string, number, number]),
  ];
  return all.map((row, i) => {
    const [city, area, name, lat, lng] = row;
    const base = 30 + Math.floor(rng() * 65);
    const scoresByAssistant = ASSISTANTS.reduce(
      (acc, a) => {
        acc[a] = Math.max(0, Math.min(100, base + Math.floor((rng() - 0.5) * 40)));
        return acc;
      },
      {} as Record<Exclude<Assistant, "all">, number>,
    );
    const history7d = Array.from({ length: 7 }, (_, d) => {
      const drift = (rng() - 0.4) * 8;
      return Math.max(5, Math.min(98, base - 18 + d * 3 + drift));
    });
    return {
      id: `loc-${i}`,
      city: city as Location["city"],
      cluster: `${city} ${area}`,
      name,
      lat,
      lng,
      visibilityScore: base,
      scoresByAssistant,
      history7d,
      prompts: buildPrompts(city, base, rng),
    };
  });
}

export const MOCK_LOCATIONS: Location[] = buildLocations();

export const DEFAULT_BRAND = "Lumen Coffee";

export function getDateLabels(): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(
      d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    );
  }
  return out;
}
