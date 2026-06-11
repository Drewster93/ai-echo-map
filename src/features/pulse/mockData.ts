import type { Location, PromptResult, Assistant } from "./types";

export const COMPETITORS = ["Brewline", "Northsip", "Caffea", "Morningfox", "Grindhouse"];

const GENERIC_PROMPTS = [
  "Best specialty coffee near me",
  "Where to work from a café",
  "Best flat white in the city",
  "Pet-friendly coffee shops",
  "Quiet café for reading",
  "Coffee with WiFi",
  "Best espresso downtown",
  "Coffee shop open late",
];

const PROMPTS_BY_CITY: Record<string, string[]> = {
  Berlin: ["Best coffee Alexanderplatz", "Specialty coffee Kreuzberg", "Quiet café Prenzlauer Berg", "Best flat white Berlin", "Coffee shops open late Berlin", "Pet-friendly café Mitte"],
  Paris: ["Specialty coffee Le Marais", "Coffee shop near Louvre", "Best espresso Saint-Germain", "Pet-friendly café Paris", "Coffee with terrace Paris", "Quiet café Montmartre"],
  London: ["Best coffee Shoreditch", "Specialty coffee Soho", "Coffee WiFi London Bridge", "Quiet café Notting Hill", "Best flat white London", "Coffee near Liverpool Street"],
  Amsterdam: ["Specialty coffee Jordaan", "Best flat white De Pijp", "Quiet café Vondelpark", "Pet-friendly coffee Amsterdam", "Coffee near Centraal", "Specialty roasters Oost"],
  Milan: ["Specialty coffee Brera", "Best espresso Navigli", "Best flat white Porta Romana", "Coffee near Duomo Milan", "Quiet café Isola"],
  Madrid: ["Specialty coffee Malasaña", "Best flat white Chueca", "Coffee near Sol Madrid", "Pet-friendly café Madrid"],
  Stockholm: ["Specialty coffee Södermalm", "Best fika Stockholm", "Coffee shop Östermalm", "Quiet café Vasastan"],
  Istanbul: ["Specialty coffee Karaköy", "Best Turkish coffee Beyoğlu", "Coffee near Galata Tower", "Quiet café Kadıköy"],
  "New York": ["Specialty coffee SoHo", "Best flat white Lower East Side", "Coffee WiFi Midtown", "Quiet café Greenpoint", "Pet-friendly coffee Brooklyn", "Coffee near Bryant Park"],
  "San Francisco": ["Specialty coffee Mission", "Best flat white SoMa", "Quiet café Noe Valley", "Coffee near Salesforce Tower"],
  "Los Angeles": ["Specialty coffee Silver Lake", "Best flat white Venice", "Coffee shop DTLA", "Quiet café Highland Park"],
  Toronto: ["Specialty coffee Queen West", "Best flat white Kensington Market", "Quiet café Leslieville", "Coffee near Union Station"],
  "São Paulo": ["Specialty coffee Vila Madalena", "Best espresso Pinheiros", "Coffee shop Itaim Bibi"],
  "Buenos Aires": ["Specialty coffee Palermo", "Best flat white Recoleta", "Coffee shop San Telmo"],
  Dubai: ["Specialty coffee Alserkal", "Best flat white DIFC", "Coffee near Dubai Marina", "Quiet café Jumeirah"],
  "Cape Town": ["Specialty coffee Woodstock", "Best flat white Sea Point", "Coffee shop De Waterkant"],
  Lagos: ["Specialty coffee Lekki", "Best café Victoria Island", "Coffee shop Ikoyi"],
  Mumbai: ["Specialty coffee Bandra", "Best espresso Lower Parel", "Coffee shop Colaba"],
  Bangalore: ["Specialty coffee Indiranagar", "Best flat white Koramangala", "Coffee shop Jayanagar"],
  Bangkok: ["Specialty coffee Ari", "Best flat white Thonglor", "Coffee shop Ekkamai", "Quiet café Sathorn"],
  Seoul: ["Specialty coffee Seongsu", "Best flat white Itaewon", "Coffee shop Hongdae", "Quiet café Yeonnam"],
  "Hong Kong": ["Specialty coffee Sheung Wan", "Best flat white Central", "Coffee shop Sai Ying Pun"],
  Shanghai: ["Specialty coffee Jing'an", "Best flat white Xuhui", "Coffee shop French Concession"],
  Tokyo: ["Specialty coffee Shibuya", "Quiet café Daikanyama", "Best pour-over Nakameguro", "Coffee near Tokyo Station", "Specialty coffee Shimokitazawa"],
  Singapore: ["Specialty coffee Tiong Bahru", "Best flat white Telok Ayer", "Quiet café Tanjong Pagar", "Coffee near Raffles Place"],
  Sydney: ["Specialty coffee Surry Hills", "Best flat white Newtown", "Quiet café Paddington", "Coffee near Circular Quay"],
  Melbourne: ["Specialty coffee Fitzroy", "Best flat white Collingwood", "Coffee shop CBD", "Quiet café Carlton"],
};

const ASSISTANTS: Exclude<Assistant, "all">[] = ["chatgpt", "perplexity", "gemini", "claude"];

type Seed = [string, string, number, number]; // [area, name, lat, lng]

const SEEDS: Record<string, Seed[]> = {
  // Europe — deliberately thinned to avoid crowding at world zoom
  London: [
    ["Shoreditch", "Lumen Shoreditch", 51.526, -0.078],
    ["Soho", "Lumen Soho", 51.513, -0.133],
    ["Notting Hill", "Lumen Portobello", 51.515, -0.205],
    ["London Bridge", "Lumen Borough", 51.505, -0.09],
  ],
  Paris: [
    ["Le Marais", "Lumen Marais", 48.857, 2.359],
    ["Saint-Germain", "Lumen Saint-Germain", 48.853, 2.333],
    ["Montmartre", "Lumen Abbesses", 48.884, 2.338],
  ],
  Berlin: [
    ["Mitte", "Lumen Mitte Flagship", 52.524, 13.404],
    ["Kreuzberg", "Lumen Bergmannkiez", 52.491, 13.39],
    ["Prenzlauer Berg", "Lumen Kollwitzplatz", 52.537, 13.418],
  ],
  Amsterdam: [
    ["Jordaan", "Lumen Jordaan", 52.374, 4.883],
    ["De Pijp", "Lumen De Pijp", 52.355, 4.893],
  ],
  Madrid: [
    ["Malasaña", "Lumen Malasaña", 40.426, -3.703],
    ["Salamanca", "Lumen Serrano", 40.428, -3.687],
  ],
  Milan: [
    ["Brera", "Lumen Brera", 45.473, 9.187],
    ["Navigli", "Lumen Navigli", 45.451, 9.176],
  ],
  Stockholm: [
    ["Södermalm", "Lumen Södermalm", 59.314, 18.072],
    ["Östermalm", "Lumen Östermalm", 59.338, 18.087],
  ],
  Istanbul: [
    ["Karaköy", "Lumen Karaköy", 41.024, 28.977],
    ["Beyoğlu", "Lumen Beyoğlu", 41.036, 28.977],
    ["Kadıköy", "Lumen Kadıköy", 40.99, 29.026],
  ],
  // North America
  "New York": [
    ["SoHo", "Lumen SoHo", 40.723, -74.0],
    ["Williamsburg", "Lumen Williamsburg", 40.714, -73.957],
    ["Midtown", "Lumen Bryant Park", 40.754, -73.984],
    ["West Village", "Lumen West Village", 40.735, -74.004],
  ],
  "San Francisco": [
    ["Mission", "Lumen Mission", 37.76, -122.418],
    ["Hayes Valley", "Lumen Hayes Valley", 37.776, -122.425],
  ],
  "Los Angeles": [
    ["Silver Lake", "Lumen Silver Lake", 34.087, -118.27],
    ["Venice", "Lumen Venice", 33.99, -118.466],
  ],
  Toronto: [
    ["Queen West", "Lumen Queen West", 43.647, -79.42],
    ["Kensington", "Lumen Kensington", 43.654, -79.401],
    ["Leslieville", "Lumen Leslieville", 43.663, -79.337],
  ],
  // South America
  "São Paulo": [
    ["Vila Madalena", "Lumen Vila Madalena", -23.546, -46.692],
    ["Pinheiros", "Lumen Pinheiros", -23.561, -46.683],
  ],
  "Buenos Aires": [
    ["Palermo", "Lumen Palermo", -34.583, -58.426],
    ["Recoleta", "Lumen Recoleta", -34.588, -58.393],
  ],
  // Middle East / Africa
  Dubai: [
    ["DIFC", "Lumen DIFC", 25.212, 55.281],
    ["Dubai Marina", "Lumen Marina", 25.08, 55.14],
  ],
  "Cape Town": [
    ["Woodstock", "Lumen Woodstock", -33.926, 18.448],
    ["Sea Point", "Lumen Sea Point", -33.917, 18.385],
  ],
  Lagos: [
    ["Lekki", "Lumen Lekki", 6.448, 3.504],
    ["Victoria Island", "Lumen VI", 6.428, 3.428],
  ],
  // Asia
  Mumbai: [
    ["Bandra", "Lumen Bandra", 19.06, 72.836],
    ["Lower Parel", "Lumen Lower Parel", 18.999, 72.83],
  ],
  Bangalore: [
    ["Indiranagar", "Lumen Indiranagar", 12.971, 77.641],
    ["Koramangala", "Lumen Koramangala", 12.935, 77.624],
  ],
  Bangkok: [
    ["Ari", "Lumen Ari", 13.78, 100.545],
    ["Thonglor", "Lumen Thonglor", 13.732, 100.585],
  ],
  Seoul: [
    ["Seongsu", "Lumen Seongsu", 37.544, 127.056],
    ["Hongdae", "Lumen Hongdae", 37.557, 126.924],
    ["Gangnam", "Lumen Gangnam", 37.498, 127.028],
  ],
  "Hong Kong": [
    ["Central", "Lumen Central", 22.282, 114.158],
    ["Causeway Bay", "Lumen Causeway Bay", 22.28, 114.184],
  ],
  Shanghai: [
    ["Jing'an", "Lumen Jing'an", 31.229, 121.448],
    ["French Concession", "Lumen FFC", 31.214, 121.45],
  ],
  Tokyo: [
    ["Shibuya", "Lumen Shibuya", 35.659, 139.7],
    ["Daikanyama", "Lumen Daikanyama", 35.65, 139.703],
    ["Shinjuku", "Lumen Shinjuku", 35.69, 139.7],
    ["Ginza", "Lumen Ginza", 35.671, 139.764],
  ],
  Singapore: [
    ["Tiong Bahru", "Lumen Tiong Bahru", 1.286, 103.832],
    ["Telok Ayer", "Lumen Telok Ayer", 1.281, 103.847],
    ["Joo Chiat", "Lumen Joo Chiat", 1.31, 103.903],
  ],
  // Oceania
  Sydney: [
    ["Surry Hills", "Lumen Surry Hills", -33.886, 151.211],
    ["Newtown", "Lumen Newtown", -33.898, 151.179],
    ["CBD", "Lumen Circular Quay", -33.861, 151.211],
    ["Bondi", "Lumen Bondi", -33.891, 151.276],
  ],
  Melbourne: [
    ["Fitzroy", "Lumen Fitzroy", -37.799, 144.978],
    ["CBD", "Lumen Flinders Lane", -37.816, 144.967],
    ["Brunswick", "Lumen Brunswick", -37.769, 144.96],
  ],
};


export function rand(seed: number) {
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
  const pool = PROMPTS_BY_CITY[city] ?? GENERIC_PROMPTS;
  const count = 5 + Math.floor(rng() * 4);
  // Fisher-Yates shuffle — deterministic number of rng() calls regardless of engine
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picked = shuffled.slice(0, count);
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
  type Row = [string, string, string, number, number];
  const all: Row[] = [];
  for (const [city, seeds] of Object.entries(SEEDS)) {
    for (const s of seeds) {
      all.push([city, s[0], s[1], s[2], s[3]]);
    }
  }

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
      city,
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
