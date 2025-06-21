<script setup lang="ts">
// ============================================================================
// 导入和类型定义
// ============================================================================

import { Team } from '@pkmn/sets'
import type { Team as TeamType } from '~/types/team'
import type { Pokemon } from '~/types/pokemon'
import { getSprite } from '~/utils/teamUtils'
import { getTypeBadgeClass, getTypeIconClass } from '~/utils/pokemonTypeUtils'
import {
  CoverageAnalyzer,
  createCoverageAnalyzer,
  type CoverageAnalysisResult,
  type CoverageForCombinationUnit,
  type PopularPokemonCoverage,
  type CoverageLevel,
  type MoveInfo
} from '~/lib/analyzer/coverageAnalysis'
import { usePokemonTranslations } from '~/composables/usePokemonTranslations'

// ============================================================================
// 组合式API和状态管理
// ============================================================================

const route = useRoute()
const { t } = useI18n()
const { getTranslatedName } = usePokemonTranslations()
const { preferences } = useUserPreferences()

// 路由参数
const teamId = route.params.id as string

// 响应式状态
const activeTab = ref('coverage')
const activeCoverageTab = ref<'popularPokemon' | 'typeHeatmap'>('popularPokemon')
const selectedMoveFilter = ref<'all' | 'physical' | 'special'>('all')
const coverageResult = ref<CoverageAnalysisResult | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const currentTeam = ref<TeamType | null>(null)

// 分析器实例（缓存）
const analyzer = createCoverageAnalyzer(9)

// ============================================================================
// 计算属性和缓存优化
// ============================================================================

// Tab配置
const tabs = computed(() => [
  {
    key: 'overview',
    label: t('teamDetail.tabs.overview'),
    to: `/teams/${teamId}`
  },
  {
    key: 'resistance',
    label: t('teamDetail.tabs.resistance'),
    to: `/teams/${teamId}/resistance`
  },
  {
    key: 'coverage',
    label: t('teamDetail.tabs.coverage')
  }
])

// 所有属性类型（缓存）
const allTypes = computed(() => {
  if (!coverageResult.value) return []
  return Array.from(coverageResult.value.typeCoverageMatrix.keys())
})

// 热门宝可梦覆盖（按伤害排序，缓存）
const sortedPopularPokemonCoverage = computed(() => {
  if (!coverageResult.value) return []
  return [...coverageResult.value.popularPokemonCoverage]
    .sort((a, b) => b.overallScore - a.overallScore)
})

// ============================================================================
// 工具函数（memoized）
// ============================================================================

// 缓存覆盖等级样式类
const getCoverageLevelClass = (level: CoverageLevel): string => {
  const classMap: Record<CoverageLevel, string> = {
    'Effective': 'bg-green-200 text-green-900 border-green-300',
    'Neutral': 'bg-gray-100 text-gray-800 border-gray-300',
    'Resistant': 'bg-red-100 text-red-800 border-red-300',
    'Immune': 'bg-gray-300 text-gray-700 border-gray-400'
  }
  return classMap[level] || classMap.Neutral
}

// 根据分数获取带深浅的样式类（优化版）
const getCoverageLevelClassWithIntensity = (level: CoverageLevel, score: number): string => {
  const intensity = Math.min(Math.max(score / 10, 0), 10)

  const classMatrix: Record<CoverageLevel, string[]> = {
    'Effective': [
      'bg-green-200 text-green-900 border-green-300',
      'bg-green-300 text-green-900 border-green-400',
      'bg-green-400 text-green-900 border-green-500',
      'bg-green-500 text-white border-green-600',
      'bg-green-600 text-white border-green-700'
    ],
    'Neutral': [
      'bg-gray-200 text-gray-800 border-gray-300',
      'bg-gray-300 text-gray-900 border-gray-400',
      'bg-gray-400 text-gray-900 border-gray-500',
      'bg-gray-500 text-white border-gray-600',
      'bg-gray-600 text-white border-gray-700'
    ],
    'Resistant': [
      'bg-red-200 text-red-800 border-red-300',
      'bg-red-300 text-red-900 border-red-400',
      'bg-red-400 text-red-900 border-red-500',
      'bg-red-500 text-white border-red-600',
      'bg-red-600 text-white border-red-700'
    ],
    'Immune': [
      'bg-gray-400 text-gray-700 border-gray-500'
    ]
  }

  const classes = classMatrix[level] || classMatrix.Neutral
  const index = Math.min(Math.floor(intensity / 2), classes.length - 1)
  return classes[index]
}

// 获取覆盖等级文本
const getCoverageLevelText = (level: CoverageLevel): string => {
  return t(`coverage.levels.${level.toLowerCase()}`)
}

// 获取效果倍数文本
const getEffectivenessText = (effectiveness: number): string => {
  const effectivenessMap: Record<number, string> = {
    0: t('coverage.levels.immune'),
    0.25: '0.25×',
    0.5: '0.5×',
    1: '1×',
    2: '2×',
    4: '4×'
  }
  return effectivenessMap[effectiveness] || `${effectiveness}×`
}

// 获取招式详情文本
const getMoveDetailsText = (move: MoveInfo): string => {
  const parts = [
    `${t('coverage.moveDetails.power')}: ${move.basePower || '—'}`,
    `${t('coverage.moveDetails.type')}: ${getTranslatedName(move.type, 'type', preferences.value.useTranslation)}`,
    `${t('coverage.moveDetails.category')}: ${move.category}`,
    `${t('coverage.moveDetails.pokemon')}: ${getTranslatedName(move.pokemon, 'species', preferences.value.useTranslation)}`,
    `${t('coverage.moveDetails.effectiveness')}: ${getEffectivenessText(move.effectiveness)}`,
    move.hasSTAB ? `${t('coverage.moveDetails.stab')}: ${t('common.yes')}` : `${t('coverage.moveDetails.stab')}: ${t('common.no')}`
  ]
  return parts.join('\n')
}

// 判断是否在下三角区域
const isLowerTriangle = (type1: string, type2: string): boolean => {
  const index1 = allTypes.value.indexOf(type1)
  const index2 = allTypes.value.indexOf(type2)
  return index1 > index2
}

// 获取类型组合覆盖单元（优化查找）
const getTypeCombinationUnit = (type1: string, type2: string): CoverageForCombinationUnit | null => {
  if (!coverageResult.value) return null

  const matrix = coverageResult.value.typeCoverageMatrix
  const index1 = allTypes.value.indexOf(type1)
  const index2 = allTypes.value.indexOf(type2)

  if (index1 === -1 || index2 === -1) return null

  // 只返回上三角矩阵的数据
  if (index1 <= index2) {
    return matrix.get(type1)?.get(type2) || null
  } else {
    return matrix.get(type2)?.get(type1) || null
  }
}

// 获取类型组合的招式详情气泡内容（优化版）
const getTypeCombinationTooltip = (type1: string, type2: string): string => {
  const unit = getTypeCombinationUnit(type1, type2)
  if (!unit) return t('coverage.typeHeatmap.tooltip.noMoves')

  let moves: readonly MoveInfo[] = []

  // 根据过滤器获取招式
  switch (selectedMoveFilter.value) {
    case 'physical':
      moves = [
        ...unit.effectiveMovesPhysical,
        ...unit.neutralMovesPhysical,
        ...unit.resistantMovesPhysical,
        ...unit.immuneMovesPhysical
      ]
      break
    case 'special':
      moves = [
        ...unit.effectiveMovesSpecial,
        ...unit.neutralMovesSpecial,
        ...unit.resistantMovesSpecial,
        ...unit.immuneMovesSpecial
      ]
      break
    default:
      moves = [
        ...unit.effectiveMovesPhysical,
        ...unit.neutralMovesPhysical,
        ...unit.resistantMovesPhysical,
        ...unit.immuneMovesPhysical,
        ...unit.effectiveMovesSpecial,
        ...unit.neutralMovesSpecial,
        ...unit.resistantMovesSpecial,
        ...unit.immuneMovesSpecial
      ]
  }

  if (moves.length === 0) {
    return t('coverage.typeHeatmap.tooltip.noMoves')
  }

  // 只显示前5个最佳招式
  const topMoves = moves.slice(0, 5)
  const moveDetails = topMoves.map(move => {
    const stabText = move.hasSTAB ? ' (STAB)' : ''
    return `${getTranslatedName(move.name, 'move', preferences.value.useTranslation)} - ${move.category} - ${move.basePower || '—'} - ${getTranslatedName(move.pokemon, 'species', preferences.value.useTranslation)}${stabText}`
  })

  return moveDetails.join('\n')
}

// ============================================================================
// 核心业务逻辑
// ============================================================================

// 执行覆盖分析（带错误处理）
const calculateCoverage = async (team: TeamType): Promise<void> => {
  if (!team?.teamRawData) {
    error.value = t('coverage.errors.invalidTeam')
    return
  }

  loading.value = true
  error.value = null

  try {
    // 验证队伍数据
    const teamParsed = Team.import(team.teamRawData)
    if (!teamParsed) {
      throw new Error('Failed to parse team data')
    }

    // 执行分析
    coverageResult.value = analyzer.analyze(team)
  } catch (err) {
    console.error('Coverage analysis failed:', err)
    error.value = err instanceof Error ? err.message : t('coverage.errors.analysisError')
    coverageResult.value = null
  } finally {
    loading.value = false
  }
}

// 设置当前队伍（带去重检查）
const setCurrentTeam = (team: TeamType): string => {
  if (team && team !== currentTeam.value) {
    currentTeam.value = team
  }
  return ''
}

// ============================================================================
// 生命周期和监听器
// ============================================================================

// 监听队伍变化
watch(
  () => currentTeam.value,
  (newTeam) => {
    if (newTeam) {
      calculateCoverage(newTeam)
    }
  },
  { immediate: true }
)

// 监听过滤器变化，清除缓存tooltip
watch(selectedMoveFilter, () => {
  // 触发tooltip重新计算
  nextTick(() => {
    // 可以在这里添加tooltip刷新逻辑
  })
})

// SEO优化
useSeoMeta({
  title: computed(() => t('coverage.meta.title')),
  description: computed(() => {
    if (currentTeam.value?.name) {
      return t('coverage.meta.description', {
        name: currentTeam.value.name,
        count: currentTeam.value.teamData?.length || 0
      })
    }
    return t('coverage.meta.defaultDescription')
  })
})

// 清理资源
onUnmounted(() => {
  if (analyzer?.clearCache) {
    analyzer.clearCache()
  }
})
</script>

<template>
  <TeamDetailLayout :team-id="teamId" :active-tab="activeTab" :show-edit-button="false"
    @tab-change="activeTab = $event">

    <template #tabs="{ activeTab: currentTab, handleTabChange }">
      <TabNavigation :tabs="tabs" :active-tab="currentTab" :team-id="teamId" @change="handleTabChange" />
    </template>

    <template #default="{ team, translateName, useTranslation }">
      <!-- 设置当前队伍 -->
      <div v-show="false">{{ setCurrentTeam(team) }}</div>

      <div v-show="activeTab === 'coverage'" role="tabpanel" :aria-labelledby="`tab-coverage`" class="space-y-8">

        <!-- 页面标题 -->
        <header>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('coverage.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 text-lg">
            {{ t('coverage.description') }}
          </p>
        </header>

        <!-- 错误状态 -->
        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <!-- 验证错误 -->
        <div v-else-if="team.errors && team.errors.length > 0"
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
                {{ t('coverage.validationError.description') }}
              </h3>
            </div>
          </div>
        </div>

        <!-- 主要内容 -->
        <div v-else class="space-y-6">

          <!-- 加载状态 -->
          <div v-if="loading" class="text-center py-12">
            <LoadingSpinner />
            <p class="text-gray-500 dark:text-gray-400 mt-4">
              {{ t('coverage.calculating') }}
            </p>
          </div>

          <!-- 覆盖分析结果 -->
          <div v-else-if="coverageResult" class="space-y-6">

            <!-- 子标签导航 -->
            <div class="border-b border-gray-200 dark:border-gray-700">
              <nav class="-mb-px flex space-x-8">
                <button @click="activeCoverageTab = 'popularPokemon'" :class="[
                  'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeCoverageTab === 'popularPokemon'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                ]">
                  {{ t('coverage.tabs.popularPokemon') }}
                </button>
                <button @click="activeCoverageTab = 'typeHeatmap'" :class="[
                  'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeCoverageTab === 'typeHeatmap'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                ]">
                  {{ t('coverage.tabs.typeHeatmap') }}
                </button>
              </nav>
            </div>

            <!-- 热门宝可梦分析 -->
            <div v-show="activeCoverageTab === 'popularPokemon'" class="space-y-4">
              <header>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ t('coverage.popularPokemon.title') }}
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  {{ t('coverage.popularPokemon.description') }}
                </p>
              </header>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {{ t('coverage.popularPokemon.pokemon') }}
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {{ t('coverage.popularPokemon.types') }}
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {{ t('coverage.popularPokemon.bestMove') }}
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {{ t('coverage.popularPokemon.coverage') }}
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {{ t('coverage.popularPokemon.damage') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="pokemon in sortedPopularPokemonCoverage" :key="pokemon.pokemon"
                      class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <img :src="getSprite(pokemon as any, 'default')" :alt="translateName(pokemon.pokemon)"
                            class="h-10 w-10 rounded-full mr-3" loading="lazy" />
                          <div class="text-sm font-medium text-gray-900 dark:text-white">
                            {{ translateName(pokemon.pokemon) }}
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex space-x-1">
                          <span v-for="type in pokemon.types" :key="type" :class="getTypeBadgeClass(type)"
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                            <i :class="getTypeIconClass(type)" class="mr-1"></i>
                            {{ translateName(type, 'type') }}
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div v-if="pokemon.bestMoves.overall.length > 0" class="text-sm text-gray-900 dark:text-white">
                          <div v-for="move in pokemon.bestMoves.overall.slice(0, 2)" :key="move.name"
                            :title="getMoveDetailsText(move)" class="cursor-help hover:text-blue-600 transition-colors">
                            {{ translateName(move.name, 'move') }}
                            <span class="text-xs text-gray-500 ml-1">
                              ({{ getEffectivenessText(move.effectiveness) }})
                            </span>
                          </div>
                        </div>
                        <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                          {{ t('coverage.popularPokemon.noMoves') }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="getCoverageLevelClass(pokemon.coverageLevel)"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
                          {{ getCoverageLevelText(pokemon.coverageLevel) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ pokemon.overallScore.toFixed(1) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 类型热图分析 -->
            <div v-show="activeCoverageTab === 'typeHeatmap'" class="space-y-4">
              <header class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ t('coverage.typeHeatmap.title') }}
                  </h2>
                  <p class="text-gray-600 dark:text-gray-400 mt-1">
                    {{ t('coverage.typeHeatmap.description') }}
                  </p>
                </div>

                <!-- 过滤器 -->
                <div class="flex items-center space-x-2">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('coverage.typeHeatmap.filters.category') }}:
                  </label>
                  <select v-model="selectedMoveFilter"
                    class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors">
                    <option value="all">{{ t('coverage.typeHeatmap.filters.all') }}</option>
                    <option value="physical">{{ t('coverage.typeHeatmap.filters.physical') }}</option>
                    <option value="special">{{ t('coverage.typeHeatmap.filters.special') }}</option>
                  </select>
                </div>
              </header>

              <!-- 图例 -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {{ t('coverage.typeHeatmap.legend.title') }}
                </h3>
                <div class="flex flex-wrap gap-4">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-green-200 border border-green-300 rounded mr-2"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ t('coverage.typeHeatmap.legend.effective') }}
                    </span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ t('coverage.typeHeatmap.legend.neutral') }}
                    </span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ t('coverage.typeHeatmap.legend.resistant') }}
                    </span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-gray-300 border border-gray-400 rounded mr-2"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ t('coverage.typeHeatmap.legend.immune') }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 类型组合矩阵 -->
              <div class="overflow-x-auto">
                <table class="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr>
                      <th
                        class="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      </th>
                      <th v-for="type2 in allTypes" :key="type2"
                        class="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs font-medium text-gray-500 dark:text-gray-400 min-w-12">
                        <div class="transform -rotate-45 origin-center">
                          {{ translateName(type2, 'type') }}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="type1 in allTypes" :key="type1">
                      <th
                        class="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {{ translateName(type1, 'type') }}
                      </th>
                      <td v-for="type2 in allTypes" :key="`${type1}-${type2}`"
                        class="border border-gray-200 dark:border-gray-700 p-1 text-center relative group transition-all hover:scale-105"
                        :class="[
                          isLowerTriangle(type1, type2) ?
                            'bg-gray-50 dark:bg-gray-800' :
                            getTypeCombinationUnit(type1, type2) ?
                              getCoverageLevelClassWithIntensity(
                                (selectedMoveFilter === 'physical' ? getTypeCombinationUnit(type1, type2)?.levelPhysical :
                                  selectedMoveFilter === 'special' ? getTypeCombinationUnit(type1, type2)?.levelSpecial :
                                    getTypeCombinationUnit(type1, type2)?.level) || 'Neutral',
                                (selectedMoveFilter === 'physical' ? getTypeCombinationUnit(type1, type2)?.scorePhysical :
                                  selectedMoveFilter === 'special' ? getTypeCombinationUnit(type1, type2)?.scoreSpecial :
                                    getTypeCombinationUnit(type1, type2)?.score) || 0
                              ) + ' cursor-pointer' :
                              'bg-gray-100 dark:bg-gray-700 cursor-pointer',
                          !isLowerTriangle(type1, type2) && getTypeCombinationUnit(type1, type2)?.isPopular ? 'ring-2 ring-blue-500' : ''
                        ]" :title="isLowerTriangle(type1, type2) ? '' : getTypeCombinationTooltip(type1, type2)">
                        <div class="w-8 h-8 flex items-center justify-center text-xs font-medium">
                          {{ isLowerTriangle(type1, type2) ?
                            '—' :
                            getTypeCombinationUnit(type1, type2) ?
                              (selectedMoveFilter === 'physical' ? getTypeCombinationUnit(type1, type2)?.scorePhysical :
                                selectedMoveFilter === 'special' ? getTypeCombinationUnit(type1, type2)?.scoreSpecial :
                                  getTypeCombinationUnit(type1, type2)?.score)?.toFixed(0) || '0' :
                              '—' }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 无数据状态 -->
          <div v-else class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400">
              {{ t('coverage.noData') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </TeamDetailLayout>
</template>
