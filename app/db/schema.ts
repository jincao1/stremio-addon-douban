import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod/v4";

export const doubanMapping = sqliteTable("douban_mapping", {
  doubanId: int("douban_id").notNull().primaryKey(),
  tmdbId: int("tmdb_id"),
  imdbId: text("imdb_id"),
  traktId: int("trakt_id"),
  calibrated: int("calibrated").default(0),
});

export const doubanMappingSchema = z.object({
  doubanId: z.coerce.number(),
  imdbId: z.coerce.string().nullish().default(null),
  tmdbId: z.coerce.number().nullish().default(null),
  traktId: z.coerce.number().nullish().default(null),
  calibrated: z.coerce.number().nullish().default(0),
});

export type DoubanIdMapping = typeof doubanMapping.$inferSelect;
