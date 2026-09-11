# Deployment

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
