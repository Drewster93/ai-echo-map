import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  COUNTRY_BOUNDS,
  COUNTRY_SUB_REGIONS,
  GLOBAL_REGIONS,
  searchRegion,
  type PlaceWithId,
  type Rect,
} from "@/lib/googlePlaces/search.server";

const querySchema = z.object({
  brand: z.string().min(1).max(120),
  scope: z.enum(["global", "country"]).default("global"),
  country: z.string().min(2).max(20).optional(),
  language: z.string().min(2).max(10).default("en"),
});

interface RegionReport {
  label: string;
  raw: number;
  kept: number;
  sample: string[];
}

export const Route = createFileRoute("/api/public/brand-coverage")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: "GOOGLE_PLACES_API_KEY is not configured" },
            { status: 503 },
          );
        }

        const url = new URL(request.url);
        const parsed = querySchema.safeParse({
          brand: url.searchParams.get("brand") ?? undefined,
          scope: url.searchParams.get("scope") ?? undefined,
          country: url.searchParams.get("country") ?? undefined,
          language: url.searchParams.get("language") ?? undefined,
        });
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid query", details: parsed.error.flatten() },
            { status: 400 },
          );
        }
        const { brand, scope, country, language } = parsed.data;

        const GENERIC = new Set([
          "group", "inc", "llc", "ltd", "gmbh", "co", "corp", "corporation", "the", "and", "&",
        ]);
        const brandWords = brand
          .toLowerCase()
          .split(/\s+/)
          .map((w) => w.replace(/[^a-zà-ÿ0-9]/gi, ""))
          .filter((w) => w.length > 2 && !GENERIC.has(w));
        const nameFilter = (p: PlaceWithId): boolean => {
          if (brandWords.length === 0) return true;
          const n = (p.name || "").toLowerCase();
          return brandWords.some((w) => n.includes(w));
        };

        let regions: { label: string; rect: Rect }[];
        if (scope === "country") {
          if (!country) {
            return Response.json(
              { error: "country is required when scope=country" },
              { status: 400 },
            );
          }
          const upper = country.toUpperCase();
          const subs = COUNTRY_SUB_REGIONS[upper];
          if (subs && subs.length > 0) {
            regions = subs.map((r) => ({ label: `${upper}_${r.label}`, rect: r.rect }));
          } else if (COUNTRY_BOUNDS[upper]) {
            regions = [{ label: upper, rect: COUNTRY_BOUNDS[upper] }];
          } else {
            return Response.json({ error: `Unknown country code: ${country}` }, { status: 400 });
          }
        } else {
          regions = GLOBAL_REGIONS;
        }

        const results = await Promise.all(
          regions.map((r) =>
            searchRegion(
              brand,
              apiKey,
              language,
              30,
              { locationRestriction: { rectangle: r.rect } },
              null,
              r.label,
            ),
          ),
        );

        const seen = new Set<string>();
        let totalUnique = 0;
        const report: RegionReport[] = regions.map((r, i) => {
          const list = results[i];
          const keptItems: PlaceWithId[] = [];
          for (const p of list) {
            const id = p._placeId || p.name + "|" + p.address;
            if (seen.has(id)) continue;
            seen.add(id);
            totalUnique++;
            if (!nameFilter(p)) continue;
            keptItems.push(p);
          }
          return {
            label: r.label,
            raw: list.length,
            kept: keptItems.length,
            sample: keptItems.slice(0, 3).map((p) => p.name),
          };
        });

        return Response.json(
          {
            brand,
            scope,
            country: scope === "country" ? country?.toUpperCase() : null,
            regions: report,
            totalUnique,
            totalKept: report.reduce((s, r) => s + r.kept, 0),
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
