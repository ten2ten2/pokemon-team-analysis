# Pokémon Team Analysis

Import Pokémon Showdown teams, validate Scarlet/Violet rules, and inspect defensive resistances and offensive type coverage. Teams stay in this browser's local storage; there is no account or cloud synchronization.

## Develop

Install [mise](https://mise.jdx.dev/getting-started.html), then:

```sh
git clone https://github.com/ten2ten2/pokemon-team-analysis.git
cd pokemon-team-analysis
git switch dev
mise trust
mise install
mise run install
cp .env.example .env
mise run dev
```

Open `http://localhost:3000`. Tool versions are pinned in `mise.toml`; dependencies are pinned in `package.json` and `pnpm-lock.yaml`. Commit lockfile changes with dependency updates.

```sh
mise run check       # translations, TypeScript, regression tests
mise run build       # production server
mise run preview
mise run generate    # static output
```

Nuxt 4 uses Vue 3, Tailwind CSS through its Vite plugin, Nuxt i18n, and `@pkmn/data` / `@pkmn/sim`. TypeScript stays on 6.0.3 because Vue's current type checker requires the JavaScript compiler API, which TypeScript 7 no longer exports; Nuxt's TypeScript ESLint dependencies also require `<6.1`.

## Features and scope

- Import, edit, delete and copy Showdown team text. Validation errors remain visible and editable.
- Defensive type multipliers with the implemented ability/item modifiers, weather, terrain and one Terastallization selection.
- Offensive coverage against a selected type combination and a curated reference Pokémon list; separate physical and special moves.
- English `/`, Japanese `/ja`, Korean `/ko`, Simplified Chinese `/zh-hans`, Traditional Chinese `/zh-hant`.
- Optional Google Analytics, initialized after consent. Configure `NUXT_PUBLIC_GTAG_ID`.

The selectable formats are Regulation G, H and I in singles and doubles. They are explicit historical rule sets, not an automatically updated current-season feed. Speed tiers and strategy analysis are not implemented.

Coverage scores are a ranking heuristic using the attacker's level/stats, base power, STAB and type effectiveness against fixed neutral defenses. They are not exact battle damage. Coverage does not simulate target abilities/items, weather, terrain or every conditional move mechanic. The reference Pokémon list is maintained in source, not fetched usage data.

## Code map

| Path | Responsibility |
| --- | --- |
| `app/pages`, `app/components` | Pages and reusable UI |
| `app/composables` | Nuxt state, storage integration, translations and SEO |
| `app/lib/parser`, `app/lib/core/formats` | Showdown import, rules and format-normalized stats |
| `app/lib/analyzer`, `app/lib/calculator` | Pure analysis and ranking logic |
| `app/lib/storage` | Persistent source text; derived analysis recalculated on read |
| `i18n/locales` | UI translations |
| `server/assets/data` | Pokémon terminology translations |
| `server/api/pokemon-translations.get.ts` | Shared, cacheable translation payload |
| `tests` | Parser, rules, calculations, persistence and component regressions |

See [development notes](docs/DEVELOPMENT.md) and [deployment](docs/DEPLOYMENT.md).

Pokémon data and validation come from [Pokémon Showdown / pkmn](https://github.com/pkmn/ps); sprites are served from [PokeAPI](https://github.com/PokeAPI/sprites). Pokémon names and artwork belong to their respective owners.

License: MIT.
