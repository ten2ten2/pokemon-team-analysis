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

const activeTab = ref('coverage')
const teamId = route.params.id as string

// 状态管理
const selectedTypes = ref<string[]>([])
const coverageResult = ref<CoverageAnalysisResult | null>(null)
const loading = ref(false)
const currentTeam = ref<TeamType | null>(null)
const pokemonMoveCategories = ref<Record<string, 'all' | 'physical' | 'special'>>({})

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
  if (effectiveness === 0) return '×0'
  if (effectiveness === 0.25) return '×0.25'
  if (effectiveness === 0.5) return '×0.5'
  if (effectiveness === 1) return '×1'
  if (effectiveness === 2) return '×2'
  if (effectiveness === 4) return '×4'
  return `×${effectiveness}`
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

// 根据效果倍率获取招式颜色
const getMoveEffectivenessColor = (effectiveness: number): string => {
  if (effectiveness > 1) return 'effectiveness-effective'
  if (effectiveness === 1) return 'effectiveness-neutral'
  if (effectiveness > 0) return 'effectiveness-resistant'
  return 'effectiveness-immune'
}

// 根据效果倍率获取招式背景色
const getMoveEffectivenessBackground = (effectiveness: number): string => {
  if (effectiveness > 1) return 'effectiveness-effective-bg'
  if (effectiveness === 1) return 'effectiveness-neutral-bg'
  if (effectiveness > 0) return 'effectiveness-resistant-bg'
  return 'effectiveness-immune-bg'
}

// 获取指定类别的招式
const getPokemonMoves = (pokemon: PokemonCoverage, category: 'all' | 'physical' | 'special') => {
  switch (category) {
    case 'physical':
      return pokemon.bestMoves.physical
    case 'special':
      return pokemon.bestMoves.special
    case 'all':
    default:
      return pokemon.bestMoves.overall
  }
}

// 设置宝可梦的招式类别
const setPokemonMoveCategory = (pokemonName: string, category: 'all' | 'physical' | 'special') => {
  pokemonMoveCategories.value[pokemonName] = category
}

// 获取宝可梦的招式类别
const getPokemonMoveCategory = (pokemonName: string): 'all' | 'physical' | 'special' => {
  return pokemonMoveCategories.value[pokemonName] || 'all'
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
                <h2 class="section-title">
                  {{ t('coverage.typeCombination.title') }}
                </h2>
                <p class="section-description">
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
                    <div class="card card-large-padding">
                      <h4 class="subsection-title mb-4">
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
                <h2 class="section-title">
                  {{ t('coverage.popularPokemon.title') }}
                </h2>
                <p class="section-description">
                  {{ t('coverage.popularPokemon.description') }}
                </p>
              </header>

              <div v-if="coverageResult?.popularPokemonCoverage"
                class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="pokemon in coverageResult.popularPokemonCoverage" :key="pokemon.pokemon.name"
                  class="card card-padding">
                  <!-- 宝可梦信息 -->
                  <div class="flex items-center space-x-3 mb-4">
                    <img :src="getSprite(pokemon, 'official-artwork')" :alt="pokemon.pokemon.name"
                      class="w-12 h-12 object-contain" loading="lazy" />
                    <div class="flex-1">
                      <h3 class="subsection-title">
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

                  <!-- 招式类别选择器 -->
                  <div class="flex space-x-1 mb-3">
                    <button v-for="category in [
                      { key: 'all', label: t('coverage.categories.all') },
                      { key: 'physical', label: t('coverage.categories.physical') },
                      { key: 'special', label: t('coverage.categories.special') }
                    ]" :key="category.key"
                      @click="setPokemonMoveCategory(pokemon.pokemon.name, category.key as 'all' | 'physical' | 'special')"
                      :class="[
                        getPokemonMoveCategory(pokemon.pokemon.name) === category.key
                          ? 'btn-small-active'
                          : 'btn-small-inactive'
                      ]">
                      {{ category.label }}
                    </button>
                  </div>

                  <!-- 最佳招式 -->
                  <div
                    v-if="getPokemonMoves(pokemon, getPokemonMoveCategory(pokemon.pokemon.name) as 'all' | 'physical' | 'special').length > 0"
                    class="space-y-1">
                    <MoveDisplayItem
                      v-for="move in getPokemonMoves(pokemon, getPokemonMoveCategory(pokemon.pokemon.name) as 'all' | 'physical' | 'special').slice(0, 3)"
                      :key="`${move.pokemon.species}-${move.name}-${getPokemonMoveCategory(pokemon.pokemon.name)}`"
                      :move="move" :get-move-display-info="(move) => getMoveDisplayInfo(move, translateName)"
                      :effectiveness-color="getMoveEffectivenessColor(move.effectiveness)"
                      :background-color="getMoveEffectivenessBackground(move.effectiveness)" />
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
