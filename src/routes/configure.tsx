import { reactRenderer } from "@hono/react-renderer";
import { type Env, Hono } from "hono";
import { CoffeeIcon, Github, Heart } from "lucide-react";
import { Link, Script, ViteClient } from "vite-ssr-components/react";
import pkg from "@/../package.json" with { type: "json" };
import { Configure, type ConfigureProps } from "@/components/configure";
import { Button } from "@/components/ui/button";
import { api } from "@/libs/api";
import { DEFAULT_COLLECTION_IDS } from "@/libs/catalog-shared";
import type { Config } from "@/libs/config";

export const configureRoute = new Hono<Env>();

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

configureRoute.post("/", async (c) => {
  const formData = await c.req.formData();

  let userId = c.req.param("config") || formData.get("user-id")?.toString();
  if (!userId) {
    userId = crypto.randomUUID();
  }
  await api.saveUserConfig(userId, {
    catalogIds: formData.get("catalogIds")?.toString().split(",").filter(Boolean) ?? [],
    imageProxy: formData.get("imageProxy")?.toString() ?? "weserv",
    dynamicCollections: formData.get("dynamicCollections")?.toString() === "on",
  } as Config); // creates the user config

  return c.redirect(`/${userId}/configure`);
});

configureRoute.get("/", async (c) => {
  const userId = c.req.param("config") ?? crypto.randomUUID();
  const config: Config = await api.getUserConfig(userId);

  const { origin } = new URL(c.req.url);

  const configureProps: ConfigureProps = {
    userId,
    config,
    manifestUrl: `${origin}/${userId}/manifest.json`,
  };

  return c.render(
    <>
      <Script src="/src/client/configure.tsx" />
      <div className="container mx-auto flex h-dvh max-w-2xl flex-col">
        <header className="shrink-0 px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-balance font-bold text-xl tracking-tight">{pkg.description}</h1>
              <p className="text-muted-foreground text-sm">选择要显示的目录，生成你的专属配置</p>
            </div>
            <div className="flex items-center max-sm:flex-col max-sm:items-start">
              <Button variant="ghost" size="sm" asChild>
                <a href="https://github.com/jincao1/stremio-addon-douban" target="_blank" rel="noopener noreferrer">
                  <Github />
                  <span>GitHub</span>
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://afdian.com/a/baran" target="_blank" rel="noopener noreferrer">
                  <Heart />
                  <span>捐赠 - Baran</span>
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://buymeacoffee.com/jcao" target="_blank" rel="noopener noreferrer">
                  <CoffeeIcon />
                  <span>捐赠 - JC</span>
                </a>
              </Button>
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
      </div>
    </>,
  );
});
