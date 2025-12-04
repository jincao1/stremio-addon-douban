import { and, isNull, ne, or } from "drizzle-orm";
import { createApp } from "honox/server";
import { type DoubanIdMapping, doubanMapping } from "@/db";
import { api } from "@/libs/api";

const app = createApp();

export default {
  fetch: app.fetch,
  async scheduled(_controller: ScheduledController, env: CloudflareBindings, ctx: ExecutionContext) {
    api.initialize(env, ctx);

    const data = await api.db
      .select()
      .from(doubanMapping)
      .where(and(isNull(doubanMapping.tmdbId), or(ne(doubanMapping.calibrated, 1), isNull(doubanMapping.calibrated))));

    console.info("🔍 Found", data.length, "items to process");

    const groups: (typeof data)[] = [];
    for (let i = 0; i < data.length; i += 10) {
      groups.push(data.slice(i, i + 10));
    }

    let successCount = 0;

    const formatIdMapping = (doubanId: number, ids?: Parameters<typeof api.traktAPI.formatIdsToIdMapping>[0]) => {
      const mapping = api.traktAPI.formatIdsToIdMapping(ids);
      if (mapping) {
        return {
          ...mapping,
          doubanId,
          calibrated: 1,
        };
      }
      return null;
    };

    for (const group of groups) {
      const results = await Promise.all(
        group.map<Promise<DoubanIdMapping | null>>(async (item) => {
          const { doubanId, imdbId } = item;
          if (imdbId) {
            const data = await api.traktAPI.searchByImdbId(imdbId).catch(() => []);
            if (data.length === 1) {
              return formatIdMapping(doubanId, api.traktAPI.getSearchResultField(data[0], "ids"));
            }
          }
          const detail = await api.doubanAPI.getSubjectDetail(doubanId);
          if (detail) {
            const results = await api.traktAPI.search(detail.type === "movie" ? "movie" : "show", detail.title);
            if (results.length === 1) {
              return formatIdMapping(doubanId, api.traktAPI.getSearchResultField(results[0], "ids"));
            }

            // 尝试比对一下原始标题，如果只有一个结果，则直接返回
            const originalTitleMatches = results.filter(
              (item) => api.traktAPI.getSearchResultField(item, "original_title") === detail.original_title,
            );
            if (originalTitleMatches.length === 1) {
              return formatIdMapping(doubanId, api.traktAPI.getSearchResultField(originalTitleMatches[0], "ids"));
            }

            // 电影尝试比对一下年份，如果只有一个结果，则直接返回
            if (detail.type === "movie") {
              const yearsMatches = results.filter(
                (item) => api.traktAPI.getSearchResultField(item, "year")?.toString() === detail.year?.toString(),
              );
              if (yearsMatches.length === 1) {
                return formatIdMapping(doubanId, api.traktAPI.getSearchResultField(yearsMatches[0], "ids"));
              }
            }
          }
          return null;
        }),
      );
      const validResults = results.filter((item): item is DoubanIdMapping => !!item);
      if (validResults.length > 0) {
        ctx.waitUntil(api.persistIdMapping(validResults));
        successCount += validResults.length;
      }
    }
    console.info("🎉 Successfully processed", successCount, "items");
  },
};
