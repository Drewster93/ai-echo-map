export type Assistant = "all" | "chatgpt" | "perplexity" | "gemini" | "claude";
export type TimeRange = "24h" | "7d" | "30d";
export type PromptStatus = "mentioned" | "competitor_higher" | "not_mentioned";

export interface PromptResult {
  prompt: string;
  status: PromptStatus;
  assistant: Exclude<Assistant, "all">;
  competitor?: string;
}

export interface Location {
  id: string;
  city: "Berlin" | "Paris" | "London";
  cluster: string; // e.g. "Berlin Mitte"
  name: string;
  lat: number;
  lng: number;
  visibilityScore: number; // 0-100 (current)
  scoresByAssistant: Record<Exclude<Assistant, "all">, number>;
  history7d: number[]; // length 7
  prompts: PromptResult[];
}

export interface HexCell {
  h3: string;
  boundary: [number, number][]; // [lat, lng]
  intensity: number; // 0-100
  locationIds: string[];
  cluster: string;
}
