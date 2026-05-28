import { Easing } from "remotion";

// Snappy, kinetic spring config — used as the new default entrance.
export const SNAP = { damping: 12, stiffness: 220, mass: 0.6 } as const;

// Smooth but slightly springy for hero stinger moments.
export const HERO = { damping: 10, stiffness: 180, mass: 0.7 } as const;

// Very fast settle, almost no overshoot — UI panels.
export const PANEL = { damping: 22, stiffness: 240, mass: 0.6 } as const;

// "Whip" easing for typography & panels traveling >300px.
export const whip = Easing.bezier(0.7, 0, 0.15, 1);
export const swift = Easing.bezier(0.22, 1, 0.36, 1);
