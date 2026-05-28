import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Gauge,
  Briefcase,
  MapPin,
  LineChart,
  Star,
  MessagesSquare,
  SquarePen,
  AppWindow,
  Smartphone,
  Megaphone,
  HelpCircle,
  Settings,
  User,
  Globe,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";


function brandToDomain(brand: string): string {
  const slug = brand.trim().toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9-]/g, "");
  return `${slug}.com`;
}

function BrandLogo() {
  return (
    <img
      src="https://www.google.com/s2/favicons?domain=uberall.com&sz=128"
      alt="Uberall logo"
      className="h-9 w-9 rounded-lg object-contain"
    />
  );
}

type Item = {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

const TOP_ITEMS: Item[] = [
  { key: "home", icon: Home, label: "Home" },
  { key: "dashboard", icon: Gauge, label: "Dashboard" },
  { key: "business", icon: Briefcase, label: "Business" },
  { key: "locations", icon: MapPin, label: "Locations" },
  { key: "analytics", icon: LineChart, label: "Analytics" },
  { key: "reviews", icon: Star, label: "Reviews" },
  { key: "messages", icon: MessagesSquare, label: "Messages" },
  { key: "content", icon: SquarePen, label: "Content" },
  { key: "listings", icon: AppWindow, label: "Listings" },
];

const MID_ITEMS: Item[] = [
  { key: "mobile", icon: Smartphone, label: "Mobile" },
  { key: "ads", icon: Megaphone, label: "Ads" },
];

const BOTTOM_ITEMS: Item[] = [
  { key: "help", icon: HelpCircle, label: "Help" },
  { key: "settings", icon: Settings, label: "Settings" },
  { key: "account", icon: User, label: "Account" },
  { key: "language", icon: Globe, label: "Language" },
];

const ACTIVE_KEY = "analytics";

export function SideNav({ brand }: { brand?: string | null }) {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState<string>(ACTIVE_KEY);
  const [mobileActive] = useState<string>("mobile");

  const renderItem = (item: Item, opts?: { highlight?: boolean }) => {
    const Icon = item.icon;
    const isActive = active === item.key;
    const highlight = opts?.highlight || mobileActive === item.key;
    const isAds = item.key === "ads";
    return (
      <button
        key={item.key}
        onClick={() => setActive(item.key)}
        title={item.label}
        className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
          isActive
            ? "bg-[#f5f3fe] shadow-[0_0_0_2px_rgba(117,21,245,0.9),0_8px_24px_-8px_rgba(117,21,245,0.5)]"
            : highlight
              ? "bg-[#ece8ff]"
              : "hover:bg-black/5"
        }`}
      >
        <Icon
          className={`h-[22px] w-[22px] ${
            isActive ? "text-[#7515f5]" : "text-[#1a1a2e]/80"
          }`}
        />
        {isAds && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#ff3b5c] ring-2 ring-white" />
        )}
      </button>
    );
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="fixed left-0 top-0 z-[60] h-screen"
      style={{ width: open ? 72 : 16 }}
    >
      <div
        className={`relative h-full border-r border-black/5 backdrop-blur-xl transition-all bg-white ${
          open ? "w-[72px]" : "w-0 overflow-hidden"
        }`}
      >
        {brand && (
          <div className="flex h-16 items-center justify-center">
            <BrandLogo brand={brand} />
          </div>
        )}

        {/* Top section */}
        <div className="flex flex-col items-center gap-1.5 px-2">
          {TOP_ITEMS.map((i) =>
            renderItem(i, { highlight: i.key === ACTIVE_KEY ? false : false }),
        <div className="flex h-16 items-center justify-center">
          <BrandLogo />
        </div>

        {/* Mid items */}
        <div className="flex flex-col items-center gap-1.5 px-2">
          {MID_ITEMS.map((i) => renderItem(i))}
        </div>

        {/* Bottom */}
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1.5 px-2">
          <div className="mb-2 h-px w-8 bg-black/10" />
          {BOTTOM_ITEMS.map((i) => renderItem(i))}
        </div>
      </div>

      {/* Toggle chevron */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute top-4 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white shadow-md transition-transform hover:scale-105"
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      >
        {open ? (
          <ChevronLeft className="h-3.5 w-3.5 text-[#1a1a2e]" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-[#1a1a2e]" />
        )}
      </button>
    </motion.aside>
  );
}
