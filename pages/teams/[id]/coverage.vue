<script setup lang="ts">
import type { Team as TeamType } from '~/types/team'
import { getSprite } from '~/utils/teamUtils'
import { getTypeBadgeClass, getTypeIconClass } from '~/utils/pokemonTypeUtils'
import {
  CoverageAnalyzer,
  type CoverageAnalysisResult,
  type PokemonCoverage,
  type MoveEffectivenessInfo
} from '~/lib/analyzer/coverageAnalyzer'
import { usePokemonTranslations } from '~/composables/usePokemonTranslations'

const route = useRoute()
const { t } = useI18n()
const { getTranslatedName } = usePokemonTranslations()
const { preferences } = useUserPreferences()

const activeTab = ref('coverage')
const teamId = route.params.id as string

// 状态管理
const selectedTypes = ref<string[]>([])
const coverageResult = ref<CoverageAnalysisResult | null>(null)
const loading = ref(false)
const currentTeam = ref<TeamType | null>(null)

// 创建分析器实例
const analyzer = new CoverageAnalyzer()

// Tab 配置
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
  },
  {
    key: 'speed-tiers',
    label: t('teamDetail.tabs.speedTiers'),
    disabled: true
  },
  {
    key: 'strategy',
    label: t('teamDetail.tabs.strategy'),
    disabled: true
  }
])

// 获取所有属性类型
const allTypes = computed(() => analyzer.getAllTypesExceptStellar())

// 计算覆盖分析
const calculateCoverage = async (team: TeamType) => {
  if (!team?.teamData) return

  loading.value = true
  try {
    // 构建分析选项
    const options = selectedTypes.value.length > 0 ? {
      combination: {
        type1: selectedTypes.value[0] || '',
        type2: selectedTypes.value[1] || selectedTypes.value[0] || ''
      }
    } : undefined

    // 执行覆盖分析
    coverageResult.value = analyzer.analyze(team.teamData, options)
  } catch (error) {
    console.error('覆盖分析失败:', error)
    coverageResult.value = null
  } finally {
    loading.value = false
  }
}

// 监听属性选择变化
watch(selectedTypes, () => {
  if (currentTeam.value) {
    calculateCoverage(currentTeam.value)
  }
}, { deep: true })



// 获取倍率的显示文本
const getEffectivenessText = (effectiveness: number) => {
  if (effectiveness === 0) return t('coverage.effectiveness.immune')
  if (effectiveness === 0.25) return '×0.25'
  if (effectiveness === 0.5) return '×0.5'
  if (effectiveness === 1) return '×1'
  if (effectiveness === 2) return '×2'
  if (effectiveness === 4) return '×4'
  return `${effectiveness}×`
}

// 获取招式的显示信息
const getMoveDisplayInfo = (move: MoveEffectivenessInfo, translateFn: (name: string, type?: 'species' | 'ability' | 'move' | 'item' | 'type') => string) => {
  return {
    name: translateFn(move.name, 'move'),
    pokemon: translateFn(move.pokemon.species, 'species'),
    type: translateFn(move.type, 'type'),
    power: move.basePower || '—',
    effectiveness: getEffectivenessText(move.effectiveness),
    hasSTAB: move.hasSTAB
  }
}

// 检查宝可梦是否有效果拔群的招式
const hasEffectiveMoves = (pokemon: PokemonCoverage): boolean => {
  return pokemon.bestMoves.overall.some(move => move.effectiveness > 1)
}
</script>

<template>
  <TeamDetailLayout :team-id="teamId" :active-tab="activeTab" :show-edit-button="true" @tab-change="activeTab = $event">
    <template #tabs="{ activeTab: currentTab, handleTabChange }">
      <TabNavigation :tabs="tabs" :active-tab="currentTab" :team-id="teamId" @change="handleTabChange" />
    </template>

    <template #default="{ team, translateName }">
      <div v-show="activeTab === 'coverage'" role="tabpanel" :aria-labelledby="`tab-coverage`" class="space-y-8">
        <ClientOnly>
          <div v-if="team.teamData && team.teamData.length > 0"
            @vue:mounted="currentTeam = team, calculateCoverage(team)">

            <!-- 属性组合分析 -->
            <section class="mb-8">
              <header class="mb-6">
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ t('coverage.typeCombination.title') }}
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  {{ t('coverage.typeCombination.description') }}
                </p>
              </header>

              <!-- 属性组合分析 - 左右布局 -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <!-- 左侧：属性选择器 -->
                <div class="lg:col-span-5">
                  <TypeSelector :types="allTypes" v-model:selected-types="selectedTypes"
                    :title="t('coverage.typeCombination.selectTypes')"
                    :help-text="t('coverage.typeCombination.selectUpToTwo')" :translate-name="translateName"
                    :max-selection="2" />
                </div>

                <!-- 右侧：分析结果 -->
                <div class="lg:col-span-7">
                  <!-- 属性组合分析结果 -->
                  <div v-if="coverageResult?.combinationCoverage && selectedTypes.length > 0" class="space-y-6">
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        <span class="mr-2">{{ t('coverage.typeCombination.analysisFor') }}</span>
                        <span v-for="(type, index) in selectedTypes" :key="type">
                          <span v-if="index > 0" class="align-top"> + </span>
                          <span :class="getTypeBadgeClass(type)" class="flex-shrink-0 align-top">
                            <i :class="getTypeIconClass(type)" aria-hidden="true"></i>
                            {{ translateName(type, 'type') }}
                          </span>
                        </span>
                      </h4>

                      <!-- 物理/特殊招式分类 -->
                      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- 物理招式 -->
                        <MoveCategory :category-title="t('coverage.categories.physical')"
                          :effective-moves="coverageResult.combinationCoverage.effectiveMovesPhysical"
                          :neutral-moves="coverageResult.combinationCoverage.neutralMovesPhysical"
                          :resistant-moves="coverageResult.combinationCoverage.resistantMovesPhysical"
                          :immune-moves="coverageResult.combinationCoverage.immuneMovesPhysical"
                          :get-move-display-info="(move) => getMoveDisplayInfo(move, translateName)" />

                        <!-- 特殊招式 -->
                        <MoveCategory :category-title="t('coverage.categories.special')"
                          :effective-moves="coverageResult.combinationCoverage.effectiveMovesSpecial"
                          :neutral-moves="coverageResult.combinationCoverage.neutralMovesSpecial"
                          :resistant-moves="coverageResult.combinationCoverage.resistantMovesSpecial"
                          :immune-moves="coverageResult.combinationCoverage.immuneMovesSpecial"
                          :get-move-display-info="(move) => getMoveDisplayInfo(move, translateName)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- 热门宝可梦分析 -->
            <section>
              <header class="mb-6">
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ t('coverage.popularPokemon.title') }}
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  {{ t('coverage.popularPokemon.description') }}
                </p>
              </header>

              <div v-if="coverageResult?.popularPokemonCoverage"
                class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="pokemon in coverageResult.popularPokemonCoverage" :key="pokemon.pokemon.name"
                  class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <!-- 宝可梦信息 -->
                  <div class="flex items-center space-x-3 mb-4">
                    <img :src="getSprite(pokemon, 'official-artwork')" :alt="pokemon.pokemon.name"
                      class="w-12 h-12 object-contain" loading="lazy" />
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ translateName(pokemon.pokemon.name, 'species') }}
                      </h3>
                      <div class="flex space-x-1">
                        <span v-for="type in pokemon.pokemon.types" :key="type" :class="getTypeBadgeClass(type)"
                          class="inline-flex items-center px-2 py-1 rounded text-xs font-medium">
                          <i :class="getTypeIconClass(type)" aria-hidden="true"></i>
                          {{ translateName(type, 'type') }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 最佳招式 -->
                  <div class="space-y-3">
                    <div v-if="hasEffectiveMoves(pokemon)" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div class="flex items-center space-x-2 mb-2">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span class="text-sm font-medium text-green-700 dark:text-green-400">
                          {{ t('coverage.popularPokemon.hasEffectiveMoves') }}
                        </span>
                      </div>
                      <div v-if="pokemon.bestMoves.overall.length > 0" class="space-y-1">
                        <MoveDisplayItem v-for="move in pokemon.bestMoves.overall.slice(0, 2)"
                          :key="`${move.pokemon.species}-${move.name}`" :move="move"
                          :get-move-display-info="(move) => getMoveDisplayInfo(move, translateName)"
                          effectiveness-color="text-green-600 dark:text-green-400" background-color="bg-transparent" />
                      </div>
                    </div>

                    <div v-else class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span class="text-sm font-medium text-red-700 dark:text-red-400">
                          {{ t('coverage.popularPokemon.noEffectiveMoves') }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="flex justify-center items-center py-12">
            <LoadingSpinner :message="t('coverage.loading')" />
          </div>

          <!-- 服务端渲染时的占位符 -->
          <template #fallback>
            <LoadingSpinner :message="t('common.loading.default')" />
          </template>
        </ClientOnly>
      </div>
    </template>
  </TeamDetailLayout>
</template>
