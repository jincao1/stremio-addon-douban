import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod/v4";
import { DEFAULT_COLLECTION_IDS } from "@/libs/constants";

export const doubanMapping = sqliteTable("douban_mapping", {
  doubanId: int("douban_id").notNull().primaryKey(),
  tmdbId: int("tmdb_id"),
  imdbId: text("imdb_id"),
  traktId: int("trakt_id"),
  calibrated: int("calibrated", { mode: "boolean" }).default(false),

  createdAt: int("created_at", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const doubanMappingSchema = z.object({
  doubanId: z.coerce.number(),
  tmdbId: z.coerce.number().nullish(),
  imdbId: z.string().nullish(),
  traktId: z.coerce.number().nullish(),
  calibrated: z.boolean().nullish(),
});

export type DoubanIdMapping = z.output<typeof doubanMappingSchema>;

export const userConfig = sqliteTable("user_config", {
  userId: text("user_id").notNull().primaryKey(),
  config: text("config")
    .notNull()
    .$defaultFn(() => JSON.stringify({ catalogIds: DEFAULT_COLLECTION_IDS })),

  createdAt: int("created_at", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

const userConfigSchema = z.object({
  catalogIds: z.array(z.string()).default(DEFAULT_COLLECTION_IDS),
});

export const userSchema = z.object({
  userId: z.uuid(),
  config: userConfigSchema,
});

export type UserMapping = z.output<typeof userSchema>;
