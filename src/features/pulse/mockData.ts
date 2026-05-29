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
  Amsterdam: [
    "Best specialty coffee in Jordaan",
    "Coffee shops to work from in Amsterdam",
    "Best flat white De Pijp",
    "Quiet café near Vondelpark",
    "Pet-friendly coffee Amsterdam",
    "Coffee near Amsterdam Centraal",
    "Specialty roasters Amsterdam Oost",
  ],
  Barcelona: [
    "Best coffee shop in El Born",
    "Specialty coffee Gràcia",
    "Where to work from a café Barcelona",
    "Best flat white Eixample",
    "Pet-friendly café Barceloneta",
    "Coffee with terrace Barcelona",
    "Quiet café Poblenou",
  ],
  Milan: [
    "Specialty coffee Brera",
    "Best espresso Navigli",
    "Coffee shop to work from Milan",
    "Best flat white Porta Romana",
    "Quiet café Isola",
    "Coffee near Duomo Milan",
    "Pet-friendly café Milan",
  ],
  "New York": [
    "Best coffee shop in Williamsburg",
    "Specialty coffee SoHo",
    "Where to work from a café NYC",
    "Best flat white Lower East Side",
    "Coffee with WiFi Midtown",
    "Quiet café Greenpoint",
    "Pet-friendly coffee Brooklyn",
    "Coffee near Bryant Park",
  ],
  "San Francisco": [
    "Best coffee shop in Mission District",
    "Specialty coffee Hayes Valley",
    "Where to work from a café SF",
    "Best flat white SoMa",
    "Quiet café Noe Valley",
    "Coffee near Salesforce Tower",
    "Pet-friendly coffee San Francisco",
  ],
  Toronto: [
    "Best specialty coffee Queen West",
    "Coffee shop to work from Toronto",
    "Best flat white Kensington Market",
    "Quiet café Leslieville",
    "Coffee near Union Station",
    "Pet-friendly café Toronto",
    "Specialty roasters Junction",
  ],
  Tokyo: [
    "Best specialty coffee Shibuya",
    "Quiet café Daikanyama",
    "Where to work from a café Tokyo",
    "Best pour-over Nakameguro",
    "Coffee near Tokyo Station",
    "Specialty coffee Shimokitazawa",
    "Pet-friendly café Tokyo",
    "Late-night coffee Shinjuku",
  ],
  Singapore: [
    "Best specialty coffee Tiong Bahru",
    "Coffee shop to work from Singapore",
    "Best flat white Telok Ayer",
    "Quiet café Tanjong Pagar",
    "Coffee near Raffles Place",
    "Pet-friendly café Singapore",
    "Specialty roasters Joo Chiat",
  ],
  Sydney: [
    "Best specialty coffee Surry Hills",
    "Coffee shop to work from Sydney",
    "Best flat white Newtown",
    "Quiet café Paddington",
    "Coffee near Circular Quay",
    "Pet-friendly café Bondi",
    "Specialty roasters Redfern",
    "Coffee with view Sydney Harbour",
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

const amsterdamSeeds: Array<[string, string, number, number]> = [
  ["Jordaan", "Lumen Jordaan", 52.374, 4.883],
  ["Jordaan", "Lumen Westerstraat", 52.376, 4.881],
  ["De Pijp", "Lumen De Pijp", 52.355, 4.893],
  ["De Pijp", "Lumen Albert Cuyp", 52.356, 4.896],
  ["Oost", "Lumen Javastraat", 52.363, 4.929],
  ["Centrum", "Lumen Negen Straatjes", 52.371, 4.886],
  ["Noord", "Lumen NDSM", 52.401, 4.892],
  ["Vondelpark", "Lumen Overtoom", 52.361, 4.866],
];

const barcelonaSeeds: Array<[string, string, number, number]> = [
  ["El Born", "Lumen Born", 41.385, 2.183],
  ["El Born", "Lumen Princesa", 41.386, 2.181],
  ["Gràcia", "Lumen Gràcia", 41.402, 2.156],
  ["Gràcia", "Lumen Verdi", 41.404, 2.158],
  ["Eixample", "Lumen Passeig de Gràcia", 41.394, 2.162],
  ["Poblenou", "Lumen Poblenou", 41.404, 2.198],
  ["Barceloneta", "Lumen Barceloneta", 41.379, 2.189],
  ["Raval", "Lumen Raval", 41.381, 2.169],
];

const milanSeeds: Array<[string, string, number, number]> = [
  ["Brera", "Lumen Brera", 45.473, 9.187],
  ["Brera", "Lumen Garibaldi", 45.481, 9.188],
  ["Navigli", "Lumen Navigli", 45.451, 9.176],
  ["Porta Romana", "Lumen Porta Romana", 45.453, 9.198],
  ["Isola", "Lumen Isola", 45.488, 9.191],
  ["Duomo", "Lumen Duomo", 45.464, 9.191],
  ["Porta Venezia", "Lumen Porta Venezia", 45.474, 9.205],
];

const nyseeds: Array<[string, string, number, number]> = [
  ["Williamsburg", "Lumen Williamsburg", 40.714, -73.957],
  ["Williamsburg", "Lumen Bedford Ave", 40.717, -73.957],
  ["SoHo", "Lumen SoHo", 40.723, -74.0],
  ["SoHo", "Lumen Prince St", 40.724, -73.998],
  ["Lower East Side", "Lumen LES", 40.717, -73.987],
  ["Greenpoint", "Lumen Greenpoint", 40.729, -73.954],
  ["West Village", "Lumen West Village", 40.735, -74.004],
  ["Midtown", "Lumen Bryant Park", 40.754, -73.984],
  ["Midtown", "Lumen Grand Central", 40.752, -73.977],
  ["Chelsea", "Lumen Chelsea", 40.744, -74.001],
  ["DUMBO", "Lumen DUMBO", 40.703, -73.989],
  ["Harlem", "Lumen Harlem", 40.811, -73.946],
];

const sfSeeds: Array<[string, string, number, number]> = [
  ["Mission", "Lumen Mission", 37.76, -122.418],
  ["Mission", "Lumen Valencia", 37.762, -122.421],
  ["Hayes Valley", "Lumen Hayes Valley", 37.776, -122.425],
  ["SoMa", "Lumen SoMa", 37.78, -122.402],
  ["SoMa", "Lumen Yerba Buena", 37.785, -122.402],
  ["Castro", "Lumen Castro", 37.762, -122.435],
  ["Noe Valley", "Lumen Noe", 37.751, -122.433],
  ["North Beach", "Lumen North Beach", 37.8, -122.41],
  ["FiDi", "Lumen FiDi", 37.794, -122.4],
  ["Marina", "Lumen Marina", 37.802, -122.437],
];

const torontoSeeds: Array<[string, string, number, number]> = [
  ["Queen West", "Lumen Queen West", 43.647, -79.42],
  ["Queen West", "Lumen Trinity Bellwoods", 43.648, -79.413],
  ["Kensington", "Lumen Kensington", 43.654, -79.401],
  ["Leslieville", "Lumen Leslieville", 43.663, -79.337],
  ["The Junction", "Lumen Junction", 43.665, -79.469],
  ["Downtown", "Lumen Union", 43.645, -79.381],
  ["Yorkville", "Lumen Yorkville", 43.671, -79.391],
];

const tokyoSeeds: Array<[string, string, number, number]> = [
  ["Shibuya", "Lumen Shibuya", 35.659, 139.7],
  ["Shibuya", "Lumen Miyashita", 35.661, 139.702],
  ["Daikanyama", "Lumen Daikanyama", 35.65, 139.703],
  ["Nakameguro", "Lumen Nakameguro", 35.644, 139.699],
  ["Shimokitazawa", "Lumen Shimokita", 35.661, 139.668],
  ["Shinjuku", "Lumen Shinjuku", 35.69, 139.7],
  ["Ginza", "Lumen Ginza", 35.671, 139.764],
  ["Marunouchi", "Lumen Tokyo Station", 35.681, 139.767],
  ["Aoyama", "Lumen Aoyama", 35.665, 139.712],
  ["Kichijoji", "Lumen Kichijoji", 35.703, 139.58],
];

const singaporeSeeds: Array<[string, string, number, number]> = [
  ["Tiong Bahru", "Lumen Tiong Bahru", 1.286, 103.832],
  ["Telok Ayer", "Lumen Telok Ayer", 1.281, 103.847],
  ["Tanjong Pagar", "Lumen Tanjong Pagar", 1.276, 103.846],
  ["Raffles Place", "Lumen Raffles", 1.284, 103.851],
  ["Joo Chiat", "Lumen Joo Chiat", 1.31, 103.903],
  ["Bugis", "Lumen Bugis", 1.3, 103.855],
  ["Holland Village", "Lumen Holland V", 1.311, 103.795],
];

const sydneySeeds: Array<[string, string, number, number]> = [
  ["Surry Hills", "Lumen Surry Hills", -33.886, 151.211],
  ["Surry Hills", "Lumen Crown St", -33.884, 151.213],
  ["Newtown", "Lumen Newtown", -33.898, 151.179],
  ["Paddington", "Lumen Paddington", -33.884, 151.227],
  ["Redfern", "Lumen Redfern", -33.892, 151.205],
  ["CBD", "Lumen Circular Quay", -33.861, 151.211],
  ["Bondi", "Lumen Bondi", -33.891, 151.276],
  ["Darlinghurst", "Lumen Darlinghurst", -33.879, 151.218],
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
