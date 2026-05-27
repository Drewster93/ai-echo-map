import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface PillSelectOption {
  value: string;
  label: string;
}

interface PillSelectProps {
  value: string | null;
  onChange: (value: string) => void;
  options: PillSelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
}

/**
 * Pill-styled dropdown used across the Pulse HUD.
 * Wraps the shadcn Select primitive with a consistent
 * rounded-full glass aesthetic so every dropdown shares
 * the same shape, type-scale, and hover/focus behavior.
 */
export function PillSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  ariaLabel,
  className,
  triggerClassName,
}: PillSelectProps) {
  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          "group h-auto max-w-[240px] gap-2 truncate rounded-full border border-[#1a0d3d]/10 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#1a0d3d] shadow-[0_1px_2px_rgba(15,8,40,0.04)] backdrop-blur outline-none transition hover:border-[#1a0d3d]/25 hover:bg-white focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet/20 [&>svg]:hidden",
          triggerClassName,
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#1a0d3d]/50 transition group-data-[state=open]:rotate-180 group-hover:text-[#1a0d3d]" />
      </SelectTrigger>
      <SelectContent
        className="overflow-hidden rounded-2xl border border-[#1a0d3d]/8 bg-white/95 p-1 text-xs text-[#1a0d3d] shadow-[0_12px_32px_-12px_rgba(15,8,40,0.25)] backdrop-blur-xl"
        position="popper"
        sideOffset={6}
      >
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="cursor-pointer rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#1a0d3d]/80 focus:bg-[#1a0d3d]/6 focus:text-[#1a0d3d] data-[state=checked]:bg-ultraviolet/10 data-[state=checked]:text-ultraviolet"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
