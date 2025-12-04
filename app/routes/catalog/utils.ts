import type { DoubanIdMapping } from "../../db";

export const generateId = (doubanId: number, params?: Partial<Omit<DoubanIdMapping, "doubanId">>) => {
  if (params?.tmdbId) {
    return `tmdb:${params.tmdbId}`;
  }
  if (params?.imdbId) {
    return params.imdbId;
  }
  return `douban:${doubanId}`;
};
