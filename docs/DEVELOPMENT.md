# Development

## Runtime and dependencies

Use `mise install` and `mise run install`. `mise.toml` pins Node and pnpm; `pnpm-lock.yaml` fixes transitive dependencies. `pnpm-workspace.yaml` allows only the required native dependency build scripts. No npm/Yarn lockfiles are used.

Before committing, run `mise run check` and `mise run build`. Changes to static deployment also need `mise run generate`. CI runs checks and a production build on `dev` pushes and pull requests. No deployment is automatic.

## State and calculations

- Persist only team ID, name, game version, rules, original Showdown text and creation date under `pokemon-teams`. Existing derived fields are ignored and disappear on the next successful save. Do not discard a team because its display name is empty.
- `parseAndValidateTeam` uses the simulator's normalized species, sets and format level. Unknown moves remain as text with validation errors. Use `Generation.stats.calc` for ability values rather than maintaining another nature table or rounding formula.
- `TeamDetailLayout` loads browser data after mounting and emits `team-change` after loading or saving. Analysis watches the team and relevant controls. Never calculate or write state while rendering a template.
- Parsed teams, analysis results and translation dictionaries are replaced as whole objects. Use shallow refs for these payloads. `Generations` already caches static dex data.
- `resolveMove` and `moveEffectiveness` are shared by both coverage views. Extend them with a regression test when adding a move-specific exception. Full battle simulation remains outside the coverage score's scope.

## Translations and metadata

UI strings live in `i18n/locales`. Keep keys and array shapes identical in every locale; `pnpm validate:translations` verifies them. Use `t()` for strings and `tm()` with `rt()` when rendering translated collections.

Pokémon names use the shared `usePokemonTranslations` request and the shared display preference. Unknown terminology falls back to the input name. Register locales with `language`, not the removed `iso` field. The layout uses `useLocaleHead` for reactive language, canonical and alternate tags. Local-only team pages are `noindex`.

## Upstream references

- [Nuxt upgrade guide](https://nuxt.com/docs/4.x/getting-started/upgrade)
- [Nuxt i18n migration](https://i18n.nuxtjs.org/docs/guide/migrating)
- [Tailwind for Nuxt](https://tailwindcss.com/docs/installation/framework-guides/nuxt)
- [Lucide Vue](https://lucide.dev/guide/vue)
- [pkmn data API](https://github.com/pkmn/ps/tree/main/data)
- [nuxt-gtag consent and manual initialization](https://nuxt.com/modules/gtag)
