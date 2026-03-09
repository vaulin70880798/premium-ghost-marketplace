import type { Genre } from "@/types/domain";

export const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/tracks", label: "Buy Tracks" },
  { href: "/services", label: "Custom Services" },
  { href: "/producers", label: "Producers" },
  { href: "/favorites", label: "Favorites" },
] as const;

export const genreArtworkTones: Record<Genre, string> = {
  "Afro House": "from-amber-100 via-zinc-50 to-blue-100",
  "Melodic Techno": "from-zinc-100 via-slate-50 to-indigo-100",
  "Tech House": "from-blue-100 via-slate-50 to-cyan-100",
  "Deep House": "from-slate-100 via-gray-50 to-emerald-100",
  "Progressive House": "from-indigo-100 via-blue-50 to-cyan-100",
  "Drum & Bass": "from-stone-100 via-slate-50 to-zinc-200",
  Garage: "from-teal-100 via-cyan-50 to-slate-100",
};

export const defaultSeo = {
  title: "Ghost Market | Exclusive Ghost-Produced Music",
  description:
    "Premium marketplace for exclusive ghost-produced tracks with full rights transfer, stems, and custom production services.",
};
