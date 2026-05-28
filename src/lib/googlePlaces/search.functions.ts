import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { searchGooglePlaces } from "./search.server";
import type { GooglePlacesLocation } from "./types";

const inputSchema = z.object({
  brand: z.string().min(1).max(120),
  country: z.string().min(2).max(20).optional(),
  language: z.string().min(2).max(10).optional(),
  maxLocations: z.number().int().min(1).max(120).optional(),
});

export const searchBrandLocations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<{ locations: GooglePlacesLocation[]; error: string | null }> => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return { locations: [], error: "GOOGLE_PLACES_API_KEY is not configured" };
    }
    try {
      const locations = await searchGooglePlaces(data.brand, apiKey, {
        country: data.country,
        language: data.language,
        maxLocations: data.maxLocations,
      });
      return { locations, error: null };
    } catch (err) {
      console.error("[searchBrandLocations] failed:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      return { locations: [], error: message };
    }
  });
