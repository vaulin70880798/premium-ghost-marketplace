"use client";

import { LayoutGrid, List, RotateCcw, SlidersHorizontal } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { BrowseFilters, Genre, Mood, MusicalKey, SortOption } from "@/types/domain";

interface TrackFiltersProps {
  filters: BrowseFilters;
  genres: Genre[];
  moods: Mood[];
  keys: MusicalKey[];
  onFiltersChange: (filters: BrowseFilters) => void;
  onReset: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

function toggleValue<T extends string>(source: T[], value: T): T[] {
  if (source.includes(value)) {
    return source.filter((item) => item !== value);
  }

  return [...source, value];
}

export function TrackFilters({
  filters,
  genres,
  moods,
  keys,
  onFiltersChange,
  onReset,
  viewMode,
  onViewModeChange,
}: TrackFiltersProps) {
  const setSort = (sort: SortOption) => onFiltersChange({ ...filters, sort });

  return (
    <section className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(12,20,38,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-100">
            <SlidersHorizontal className="h-4 w-4 text-zinc-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Filter Tracks</p>
            <p className="text-xs text-zinc-500">Fine tune catalog results</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <div className="inline-flex rounded-full border border-zinc-200 p-1">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`rounded-full p-2 ${viewMode === "grid" ? "bg-zinc-900 text-white" : "text-zinc-600"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`rounded-full p-2 ${viewMode === "list" ? "bg-zinc-900 text-white" : "text-zinc-600"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Input
          placeholder="Search by title, genre, or tag"
          value={filters.query}
          onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
        />

        <select
          value={filters.sort}
          onChange={(event) => setSort(event.target.value as SortOption)}
          className="h-11 rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price Low to High</option>
          <option value="price-high">Price High to Low</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Genre</p>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => {
            const selected = filters.genres.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() => onFiltersChange({ ...filters, genres: toggleValue(filters.genres, genre) })}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">BPM Range</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={filters.minBpm}
              onChange={(event) => onFiltersChange({ ...filters, minBpm: Number(event.target.value) })}
            />
            <span className="text-xs text-zinc-500">to</span>
            <Input
              type="number"
              value={filters.maxBpm}
              onChange={(event) => onFiltersChange({ ...filters, maxBpm: Number(event.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Price Range</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={filters.minPrice}
              onChange={(event) => onFiltersChange({ ...filters, minPrice: Number(event.target.value) })}
            />
            <span className="text-xs text-zinc-500">to</span>
            <Input
              type="number"
              value={filters.maxPrice}
              onChange={(event) => onFiltersChange({ ...filters, maxPrice: Number(event.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Musical Key</p>
          <select
            value={filters.keys[0] ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                keys: event.target.value ? [event.target.value as MusicalKey] : [],
              })
            }
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">Any key</option>
            {keys.map((keyOption) => (
              <option key={keyOption} value={keyOption}>
                {keyOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Mood</p>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => {
            const selected = filters.moods.includes(mood);
            return (
              <button
                key={mood}
                type="button"
                onClick={() => onFiltersChange({ ...filters, moods: toggleValue(filters.moods, mood) })}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selected
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox
          checked={filters.stemsOnly}
          onChange={(checked) => onFiltersChange({ ...filters, stemsOnly: checked })}
          label="Stems included only"
        />
        <Checkbox
          checked={filters.exclusivesOnly}
          onChange={(checked) => onFiltersChange({ ...filters, exclusivesOnly: checked })}
          label="Exclusive available only"
        />
      </div>
    </section>
  );
}
