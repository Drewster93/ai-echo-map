import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadPlex } from "@remotion/google-fonts/IBMPlexSans";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

export const fraunces = loadFraunces("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
}).fontFamily;

export const plex = loadPlex("normal", {
  weights: ["300", "400", "700"],
  subsets: ["latin"],
}).fontFamily;

export const grotesk = loadGrotesk("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
}).fontFamily;

export const COLORS = {
  bg: "#05030d",
  plum: "#260e5a",
  ultraviolet: "#860eff",
  blue: "#3072fc",
  aqua: "#7bffff",
  orange: "#ff5b02",
  green: "#daffb6",
  white: "#ffffff",
  dim: "rgba(255,255,255,0.55)",
};
