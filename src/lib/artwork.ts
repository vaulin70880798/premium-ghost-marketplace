const fallbackArtworks = [
  "/artworks/fallback-1.jpg",
  "/artworks/fallback-2.jpg",
  "/artworks/fallback-3.jpg",
  "/artworks/fallback-4.jpg",
] as const;

function isLegacyArtworkPath(url: string) {
  return /^\/artworks\/\d+\.jpg$/i.test(url);
}

function stableIndexFromKey(key: string | number, size: number) {
  const value = String(key);
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
  }

  return Math.abs(hash) % size;
}

export function getFallbackArtworkByKey(key: string | number) {
  const index = stableIndexFromKey(key, fallbackArtworks.length);
  return fallbackArtworks[index];
}

export function resolveArtworkUrl(url: string | null | undefined, key: string | number) {
  const trimmed = typeof url === "string" ? url.trim() : "";
  if (trimmed.length > 0 && !isLegacyArtworkPath(trimmed)) {
    return trimmed;
  }

  return getFallbackArtworkByKey(key);
}
