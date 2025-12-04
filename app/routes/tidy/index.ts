import type { SearchMovieResultResponse, SearchShowResultResponse } from "@trakt/api";
import { and, isNotNull, isNull, ne, or } from "drizzle-orm";
import { createRoute } from "honox/factory";
import { type DoubanIdMapping, doubanMapping } from "@/db";
import { api } from "@/libs/api";

const formatDoubanIdMapping = (
  doubanId: number,
  ids?:
    | NonNullable<SearchMovieResultResponse["movie"]>["ids"]
    | NonNullable<SearchShowResultResponse["show"]>["ids"]
    | null,
) => {
  if (!ids) return null;
  return {
    doubanId,
    tmdbId: ids.tmdb ?? null,
    imdbId: ids.imdb ?? null,
    traktId: ids.trakt ?? null,
    calibrated: 1,
  };
};

export default createRoute(async (c) => {
  api.initialize(c);

  const data = await api.db
    .select()
    .from(doubanMapping)
    .where(and(isNull(doubanMapping.tmdbId), or(ne(doubanMapping.calibrated, 1), isNull(doubanMapping.calibrated))));

  const groups: (typeof data)[] = [];
  for (let i = 0; i < data.length; i += 10) {
    groups.push(data.slice(i, i + 10));
  }

  let successCount = 0;

  for (const group of groups) {
    const results = await Promise.all(
      group.map<Promise<DoubanIdMapping | null>>(async (item) => {
        const { doubanId, imdbId } = item;
        if (imdbId) {
          const data = await api.traktAPI.searchByImdbId(imdbId).catch(() => []);
          if (data.length === 1) {
            const ids = api.traktAPI.getSearchResultField(data[0], "ids");
            return formatDoubanIdMapping(doubanId, ids);
          }
        }
        const detail = await api.doubanAPI.getSubjectDetail(doubanId);
        if (detail) {
          const results = await api.traktAPI.search(detail.type === "movie" ? "movie" : "show", detail.title);
          if (results.length === 1) {
            const ids = api.traktAPI.getSearchResultField(results[0], "ids");
            return formatDoubanIdMapping(doubanId, ids);
          }
        }
        return null;
      }),
    );
    const validResults = results.filter((item): item is DoubanIdMapping => !!item);
    if (validResults.length > 0) {
      await api.persistIdMapping(validResults);
      successCount += validResults.length;
    }
  }

  return c.json({ successCount, total: data.length });
});
