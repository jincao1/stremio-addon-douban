import { doubanMapping } from "@/db";
import { api } from "@/libs/api";
import { eq } from "drizzle-orm";
import { createRoute } from "honox/factory";

// Proxy the request to the poster. Douban posters will not load if we do it this way until I find a better solution.
// Douban rejects direct link to Stremio because of Referer header is set - so images don't load.
export default createRoute(async (c) => {
    const doubanId = c.req.param("doubanId");
    if (!doubanId) {
        return c.notFound();
    }

    // change poster size URL from medium to small to save some bandwidth.
    const changePosterSize = (c: string) => {
        return c.replace("m_ratio_poster", "s_ratio_poster");
    };

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0",
        "Accept-Encoding": "gzip, deflate, br, zstd",
    };

    api.initialize(c.env, c.executionCtx);

    // Poster in database, return it straight away.
    const rows = await api.db.select().from(doubanMapping).where(eq(doubanMapping.doubanId, parseInt(doubanId)));
    if (rows.length != 0 && rows[0].poster) {
        return await fetch(changePosterSize(rows[0].poster), { headers: headers });
    }

    // otherwise fetch for it.
    const subject = await api.doubanAPI.getSubjectDetail(doubanId);

    if (subject.cover_url) {
        if (rows.length != 0) {
            // Update poster if missing.
            rows[0].poster = subject.cover_url;
            c.executionCtx.waitUntil(api.persistIdMapping([rows[0]], false));
        }
        return await fetch(changePosterSize(subject.cover_url), { headers: headers });
    }

    return c.notFound();
});

