# Deployment

## Vercel

Import the repository using the Nuxt framework preset. `package.json` selects Node.js `24.x` for Vercel; `mise.toml` pins the Node 24 LTS patch used locally and in CI. Nitro explicitly targets `nodejs24.x` for server functions.

`vercel.json` runs installation and builds with pnpm `12.3.4` through npm's `npx`, so deployment does not depend on Vercel's default pnpm version. Keep these commands aligned with `packageManager` and `mise.toml` when upgrading pnpm. Dependency installation uses the committed lockfile.

Set the environment variables from `.env.example` in Vercel for the appropriate deployment environments. Leave the output directory at the framework default. To build the Vercel output locally, run `NITRO_PRESET=vercel mise run build`; CI uses the same preset. Build artifacts under `.vercel/` are not committed.

## Production server

```sh
mise install
mise run install
mise run check
mise run build
NODE_ENV=production node .output/server/index.mjs
```

Deploy the complete `.output` directory with Node matching `mise.toml`. Nitro accepts `PORT` (default `3000`) and `HOST` (default `0.0.0.0`). If the shell does not activate mise, use `mise exec -- node .output/server/index.mjs`.

Set public configuration using the names in `.env.example`. Production server execution does not load `.env` automatically; set variables through the host. Keep `NUXT_PUBLIC_SITE_URL`, `NUXT_SITE_URL` and `NUXT_PUBLIC_I18N_BASE_URL` on the same canonical origin. Configure the real contact email before launch. Leave `NUXT_PUBLIC_GTAG_ID` empty to omit analytics.

For provider-specific deployments, select the appropriate [Nitro deployment preset](https://nitro.build/deploy) and build on that host. A Node server build requires its server bundle, not just `.output/public`.

## Static hosting

```sh
mise run generate
```

Upload `.output/public`. The translation endpoint is explicitly prerendered so name translations do not require a live API. The host must serve `/api/pokemon-translations` as the generated JSON payload, not redirect it to the SPA HTML fallback.

Team IDs exist only in each browser. Configure SPA fallbacks for `/teams/*`, `/ja/teams/*`, `/ko/teams/*`, `/zh-hans/teams/*` and `/zh-hant/teams/*` to `200.html`. Public content pages should use their generated HTML. Unrelated missing URLs should return `404.html` with HTTP 404. Static deployments must set public configuration at build time.

Check the root page and every locale, a directly loaded team URL, `/api/pokemon-translations`, `/robots.txt`, and `/sitemap_index.xml` after deployment. Nuxt Image needs either an image-capable server/preset or the external provider; images for browser-only teams cannot all be discovered at prerender time.

Teams remain local to their original browser and origin. Changing the deployment domain does not move local storage to the new origin. Import the saved Showdown text again when using a different browser or origin.
