<script setup lang="ts">
import type { Pokemon } from '~/lib/core/types'

const route = useRoute()
const { t } = useI18n()

const activeTab = ref('overview')
const teamId = route.params.id as string

// Tab 配置
const tabs = computed(() => [
  {
    key: 'overview',
    label: t('teamDetail.tabs.overview')
  },
  {
    key: 'resistance',
    label: t('teamDetail.tabs.resistance'),
    to: `/teams/${teamId}/resistance`
  },
  {
    key: 'coverage',
    label: t('teamDetail.tabs.coverage'),
    to: `/teams/${teamId}/coverage`
  },
  {
    key: 'speed-tiers',
    label: t('teamDetail.tabs.speedTiers'),
    // to: `/teams/${teamId}/speed-tiers`,
    disabled: true
  },
  {
    key: 'strategy',
    label: t('teamDetail.tabs.strategy'),
    // to: `/teams/${teamId}/strategy`,
    disabled: true
  }
])
</script>

<template>
  <TeamDetailLayout :team-id="teamId" :active-tab="activeTab" :show-edit-button="true" @tab-change="activeTab = $event">
    <template #tabs="{ activeTab: currentTab, handleTabChange }">
      <TabNavigation :tabs="tabs" :active-tab="currentTab" :team-id="teamId" @change="handleTabChange" />
    </template>

    <template #default="{ team, translateName }">
      <!-- Overview Tab -->
      <div v-show="activeTab === 'overview'" role="tabpanel" :aria-labelledby="`tab-overview`" class="space-y-8">
        <!-- 团队成员 -->
        <section v-if="team.teamData && team.teamData.length > 0">
          <header class="mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ t('teamDetail.teamMembers.title', { count: team.teamData.length }) }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              {{ t('teamDetail.teamMembers.description') }}
            </p>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <PokemonCard v-for="(pokemon, index) in team.teamData" :key="index" :pokemon="pokemon as Pokemon"
              :translate-name="translateName" sprite-variant="official-artwork" />
          </div>
        </section>

        <!-- 原始数据 -->
        <section>
          <header class="mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ t('teamDetail.rawData.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              {{ t('teamDetail.rawData.description') }}
            </p>
          </header>

          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ team.name }}
              </h3>
              <CopyButton :text="team.teamRawData" />
            </div>
            <pre
              class="bg-white dark:bg-gray-900 rounded-lg p-4 text-sm overflow-x-auto text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap break-words">{{ team.teamRawData }}</pre>
          </div>
        </section>
      </div>
    </template>
  </TeamDetailLayout>
</template>
