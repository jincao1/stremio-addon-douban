import { createRoute } from "honox/factory";
import pkg from "@/../package.json";
import { ManifestUrlRender } from "@/islands/manifest-url-render";

export default createRoute((c) => {
  const manifestUrl = new URL(c.req.url);
  manifestUrl.pathname = "/manifest.json";
  manifestUrl.search = "";
  manifestUrl.hash = "";
  return c.render(
    <div className="container mx-auto flex h-screen flex-col items-center justify-center px-8">
      <h1 className="mb-4 font-bold text-2xl">
        {pkg.description}

        <span className="ml-2 text-base text-neutral-500">v{pkg.version}</span>
      </h1>

      <div className="group flex w-full flex-col">
        <ManifestUrlRender url={manifestUrl.toString()} />
      </div>
    </div>,
  );
});
