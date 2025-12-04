import axios, { type AxiosInstance, type AxiosRequestConfig, type CreateAxiosDefaults } from "axios";
import { drizzle } from "drizzle-orm/d1";
import type { Context, Env } from "hono";

export class BaseAPI {
  private _context?: Context<Env>;

  protected get context() {
    if (!this._context) {
      throw new Error("Context not initialized");
    }
    return this._context;
  }
  protected set context(context: Context<Env>) {
    this._context = context;
  }

  protected axios: AxiosInstance;

  constructor(config?: CreateAxiosDefaults) {
    this.axios = axios.create({ adapter: "fetch", ...config });

    this.axios.interceptors.request.use((config) => {
      const finalUri = axios.getUri(config);
      console.info("⬆️", config.method?.toUpperCase(), finalUri);
      return config;
    });
  }

  protected async request<T>(config: AxiosRequestConfig & { cache?: { key: string; ttl: number } }) {
    const cache = caches.default;
    const cacheKey = new Request(`https://cache.internal/${config.cache?.key}`);

    if (config.cache) {
      const cachedRes = await cache.match(cacheKey);
      if (cachedRes) {
        console.info("⚡️ Cache Hit", config.cache.key);
        return cachedRes.json() as T;
      }
      console.info("🐢 Cache Miss", config.cache.key);
    }

    const resp = await this.axios.request<T>(config);
    if (config.cache) {
      const response = new Response(JSON.stringify(resp.data), {
        headers: {
          "Cache-Control": `public, max-age=${config.cache.ttl / 1000}, s-maxage=${config.cache.ttl / 1000}`,
        },
      });
      this.context.executionCtx.waitUntil(cache.put(cacheKey, response));
    }
    return resp.data;
  }

  initialize(context: Context<Env>) {
    this.context = context;
  }

  get db() {
    return drizzle(this.context.env.STREMIO_ADDON_DOUBAN);
  }
}
