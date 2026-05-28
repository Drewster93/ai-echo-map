import { Easing } from "remotion";

export const SNAP = { damping: 12, stiffness: 220, mass: 0.6 } as const;
export const HERO = { damping: 10, stiffness: 180, mass: 0.7 } as const;
export const PANEL = { damping: 22, stiffness: 240, mass: 0.6 } as const;
export const CINE_IN = { damping: 14, stiffness: 160, mass: 0.7 } as const;
export const OVERSHOOT = { damping: 8, stiffness: 240, mass: 0.7 } as const;

export const whip = Easing.bezier(0.85, 0, 0.05, 1);
export const swift = Easing.bezier(0.22, 1, 0.36, 1);
export const cineEase = Easing.bezier(0.65, 0, 0.35, 1);
