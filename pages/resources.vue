<script setup lang="ts">
// Page metadata
definePageMeta({
  layout: 'default'
})

// Composables
const { t, locale } = useI18n()

// Use existing SEO composables
useCustomSeoMeta({ page: 'resources' })
useSeoLinks()
useStructuredData({ page: 'resources' })

// Resource links organized by category
const resourceCategories = computed(() => [
  {
    id: 'official',
    title: t('resources.categories.official.title'),
    description: t('resources.categories.official.description'),
    links: [
      {
        title: t('resources.links.officialBattle.title'),
        description: t('resources.links.officialBattle.description'),
        url: getOfficialBattleUrl(locale.value),
        external: true
      },
      {
        title: t('resources.links.worldChampionships.title'),
        description: t('resources.links.worldChampionships.description'),
        url: 'https://worlds.pokemon.com/',
        external: true
      }
    ]
  },
  {
    id: 'wiki',
    title: t('resources.categories.wiki.title'),
    description: t('resources.categories.wiki.description'),
    links: [
      {
        title: t('resources.links.pokemonWiki.title'),
        description: t('resources.links.pokemonWiki.description'),
        url: getPokemonWikiUrl(locale.value),
        external: true
      }
    ]
  },
  {
    id: 'tools',
    title: t('resources.categories.tools.title'),
    description: t('resources.categories.tools.description'),
    links: [
      {
        title: t('resources.links.pokemonShowdown.title'),
        description: t('resources.links.pokemonShowdown.description'),
        url: 'https://play.pokemonshowdown.com',
        external: true
      },
      {
        title: t('resources.links.damageCalculator.title'),
        description: t('resources.links.damageCalculator.description'),
        url: 'https://calc.pokemonshowdown.com',
        external: true
      },
      {
        title: t('resources.links.pikalytics.title'),
        description: t('resources.links.pikalytics.description'),
        url: 'https://pikalytics.com',
        external: true
      },
      {
        title: t('resources.links.vgcPastes.title'),
        description: t('resources.links.vgcPastes.description'),
        url: 'https://x.com/VGCPastes',
        external: true
      }
    ]
  },
  {
    id: 'games',
    title: t('resources.categories.games.title'),
    description: t('resources.categories.games.description'),
    links: [
      {
        title: t('resources.links.pokeWordle.title'),
        description: t('resources.links.pokeWordle.description'),
        url: 'https://www.pokewordle.app',
        external: true
      }
    ]
  }
])

// Helper function to get official battle URL based on locale
function getOfficialBattleUrl(currentLocale: string): string {
  switch (currentLocale) {
    case 'ja':
      return 'https://www.pokemon.co.jp/ex/pjcs/2025/game/'
    case 'ko':
      return 'https://pokemonkorea.co.kr/ptc2025'
    default:
      return 'https://www.pokemon.com/us/play-pokemon/pokemon-events/championship-series/2025/about'
  }
}

// Helper function to get Pokemon wiki URL based on locale
function getPokemonWikiUrl(currentLocale: string): string {
  switch (currentLocale) {
    case 'zh-hans':
      return 'https://wiki.52poke.com/zh-hans/%E4%B8%BB%E9%A1%B5'
    case 'zh-hant':
      return 'https://wiki.52poke.com/zh-hant/%E4%B8%BB%E9%A1%B5'
    case 'ja':
      return 'https://wiki.xn--rckteqa2e.com/wiki/%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%9A%E3%83%BC%E3%82%B8'
    case 'ko':
      return 'https://pokemon.fandom.com/ko/wiki/%EB%8C%80%EB%AC%B8'
    default:
      return 'https://bulbapedia.bulbagarden.net/wiki/Main_Page'
  }
}

const breadcrumbItems = computed(() => [
  { label: t('resources.title'), isCurrentPage: true }
])
</script>

<template>
  <PageContainer :show-breadcrumb="true" :breadcrumb-items="breadcrumbItems">
    <!-- Page Header -->
    <template #header>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ t('resources.title') }}
      </h1>
    </template>
    <template #headerContent>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('resources.description') }}
      </p>
    </template>

    <!-- Resource Categories -->
    <div class="space-y-8">
      <ContentCard v-for="category in resourceCategories" :key="category.id" :title="category.title">
        <div class="mb-4">
          <p class="text-gray-600 dark:text-gray-400">
            {{ category.description }}
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          <NuxtLink v-for="link in category.links" :key="link.url" :to="link.url" :external="link.external"
            target="_blank" rel="noopener noreferrer"
            class="no-style group block p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
            :aria-label="`${t('resources.visitLink')} ${link.title}`">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center mb-2">
                  <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                    {{ link.title }}
                  </h3>
                  <ExternalLink
                    class="ml-2 h-4 w-4 text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors flex-shrink-0" />
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ link.description }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </ContentCard>
    </div>
  </PageContainer>
</template>
