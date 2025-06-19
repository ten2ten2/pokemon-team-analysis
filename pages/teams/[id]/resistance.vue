<script setup lang="ts">
import { Team } from '@pkmn/sets'
import type { Team as TeamType } from '~/types/team'
import type { Pokemon } from '~/types/pokemon'
import { getSprite } from '~/utils/teamUtils'
import { getTypeBadgeClass, getTypeIconClass } from '~/utils/pokemonTypeUtils'
import {
  ResistanceAnalyzer,
  getPokemonResistance,
  getTeamResistanceLevel,
  type ResistanceAnalysisResult,
  type ResistanceItem
} from '~/lib/analyzer/resistanceAnalysis'
import { WEATHER_EFFECTS, TERRAIN_EFFECTS } from '~/lib/analyzer/resistanceUtils'

const route = useRoute()
const { t } = useI18n()

const activeTab = ref('resistance')
const teamId = route.params.id as string
const selectedWeather = ref<string>('')
const selectedTerrain = ref<string>('')
const resistanceResult = ref<ResistanceAnalysisResult | null>(null)
const loading = ref(false)
const currentTeam = ref<TeamType | null>(null)

// 创建抗性分析器实例
const analyzer = new ResistanceAnalyzer(9)

// Tab 配置
const tabs = computed(() => [
  {
    key: 'overview',
    label: t('teamDetail.tabs.overview'),
    to: `/teams/${teamId}`
  },
  {
    key: 'resistance',
    label: t('teamDetail.tabs.resistance')
  }
])

// 计算抗性数据
const calculateResistance = async (team: TeamType) => {
  if (!team?.teamRawData) return

  loading.value = true
  try {
    // 解析队伍数据
    const teamParsed = Team.import(team.teamRawData)
    if (!teamParsed) return

    // 执行抗性分析（包含天气和场地效果）
    resistanceResult.value = analyzer.analyze(
      teamParsed,
      selectedWeather.value || undefined,
      selectedTerrain.value || undefined
    )
  } catch (error) {
    console.error('抗性分析失败:', error)
    resistanceResult.value = null
  } finally {
    loading.value = false
  }
}

// 监听天气和场地变化
watch([selectedWeather, selectedTerrain], () => {
  if (currentTeam.value) {
    calculateResistance(currentTeam.value)
  }
})

// 获取倍率的显示样式
const getMultiplierClass = (multiplier: number) => {
  if (multiplier === 0) return 'bg-green-200 text-green-900 border-green-300'
  if (multiplier < 1) return 'bg-green-100 text-green-800 border-green-300'
  if (multiplier > 1 && multiplier < 4) return 'bg-red-100 text-red-800 border-red-300'
  if (multiplier >= 4) return 'bg-red-200 text-red-900 border-red-300'
  return 'bg-blue-100 text-blue-800 border-blue-300'
}

// 获取倍率的显示文本
const getMultiplierText = (multiplier: number) => {
  if (multiplier === 0) return t('resistance.multiplier.immune')
  if (multiplier === 0.25) return '0.25×'
  if (multiplier === 0.5) return '0.5×'
  if (multiplier === 1) return '1×'
  if (multiplier === 2) return '2×'
  if (multiplier === 4) return '4×'
  return `${multiplier}×`
}

// 天气选项
const weatherOptions = computed(() => [
  { value: '', label: t('resistance.weather.none') },
  ...Object.keys(WEATHER_EFFECTS).map(weather => ({
    value: weather,
    label: t(`resistance.weather.${weather.toLowerCase().replace(/\s+/g, '_')}`)
  }))
])

// 场地选项
const terrainOptions = computed(() => [
  { value: '', label: t('resistance.terrain.none') },
  ...Object.keys(TERRAIN_EFFECTS).map(terrain => ({
    value: terrain,
    label: t(`resistance.terrain.${terrain.toLowerCase().replace(/\s+/g, '_')}`)
  }))
])

// 获取所有属性类型
const getAllTypes = computed(() => {
  if (!resistanceResult.value) return []
  return resistanceResult.value.typeResistances.map(tr => tr.type)
})

// 获取特定宝可梦对特定属性的抗性倍率（优化的查找）
const getResistanceMultiplier = (pokemonIndex: number, attackType: string): number => {
  if (!resistanceResult.value) return 1
  return getPokemonResistance(resistanceResult.value, pokemonIndex, attackType)
}

// 计算队伍对特定属性的整体抵抗程度（优化的查找）
const getTypeResistanceLevel = (attackType: string): number => {
  if (!resistanceResult.value) return 0
  return getTeamResistanceLevel(resistanceResult.value, attackType)
}

// 获取抵抗程度的竖条显示
const getResistanceLevelBars = (level: number, maxLevel: number) => {
  const bars = []

  // 创建竖条数组，总共maxLevel*2+1个位置（左边maxLevel个，中间1个，右边maxLevel个）
  for (let i = -maxLevel; i <= maxLevel; i++) {
    let barClass = 'w-1 h-4 mx-px' // 基础样式

    if (i === 0) {
      // 中心线
      barClass += ' bg-gray-400 dark:bg-gray-500'
    } else if (level > 0 && i > 0 && i <= level) {
      // 抵抗（绿色，右侧）
      barClass += ' bg-green-500'
    } else if (level < 0 && i < 0 && i >= level) {
      // 弱点（红色，左侧）
      barClass += ' bg-red-500'
    } else {
      // 空白
      barClass += ' bg-gray-200 dark:bg-gray-700'
    }

    bars.push({
      position: i,
      class: barClass
    })
  }

  return bars
}

// 处理团队数据变化
const handleTeamChange = (team: TeamType) => {
  currentTeam.value = team
  if (team && team.teamData && team.teamData.length > 0) {
    calculateResistance(team)
  }
}

// 分析摘要计算属性
const analysisSummary = computed(() => {
  return resistanceResult.value?.summary
})

// 根据宝可梦索引获取完整的宝可梦数据
const getPokemonByIndex = (index: number, teamData: Pokemon[]): Pokemon | undefined => {
  return teamData[index]
}

// 获取宝可梦图片的简化函数
const getPokemonSprite = (pokemon: ResistanceItem, teamData: Pokemon[]): string => {
  const fullPokemon = getPokemonByIndex(pokemon.index, teamData)
  if (fullPokemon) {
    return getSprite(fullPokemon, fullPokemon.shiny ? 'default-shiny' : 'default')
  }
  // 如果找不到完整数据，返回默认图片
  return '/images/pokemon-placeholder.png'
}

</script>

<template>
  <TeamDetailLayout :team-id="teamId" :active-tab="activeTab" :show-edit-button="true" @tab-change="activeTab = $event">
    <template #tabs="{ activeTab: currentTab, handleTabChange }">
      <TabNavigation :tabs="tabs" :active-tab="currentTab" :team-id="teamId" @change="handleTabChange" />
    </template>

    <template #default="{ team, translateName, useTranslation }">
      <!-- 监听团队变化 -->
      {{ handleTeamChange(team) }}

      <!-- 抗性分析 Tab -->
      <div v-show="activeTab === 'resistance'" role="tabpanel" aria-labelledby="tab-resistance">
        <!-- 控制面板 -->
        <section v-if="!team.errors || team.errors.length === 0" class="mb-8">
          <header class="mb-4">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ t('resistance.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              {{ t('resistance.description') }}
            </p>
          </header>

          <!-- 天气和场地选择 -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {{ t('resistance.controls.title') }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 天气选择 -->
              <div>
                <label for="weather-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('resistance.controls.weather') }}
                </label>
                <select id="weather-select" v-model="selectedWeather"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white">
                  <option v-for="option in weatherOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <!-- 场地选择 -->
              <div>
                <label for="terrain-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('resistance.controls.terrain') }}
                </label>
                <select id="terrain-select" v-model="selectedTerrain"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white">
                  <option v-for="option in terrainOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- 分析摘要 -->
          <div v-if="analysisSummary && !loading"
            class="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {{ t('resistance.summary.title') }}
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- 主要弱点 -->
              <div class="lg:border-r border-gray-200 dark:border-gray-700 lg:pr-6">
                <h4 class="text-base font-medium text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                  <AlertTriangle class="w-4 h-4" aria-hidden="true" />
                  {{ t('resistance.summary.weaknesses') }}
                </h4>
                <div v-if="analysisSummary.weaknesses.length > 0" class="space-y-3">
                  <div v-for="weakness in analysisSummary.weaknesses.slice(0, 4)" :key="weakness.type"
                    class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                    <div class="flex items-center mb-2">
                      <span :class="getTypeBadgeClass(weakness.type)" class="text-sm font-medium">
                        <i :class="getTypeIconClass(weakness.type)" aria-hidden="true"></i>
                        {{ translateName(weakness.type, 'type') }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <div v-for="pokemon in weakness.pokemons" :key="pokemon.index" class="relative group">
                        <div
                          class="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md p-2 border border-red-200 dark:border-red-700">
                          <NuxtImg :src="getPokemonSprite(pokemon, team.teamData)"
                            :alt="translateName(pokemon.species, 'species')"
                            :title="translateName(pokemon.species, 'species')"
                            class="w-6 h-6 object-contain rounded-full bg-gray-100 dark:bg-gray-700" height="24"
                            width="24" loading="lazy" />
                          <span class="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[60px]">
                            {{ translateName(pokemon.species, 'species') }}
                          </span>
                          <span :class="[
                            'text-xs px-1.5 py-0.5 rounded font-medium',
                            getMultiplierClass(getResistanceMultiplier(pokemon.index, weakness.type))
                          ]">
                            {{ getMultiplierText(getResistanceMultiplier(pokemon.index, weakness.type)) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <div v-else
                  class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div class="flex items-center gap-2">
                    <Shield class="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                    <p class="text-sm text-green-700 dark:text-green-300 font-medium">
                      {{ t('resistance.summary.noWeaknesses') }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- 主要抗性 -->
              <div class="lg:border-r border-gray-200 dark:border-gray-700 lg:pr-6">
                <h4 class="text-base font-medium text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                  <Shield class="w-4 h-4" aria-hidden="true" />
                  {{ t('resistance.summary.resistances') }}
                </h4>
                <div v-if="analysisSummary.resistances.length > 0" class="space-y-3">
                  <div v-for="resistance in analysisSummary.resistances.slice(0, 4)" :key="resistance.type"
                    class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <div class="flex items-center mb-2">
                      <span :class="getTypeBadgeClass(resistance.type)" class="text-sm font-medium">
                        <i :class="getTypeIconClass(resistance.type)" aria-hidden="true"></i>
                        {{ translateName(resistance.type, 'type') }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <div v-for="pokemon in resistance.pokemons" :key="pokemon.index" class="relative group">
                        <div
                          class="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md p-2 border border-green-200 dark:border-green-700">
                          <NuxtImg :src="getPokemonSprite(pokemon, team.teamData)"
                            :alt="translateName(pokemon.species, 'species')"
                            :title="translateName(pokemon.species, 'species')"
                            class="w-6 h-6 object-contain rounded-full bg-gray-100 dark:bg-gray-700" height="24"
                            width="24" loading="lazy" />
                          <span class="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[60px]">
                            {{ translateName(pokemon.species, 'species') }}
                          </span>
                          <span :class="[
                            'text-xs px-1.5 py-0.5 rounded font-medium',
                            getMultiplierClass(getResistanceMultiplier(pokemon.index, resistance.type))
                          ]">
                            {{ getMultiplierText(getResistanceMultiplier(pokemon.index, resistance.type)) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <div v-else
                  class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <div class="flex items-center gap-2">
                    <AlertTriangle class="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                    <p class="text-sm text-orange-700 dark:text-orange-300 font-medium">
                      {{ t('resistance.summary.noResistances') }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- 免疫 -->
              <div>
                <h4 class="text-base font-medium text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                  <Check class="w-4 h-4" aria-hidden="true" />
                  {{ t('resistance.summary.immunities') }}
                </h4>
                <div v-if="analysisSummary.immunities.length > 0" class="space-y-3">
                  <div v-for="immunity in analysisSummary.immunities.slice(0, 4)" :key="immunity.type"
                    class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div class="flex items-center mb-2">
                      <span :class="getTypeBadgeClass(immunity.type)" class="text-sm font-medium">
                        <i :class="getTypeIconClass(immunity.type)" aria-hidden="true"></i>
                        {{ translateName(immunity.type, 'type') }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <div v-for="pokemon in immunity.pokemons" :key="pokemon.index" class="relative group">
                        <div
                          class="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md p-2 border border-blue-200 dark:border-blue-700">
                          <NuxtImg :src="getPokemonSprite(pokemon, team.teamData)"
                            :alt="translateName(pokemon.species, 'species')"
                            :title="translateName(pokemon.species, 'species')"
                            class="w-6 h-6 object-contain rounded-full bg-gray-100 dark:bg-gray-700" height="24"
                            width="24" loading="lazy" />
                          <span class="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[60px]">
                            {{ translateName(pokemon.species, 'species') }}
                          </span>
                          <span :class="[
                            'text-xs px-1.5 py-0.5 rounded font-medium',
                            getMultiplierClass(getResistanceMultiplier(pokemon.index, immunity.type))
                          ]">
                            {{ getMultiplierText(getResistanceMultiplier(pokemon.index, immunity.type)) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <div v-else
                  class="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                  <div class="flex items-center gap-2">
                    <X class="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                    <p class="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {{ t('resistance.summary.noImmunities') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 抗性表格 -->
        <section v-if="!team.errors || team.errors.length === 0">
          <!-- 加载状态 -->
          <LoadingSpinner v-if="loading" :message="t('resistance.calculating')" size="sm" />

          <!-- 抗性数据表格 -->
          <div v-else-if="resistanceResult && getAllTypes.length > 0"
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <!-- 表头 -->
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col"
                      class="px-4 py-3 text-left text-base font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700 z-10 w-55">
                      <div class="flex items-center gap-2">
                        {{ t('resistance.attackType') }}
                        <Sword class="w-4 h-4 transform scale-x-[-1]" aria-hidden="true" />
                      </div>
                    </th>
                    <th v-for="pokemon in team.teamData" :key="pokemon.species" scope="col"
                      class="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                      <div class="flex flex-col items-center gap-2">
                        <div class="relative">
                          <NuxtImg
                            :src="pokemon.shiny ? getSprite(pokemon, 'default-shiny') : getSprite(pokemon, 'default')"
                            :alt="translateName(pokemon.species, 'species')"
                            :title="translateName(pokemon.species, 'species')" class="w-12 h-12 object-contain"
                            height="48" width="48" loading="lazy" />
                          <span v-if="pokemon.shiny" class="absolute -top-1 -right-1" title="异色" aria-label="异色">
                            <Sparkles class="w-3 h-3 text-yellow-400" aria-hidden="true" />
                          </span>
                        </div>
                        <div class="text-center">
                          <div class="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[100px]">
                            {{ translateName(pokemon.species, 'species') }}
                          </div>
                          <div class="flex flex-wrap justify-center gap-1 mt-1">
                            <span v-for="type in pokemon.types" :key="type" :class="getTypeBadgeClass(type)"
                              class="text-xs">
                              <i :class="getTypeIconClass(type)" aria-hidden="true"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <!-- 表体 -->
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  <tr v-for="type in getAllTypes" :key="type" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <!-- 属性类型列 -->
                    <td
                      class="px-4 py-4 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-600 w-56 min-w-56">
                      <div class="flex items-center justify-between">
                        <span :class="getTypeBadgeClass(type)" class="flex-shrink-0">
                          <i :class="getTypeIconClass(type)" aria-hidden="true"></i>
                          {{ translateName(type, 'type') }}
                        </span>
                        <!-- 抵抗程度竖条显示 -->
                        <div class="flex items-center">
                          <div v-for="bar in getResistanceLevelBars(getTypeResistanceLevel(type), team.teamData.length)"
                            :key="bar.position" :class="bar.class">
                          </div>
                        </div>
                      </div>
                    </td>
                    <!-- 抗性倍率列 -->
                    <td v-for="(pokemon, index) in team.teamData" :key="pokemon.species" class="px-3 py-4 text-center">
                      <div class="flex justify-center">
                        <span v-if="getResistanceMultiplier(index, type) !== 1" :class="[
                          'inline-flex items-center px-2 py-1 rounded text-sm font-medium',
                          getMultiplierClass(getResistanceMultiplier(index, type))
                        ]">
                          {{ getMultiplierText(getResistanceMultiplier(index, type)) }}
                        </span>
                        <span v-else class="text-gray-400 dark:text-gray-500 text-sm">-</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 无数据状态 -->
          <div v-else class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">
              {{ t('resistance.noData') }}
            </p>
          </div>
        </section>
      </div>
    </template>
  </TeamDetailLayout>
</template>
