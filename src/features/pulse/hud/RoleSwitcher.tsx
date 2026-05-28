import type { Location } from "../types";
import { PillSelect } from "./PillSelect";


export type Role = "admin" | "regional" | "location";

interface Props {
  role: Role;
  setRole: (r: Role) => void;
  regionCity: string | null;
  setRegionCity: (c: string | null) => void;
  locationId: string | null;
  setLocationId: (id: string | null) => void;
  locations: Location[];
}

export function RoleSwitcher({
  role,
  setRole,
  regionCity,
  setRegionCity,
  locationId,
  setLocationId,
  locations,
}: Props) {
  const cities = Array.from(new Set(locations.map((l) => l.city)));
  const filteredLocs = regionCity
    ? locations.filter((l) => l.city === regionCity)
    : locations;

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center rounded-full border border-[#1a0d3d]/10 bg-white/60 p-0.5 text-xs font-medium">
        {(["admin", "regional", "location"] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => {
  const cities = Array.from(new Set(locations.map((l) => l.city)));
  const filteredLocs = regionCity
    ? locations.filter((l) => l.city === regionCity)
    : locations;

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center rounded-full border border-[#1a0d3d]/10 bg-white/60 p-0.5 text-xs font-medium">
        {(["admin", "regional", "location"] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => {
              setRole(r);
              if (r === "admin") {
                setRegionCity(null);
                setLocationId(null);
              } else if (r === "regional") {
                if (!regionCity) setRegionCity(cities[0] ?? null);
                if (!locationId) setLocationId(filteredLocs[0]?.id ?? locations[0]?.id ?? null);
              } else if (r === "location") {
                if (!locationId) setLocationId(filteredLocs[0]?.id ?? locations[0]?.id ?? null);
              }
            }}
            className={`rounded-full px-3 py-1.5 capitalize transition ${
              role === r
                ? "bg-[#1a0d3d] text-white shadow-sm"
                : "text-[#1a0d3d]/60 hover:text-[#1a0d3d]"
            }`}
          >
            {r === "admin" ? "Admin" : r === "regional" ? "Regional" : "Location"}
          </button>
        ))}
      </div>

      {role === "regional" && (
        <PillSelect
          ariaLabel="Location"
          value={locationId}
          onChange={(v) => setLocationId(v || null)}
          options={locations.map((l) => ({
            value: l.id,
            label: `${l.name} · ${l.city}`,
          }))}
        />
      )}
        <PillSelect
          ariaLabel="Location"
          value={locationId}
          onChange={(v) => setLocationId(v || null)}
          options={locations.map((l) => ({
            value: l.id,
            label: `${l.name} · ${l.city}`,
          }))}
        />
      )}

    </div>
  );
}
