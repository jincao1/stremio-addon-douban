import { Hono } from "hono";
import { cors } from "hono/cors";
import { catalogRoute } from "./routes/catalog";
import { configureRoute } from "./routes/configure";
import { manifestRoute } from "./routes/manifest";
import { metaRoute } from "./routes/meta";

const app = new Hono();

app.use(cors());

app.get("/", (c) => c.redirect("/configure"));

app.route("/manifest.json", manifestRoute);
app.route("/:config/manifest.json", manifestRoute);
app.route("/configure", configureRoute);
app.route("/:config/configure", configureRoute);
app.route("/catalog", catalogRoute);
app.route("/:config/catalog", catalogRoute);
app.route("/meta", metaRoute);
app.route("/:config/meta", metaRoute);

export default app;
