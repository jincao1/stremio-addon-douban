# Stremio Douban Addon

Douban addon for Stremio.

Forked from https://github.com/baranwang/stremio-addon-douban

# Setup

Documentation for myself, because I will forget. I'm not a Cloudflare Wrangler/Worker users so these are probably sub-optimal.

1. Create Cloudflare account, you'll need it as this deploys onto Cloudflare workers.
2. Login to Wrangler with `npx wrangler login`. Allow it to access your Cloudflare account.
3. Create the D1 database required with `npx wrangler d1 create stremio-addon-douban`. Update `database_id` in `wrangler.jsonc` with the created database id. Say no when it asks you if you want Wrangler to add the config on your behalf.
4. Update create and `.env`, populating the `CLOUDFLARE_` keys required for D1 database access and setup.
   1. `CLOUDFLARE_DATABASE_ID` will be the `database_id` for the database you created earlier.
5. Install Drizzle ORM with `npm install drizzle-orm`.
6. Push the schema to your newly created database with `npx drizzle-kit push`.
7. Create a KV store with namespace of your choice with `npx wrangler kv namespace create <Namespace>`. Make note of the `id`. Update `wrangler.jsonc` with this `id` in the `kv_namespaces` section.
   - Add a key/value pair with key `DASH_USER` using `npx wrangler kv key put --namespace-id <namespaceId> --remote DASH_USER <username>`. This can be done on the Cloudflare UI as well, if you wish.
   - Repeat the above with the key for `DASH_PASS` and a corresponding password value. Use some non-important password...

Note - all ID's can be obtained from your Cloudflare dashboard after, if you forget it.

## Usage

Dev testing - `npm run dev` or `npx wrangler dev`.

## Deploy to Cloudflare

Setup your API keys and variables/secrets with the following, for each corresponding config in `.env`.

For secrets you can add them with `npx wrangler secret put <KEY>`. Otherwise for non-secrets, you can just configure the worker once it deploys the first time within your Cloudflare dashboard. You can copy the contents of your `.env` file in the interface to import the entire thing, omitting the Cloudflare keys used for setup. Next time you deploy you will be prompted to update the local version of `wrangler.jsonc` with these values.

Run `npm run deploy` to deploy to Cloudflare. Test and configure missing variables/secrets as necessary.

## Stremio Installation

Add the following URL to Stremio:

```txt
https://stremio-addon-douban.jcao.ca/manifest.json
```