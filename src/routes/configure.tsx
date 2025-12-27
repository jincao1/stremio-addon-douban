import { reactRenderer } from "@hono/react-renderer";
import { zValidator } from "@hono/zod-validator";
import { type Env, Hono } from "hono";
import { CoffeeIcon, Github, Heart } from "lucide-react";
import { Link, Script, ViteClient } from "vite-ssr-components/react";
import pkg from "@/../package.json" with { type: "json" };
import { Configure, type ConfigureProps } from "@/components/configure";
import { api } from "@/libs/api";
import { type Config, configSchema, isUserId } from "@/libs/config";

export const configureRoute = new Hono<Env>().post("/", zValidator("json", configSchema), async (c) => {
  const config = c.req.valid("json");
  const userId = c.req.header("X-User-ID") || crypto.randomUUID();
  if (!isUserId(userId)) {
    return c.json({ message: "Invalid User" }, 500);
  }
  await api.saveUserConfig(userId, config);
  const { origin } = new URL(c.req.url);
  const manifestUrl = `${origin}/${userId}/manifest.json`;
  return c.json({ success: true, manifestUrl, userId });
});

export type ConfigureRoute = typeof configureRoute;

configureRoute.get(
  "*",
  reactRenderer(({ c, children }) => {
    const userAgent = c.req.header("User-Agent");
    const isSafari = userAgent?.includes("Safari") && !userAgent?.includes("Chrome");
    return (
      <html lang="zh" className={isSafari ? "safari dark" : "dark"}>
        <head>
          <ViteClient />
          <Link rel="stylesheet" href="/src/style.css" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
          />
        </head>
        <body>{children}</body>
      </html>
    );
  }),
);

configureRoute.get("/", async (c) => {
  const userId = c.req.param("config") || "";
  const config: Config = await api.getUserConfig(userId);

  const { origin } = new URL(c.req.url);

  const configureProps: ConfigureProps = {
    userId,
    config,
    manifestUrl: `${origin}/${userId ? `${userId}/manifest.json` : `manifest.json`}`,
  };

  return c.render(
    <>
      <Script src="/src/client/configure.tsx" />
      <div className="flex h-dvh flex-col">
        <header className="page-container shrink-0 px-4 pt-6 pb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-balance font-bold text-xl tracking-tight">{pkg.description}</h1>
              <p className="text-muted-foreground text-sm">选择要显示的目录，生成你的专属配置</p>
            </div>
          </div>
        </header>

        <script
          id="__INITIAL_DATA__"
          type="application/json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: initialize data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(configureProps) }}
        />
        <div id="configure" className="flex min-h-0 flex-1 flex-col">
          <Configure {...configureProps} />
        </div>

        <footer className="shrink-0 px-4 py-2">
          <div className="flex items-center justify-center gap-4 text-muted-foreground text-xs">
            <a
              href="https://github.com/jincao1/stremio-addon-douban"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground"
            >
              <Github className="size-3" />
              <span>GitHub</span>
            </a>
            <a
              href="https://afdian.com/a/baran"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground"
            >
              <Heart className="size-3" />
              <span>捐赠 - Baran</span>
            </a>
            <a
              href="https://buymeacoffee.com/jcao"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground"
            >
              <CoffeeIcon className="size-3" />
              <span>捐赠 - JC</span>
            </a>
          </div>

          <div className="h-safe-b" />
        </footer>
      </div>
    </>,
  );
});
