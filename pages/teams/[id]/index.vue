<script setup lang="ts">
import type { Team, TeamUpdateData } from '~/types/team'
import { formatDate } from '~/utils/formatDate'
import { getSprite } from '~/utils/teamUtils'
import { getTypeBadgeClass, getTypeChipClass, getTypeIconClass, getMoveCategoryIconClass } from '~/utils/pokemonTypeUtils'
// Lucide icons are globally registered in plugins/lucide.ts

const route = useRoute()
const { t } = useI18n()
const { getTeam, updateTeam } = useTeamStorage()
const { gameVersionOptions, rulesOptions } = useTeamOptions()
const { getTranslatedName } = usePokemonTranslations()

// 响应式数据
const team = ref<Team | null>(null)
const pending = ref(true)
const activeTab = ref('overview')
const useTranslation = ref(false)
const showEditModal = ref(false)
const copySuccess = ref(false)

// 获取团队数据
onMounted(() => {
  const teamId = route.params.id as string
  team.value = getTeam(teamId)
  pending.value = false
})

// 创建一个帮助函数来获取翻译名称
const translateName = (name: string, type: 'species' | 'ability' | 'move' | 'item' | 'type' = 'species') => {
  return getTranslatedName(name, type, unref(useTranslation))
}

// 获取游戏版本标签
const getGameVersionLabel = (gameVersion: string): string => {
  const option = gameVersionOptions.value.find(opt => opt.value === gameVersion)
  return option?.label || gameVersion
}

// 获取规则标签
const getRulesLabel = (rules: string): string => {
  const option = rulesOptions.value.find(opt => opt.value === rules)
  return option?.label || rules
}

// 处理团队更新
const handleTeamUpdate = (data: TeamUpdateData) => {
  const updatedTeam = updateTeam(data.id, {
    name: data.teamName,
    teamRawData: data.teamRawData,
    gameVersion: data.gameVersion,
    rules: data.rules
  })

  if (updatedTeam) {
    team.value = updatedTeam
  }
}

// 复制原始数据
const copyRawData = async () => {
  if (!team.value?.teamRawData || !import.meta.client) return

  try {
    await navigator.clipboard.writeText(team.value.teamRawData)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error)
    // 降级方案：选择文本
    try {
      const textArea = document.createElement('textarea')
      textArea.value = team.value.teamRawData
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      copySuccess.value = true
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    } catch (fallbackError) {
      console.error('Fallback copy method also failed:', fallbackError)
    }
  }
}

// SEO 设置
useSeoMeta({
  title: computed(() => team.value ? `${team.value.name} - ${t('teamDetail.meta.title')}` : t('teamDetail.meta.title')),
  description: computed(() =>
    team.value
      ? t('teamDetail.meta.description', {
        name: team.value.name,
        count: team.value.teamData?.length || 0
      })
      : t('teamDetail.meta.defaultDescription')
  ),
  ogTitle: computed(() => team.value ? `${team.value.name} - ${t('teamDetail.meta.title')}` : t('teamDetail.meta.title')),
  ogDescription: computed(() =>
    team.value
      ? t('teamDetail.meta.description', {
        name: team.value.name,
        count: team.value.teamData?.length || 0
      })
      : t('teamDetail.meta.defaultDescription')
  ),
  ogType: 'article',
  twitterCard: 'summary'
})

// 结构化数据
useHead({
  script: computed(() => [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: team.value?.name || t('teamDetail.meta.title'),
        description: team.value
          ? t('teamDetail.meta.description', {
            name: team.value.name,
            count: team.value.teamData?.length || 0
          })
          : t('teamDetail.meta.defaultDescription'),
        dateCreated: team.value?.createdAt?.toISOString(),
        dateModified: team.value?.createdAt?.toISOString(),
        author: {
          '@type': 'Organization',
          name: 'Pokemon Team Analysis'
        }
      })
    }
  ])
})
</script>

<template>
  <div>
    <PageContainer :showBreadcrumb="false" maxWidth="full">
      <!-- 团队未找到 -->
      <div v-if="!team && !pending" class="text-center py-12">
        <header>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {{ $t('teamDetail.notFound.title') }}
          </h1>
        </header>
        <main>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ $t('teamDetail.notFound.description', { id: route.params.id }) }}
          </p>
          <NuxtLink to="/"
            class="btn-primary inline-flex items-center px-6 py-3 shadow-md hover:shadow-lg focus-ring-red transform hover:scale-105 active:scale-95">
            {{ $t('teamDetail.notFound.backToHome') }}
          </NuxtLink>
        </main>
      </div>

      <!-- 加载中 -->
      <div v-else-if="pending" class="text-center py-12" role="status" aria-live="polite">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4" aria-hidden="true">
        </div>
        <p class="text-gray-600 dark:text-gray-400">{{ $t('common.loading.default') }}</p>
      </div>

      <!-- 团队详情 -->
      <div v-else-if="team">
        <!-- 团队标题区域 -->
        <header class="mb-8">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ team.name }}
              </h1>
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span class="inline-flex items-center gap-1">
                  <span class="font-medium">{{ $t('common.gameVersion.title') }}:</span>
                  {{ getGameVersionLabel(team.gameVersion) }}
                </span>
                <span class="inline-flex items-center gap-1">
                  <span class="font-medium">{{ $t('common.rules.title') }}:</span>
                  {{ getRulesLabel(team.rules) }}
                </span>
                <time :datetime="team.createdAt.toISOString()" class="inline-flex items-center gap-1">
                  <span class="font-medium">{{ $t('teamDetail.createdAt') }}:</span>
                  {{ formatDate(team.createdAt.toISOString(), $i18n.locale) }}
                </time>
              </div>
            </div>

            <!-- 翻译开关 (仅非英文语言且团队无错误时显示) -->
            <div v-if="$i18n.locale !== 'en' && (!team.errors || team.errors.length === 0)"
              class="flex items-center gap-3">
              <label for="translation-toggle" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('teamDetail.useTranslation') }}
              </label>
              <button id="translation-toggle" type="button" :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-ring-red',
                useTranslation ? 'bg-red-400 hover:bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
              ]" role="switch" :aria-checked="useTranslation" @click="useTranslation = !useTranslation">
                <span :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  useTranslation ? 'translate-x-5' : 'translate-x-0'
                ]" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Tab 导航 -->
          <nav class="border-b border-gray-200 dark:border-gray-700" role="tablist">
            <div class="-mb-px flex space-x-8">
              <button type="button" role="tab" :aria-selected="activeTab === 'overview'"
                :tabindex="activeTab === 'overview' ? 0 : -1" :class="[
                  'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                  activeTab === 'overview'
                    ? 'border-red-400 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-red-600 hover:border-red-300 dark:text-gray-400 dark:hover:text-red-400'
                ]" @click="activeTab = 'overview'">
                {{ $t('teamDetail.tabs.overview') }}
              </button>
              <!-- 预留其他 tab -->
              <button type="button" role="tab" :aria-selected="activeTab === 'resistance'"
                :tabindex="activeTab === 'resistance' ? 0 : -1" :class="[
                  'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 opacity-50 cursor-not-allowed',
                  'border-transparent text-gray-400'
                ]" disabled>
                {{ $t('teamDetail.tabs.resistance') }}
                <span class="ml-1 text-xs">({{ $t('common.comingSoon') }})</span>
              </button>
            </div>
          </nav>
        </header>

        <!-- Tab 内容 -->
        <main>
          <!-- Overview Tab -->
          <div v-show="activeTab === 'overview'" role="tabpanel" :aria-labelledby="`tab-overview`" class="space-y-8">
            <!-- 验证错误 -->
            <section v-if="team.errors && team.errors.length > 0"
              class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <header class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                    {{ $t('teamDetail.validationErrors.title') }}
                  </h2>
                  <p class="text-sm text-yellow-700 dark:text-yellow-300">
                    {{ $t('teamDetail.validationErrors.description') }}
                  </p>
                </div>
                <button type="button" @click="showEditModal = true"
                  class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800/50 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800/70 transition-colors focus-ring-red">
                  <Edit2 class="w-4 h-4" aria-hidden="true" />
                  {{ $t('teamDetail.editTeam') }}
                </button>
              </header>
              <ul class="space-y-2">
                <li v-for="(error, index) in team.errors" :key="index"
                  class="flex items-start gap-2 text-yellow-700 dark:text-yellow-300">
                  <AlertCircle class="w-4 h-4 mt-1 flex-shrink-0" aria-hidden="true" />
                  <span>{{ error }}</span>
                </li>
              </ul>
            </section>

            <!-- 团队成员 -->
            <section v-if="team.teamData && team.teamData.length > 0">
              <header class="mb-6">
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ $t('teamDetail.teamMembers.title', { count: team.teamData.length }) }}
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  {{ $t('teamDetail.teamMembers.description') }}
                </p>
              </header>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <article v-for="(pokemon, index) in team.teamData" :key="index"
                  class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <!-- 宝可梦基本信息 -->
                  <header class="flex items-center gap-4 mb-4">
                    <div class="relative">
                      <NuxtImg
                        :src="pokemon.shiny ? getSprite(pokemon, 'official-artwork-shiny') : getSprite(pokemon, 'official-artwork')"
                        :alt="translateName(pokemon.species, 'species')"
                        :title="translateName(pokemon.species, 'species')" class="w-16 h-16 object-contain" height="64"
                        width="64" loading="lazy" />
                      <span v-if="pokemon.shiny" class="absolute -top-1 -right-1" title="异色" aria-label="异色">
                        <Sparkles class="w-4 h-4 text-yellow-400" aria-hidden="true" />
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {{ translateName(pokemon.species, 'species') }}
                      </h3>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span v-for="type in pokemon.types" :key="type" :class="getTypeBadgeClass(type)">
                          <i :class="getTypeIconClass(type)" aria-hidden="true"></i>
                          {{ translateName(type, 'type') }}
                        </span>
                      </div>
                    </div>
                  </header>

                  <!-- 宝可梦详细信息 -->
                  <div class="space-y-3 text-sm">
                    <div v-if="pokemon.ability" class="flex items-center gap-2">
                      <span class="font-medium text-gray-700 dark:text-gray-300 min-w-0 flex-shrink-0">
                        {{ $t('teamDetail.pokemon.ability') }}:
                      </span>
                      <span class="text-gray-600 dark:text-gray-400 break-words">
                        {{ translateName(pokemon.ability, 'ability') }}
                      </span>
                    </div>

                    <div v-if="pokemon.item" class="flex items-center gap-2">
                      <span class="font-medium text-gray-700 dark:text-gray-300 min-w-0 flex-shrink-0">
                        {{ $t('teamDetail.pokemon.item') }}:
                      </span>
                      <span class="text-gray-600 dark:text-gray-400 break-words">
                        {{ translateName(pokemon.item, 'item') }}
                      </span>
                    </div>

                    <div v-if="pokemon.teraType" class="flex items-center gap-2">
                      <span class="font-medium text-gray-700 dark:text-gray-300 min-w-0 flex-shrink-0">
                        {{ $t('teamDetail.pokemon.teraType') }}:
                      </span>
                      <span :class="getTypeBadgeClass(pokemon.teraType)">
                        <i :class="getTypeIconClass(pokemon.teraType)" aria-hidden="true"></i>
                        {{ translateName(pokemon.teraType, 'type') }}
                      </span>
                    </div>

                    <div v-if="pokemon.moves && pokemon.moves.length > 0" class="flex items-start gap-2">
                      <span class="font-medium text-gray-700 dark:text-gray-300 min-w-0 flex-shrink-0">
                        {{ $t('teamDetail.pokemon.moves') }}:
                      </span>
                      <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap gap-1">
                          <span v-for="move in pokemon.moves" :key="move"
                            :class="getTypeChipClass(pokemon.movesDetails[move].type)">
                            <i :class="getMoveCategoryIconClass(pokemon.movesDetails[move].category)"
                              aria-hidden="true"></i>
                            {{ translateName(move, 'move') }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <!-- 原始数据 -->
            <section>
              <header class="mb-6">
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ $t('teamDetail.rawData.title') }}
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  {{ $t('teamDetail.rawData.description') }}
                </p>
              </header>

              <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ team.name }}
                  </h3>
                  <button type="button" @click="copyRawData" :class="[
                    'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors focus-ring-red',
                    copySuccess
                      ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800/50'
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  ]" :title="$t('teamDetail.rawData.copyButton')">
                    <Check v-if="copySuccess" class="w-4 h-4" aria-hidden="true" />
                    <Copy v-else class="w-4 h-4" aria-hidden="true" />
                    <span class="hidden sm:inline">
                      {{ copySuccess ? $t('teamDetail.rawData.copied') : $t('teamDetail.rawData.copy') }}
                    </span>
                  </button>
                </div>
                <pre
                  class="bg-white dark:bg-gray-900 rounded-lg p-4 text-sm overflow-x-auto text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap break-words">{{ team.teamRawData }}</pre>
              </div>
            </section>
          </div>

          <!-- 其他 Tab 内容预留 -->
          <div v-show="activeTab === 'resistance'" role="tabpanel" :aria-labelledby="`tab-resistance`"
            class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">
              {{ $t('common.comingSoon') }}
            </p>
          </div>
        </main>
      </div>
    </PageContainer>

    <!-- 编辑模态框 -->
    <TeamEditModal :is-open="showEditModal" mode="edit" :team="team" @close="showEditModal = false"
      @update="handleTeamUpdate" />
  </div>
</template>
