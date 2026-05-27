import type { Location } from "../types";

export interface IntentCategory {
  name: string;
  promptCount: number;
  monthlyValueUsd: number;
  brandPct: number;
  competitorPct: number;
}

export interface PromptRow {
  prompt: string;
  category: string;
  brandPct: number;
  competitorPct: number;
  monthlyValueUsd: number;
  citedDomain?: string;
}

export interface LocationReport {
  property: {
    name: string;
    group: string;
    address: string;
    city: string;
  };
  status: "critical" | "underperforming" | "healthy";
  narrative: string;
  mentionRate: number;
  competitorMentionRate: number;
  citationRate: number;
  competitorCitationRate: number;
  unbrandedMentionPct: number;
  brandedMentionPct: number;
  competitorSet: string[];
  intents: IntentCategory[];
  prompts: PromptRow[];
  winners: PromptRow[];
  totalPromptsMonitored: number;
  updatedLabel: string;
  brandDomain: string;
}

const HOTEL_COMPETITORS_BY_CITY: Record<string, string[]> = {
  London: [
    "Four Seasons",
    "Claridge's",
    "The Ritz",
    "The Connaught",
    "Mandarin Oriental",
    "The Dorchester",
    "Rosewood",
  ],
  Paris: [
    "Ritz Paris",
    "Le Bristol",
    "Four Seasons George V",
    "Mandarin Oriental",
    "Plaza Athénée",
    "Le Meurice",
    "Crillon",
  ],
  Berlin: [
    "Hotel Adlon",
    "Ritz-Carlton",
    "Regent",
    "Soho House",
    "Waldorf Astoria",
    "Rocco Forte",
    "Mandala",
  ],
};

const INTENT_TEMPLATES: Array<{
  name: string;
  prompts: (city: string) => string[];
  valueRange: [number, number];
}> = [
  {
    name: "Luxury Hotels",
    prompts: (c) => [`luxury hotels in ${c}`, `5 star hotels in ${c}`],
    valueRange: [17000, 30000],
  },
  {
    name: "Business Travel",
    prompts: (c) => [`luxury business hotels in ${c}`],
    valueRange: [400, 700],
  },
  {
    name: "Suites & Rooms",
    prompts: (c) => [`hotel suites with views in ${c}`],
    valueRange: [300, 600],
  },
  {
    name: "Branded Search",
    prompts: () => [`best {brand} hotel`],
    valueRange: [150, 280],
  },
  {
    name: "Deals & Offers",
    prompts: (c) => [`luxury hotel deals in ${c}`],
    valueRange: [150, 280],
  },
  {
    name: "Weddings & Events",
    prompts: (c) => [`best wedding venues in ${c}`],
    valueRange: [150, 280],
  },
  {
    name: "Spa & Wellness",
    prompts: (c) => [`top hotels with spa in ${c}`],
    valueRange: [60, 120],
  },
  {
    name: "Competitor Comparison",
    prompts: (c) => [`{brand} vs Four Seasons in ${c}`],
    valueRange: [0, 0],
  },
  {
    name: "Leisure Travel",
    prompts: (c) => [`best weekend hotel ${c}`],
    valueRange: [0, 0],
  },
];

function seededRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickAddress(loc: Location): string {
  // Lightweight deterministic address for the demo
  const map: Record<string, string> = {
    London: "Strand, London WC2R 0EZ",
    Paris: "15 Place Vendôme, 75001 Paris",
    Berlin: "Unter den Linden 77, 10117 Berlin",
  };
  return map[loc.city] ?? loc.cluster;
}

export function buildLocationReport(loc: Location, brand: string): LocationReport {
  const rng = seededRng(`${loc.id}|${brand}`);
  const brandFirst = brand.split(/\s+/)[0] || brand;
  const city = loc.city;
  const competitors = HOTEL_COMPETITORS_BY_CITY[city] ?? HOTEL_COMPETITORS_BY_CITY.London;

  // Branded vs unbranded — the central story
  const brandedMentionPct = 80 + Math.floor(rng() * 21); // 80-100
  const unbrandedMentionPct = Math.floor(rng() * 18); // 0-17
  const mentionRate = Math.round((brandedMentionPct + unbrandedMentionPct * 4) / 5 / 5) * 5; // skewed by unbranded weight
  const competitorMentionRate = 55 + Math.floor(rng() * 20);
  const citationRate = 5 + Math.floor(rng() * 15);
  const competitorCitationRate = citationRate + 3 + Math.floor(rng() * 10);

  // Build intents
  const intents: IntentCategory[] = INTENT_TEMPLATES.map((t) => {
    const [lo, hi] = t.valueRange;
    const value = lo === 0 && hi === 0 ? 0 : lo + Math.floor(rng() * (hi - lo));
    const isBranded = t.name === "Branded Search";
    const isCompare = t.name === "Competitor Comparison";
    const brandPct = isBranded ? 100 : isCompare ? 100 : 0;
    const competitorPct = isBranded
      ? 0
      : isCompare
      ? 100
      : 33 + Math.floor(rng() * 67);
    return {
      name: t.name,
      promptCount: t.prompts(city).length,
      monthlyValueUsd: value,
      brandPct,
      competitorPct,
    };
  });

  // Build prompt rows
  const prompts: PromptRow[] = [];
  INTENT_TEMPLATES.forEach((t, idx) => {
    const intent = intents[idx];
    t.prompts(city).forEach((p, j) => {
      const text = p.replace("{brand}", brandFirst);
      // Distribute the intent's value across its prompts, weighted by descending order
      const weight = t.prompts(city).length === 2 && j === 0 ? 0.6 : 1 / t.prompts(city).length;
      const value = Math.round(intent.monthlyValueUsd * weight);
      const varied = t.prompts(city).length > 1;
      const compPct = varied
        ? Math.max(50, Math.min(100, intent.competitorPct + (j === 0 ? 0 : 17)))
        : intent.competitorPct;
      prompts.push({
        prompt: text,
        category: intent.name,
        brandPct: intent.brandPct,
        competitorPct: compPct,
        monthlyValueUsd: value,
        citedDomain: intent.brandPct === 100 ? `${brandFirst.toLowerCase()}.com` : undefined,
      });
    });
  });

  // Winners — prompts where brand >= competitor
  const winners = prompts.filter((p) => p.brandPct >= p.competitorPct).slice(0, 2);

  const status: LocationReport["status"] =
    unbrandedMentionPct < 10 ? "underperforming" : mentionRate < 25 ? "critical" : "healthy";

  const narrative =
    brandedMentionPct - unbrandedMentionPct > 50
      ? `${loc.name} wins on branded search — when guests ask AI assistants about ${brandFirst} specifically, the property shows up. But on unbranded discovery queries — "luxury hotels in ${city}", "5 star hotels in ${city}", "best hotels with a spa" — competitors dominate the conversation and ${loc.name} is largely absent. The reputation is intact; the visibility is not.`
      : `${loc.name} shows up across both branded and unbranded queries, but competitors still hold a wider share of voice in ${city}. Closing the gap means investing in the discovery topics where AI assistants are recommending others first.`;

  return {
    property: {
      name: loc.name,
      group: `A ${brandFirst} Managed Hotel`,
      address: pickAddress(loc),
      city,
    },
    status,
    narrative,
    mentionRate,
    competitorMentionRate,
    citationRate,
    competitorCitationRate,
    unbrandedMentionPct,
    brandedMentionPct,
    competitorSet: competitors,
    intents: intents.sort((a, b) => b.monthlyValueUsd - a.monthlyValueUsd),
    prompts: prompts.sort(
      (a, b) =>
        Math.max(0, b.competitorPct - b.brandPct) * b.monthlyValueUsd -
        Math.max(0, a.competitorPct - a.brandPct) * a.monthlyValueUsd,
    ),
    winners,
    totalPromptsMonitored: prompts.length,
    updatedLabel: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    brandDomain: `${brandFirst.toLowerCase()}.com`,
  };
}

export function formatUsd(n: number): string {
  if (n === 0) return "—";
  return `$${new Intl.NumberFormat("en-US").format(n)}`;
}
