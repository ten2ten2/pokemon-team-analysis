<template>
  <div>
    <h5 class="text-md font-medium text-gray-900 dark:text-white mb-3">
      {{ categoryTitle }}
    </h5>
    <div class="space-y-3">
      <!-- 效果拔群 -->
      <EffectivenessSection :moves="effectiveMoves" :title="t('coverage.effectiveness.effective')"
        title-class="text-green-700 dark:text-green-400" effectiveness-color="text-green-600 dark:text-green-400"
        background-color="bg-green-50 dark:bg-green-900/20" :get-move-display-info="getMoveDisplayInfo" />

      <!-- 一般效果 -->
      <EffectivenessSection :moves="neutralMoves" :title="t('coverage.effectiveness.neutral')"
        title-class="text-gray-700 dark:text-gray-400" effectiveness-color="text-gray-600 dark:text-gray-400"
        background-color="bg-gray-50 dark:bg-gray-800/50" :get-move-display-info="getMoveDisplayInfo" />

      <!-- 效果不佳 -->
      <EffectivenessSection :moves="resistantMoves" :title="t('coverage.effectiveness.resistant')"
        title-class="text-red-700 dark:text-red-400" effectiveness-color="text-red-600 dark:text-red-400"
        background-color="bg-red-50 dark:bg-red-900/20" :get-move-display-info="getMoveDisplayInfo" />

      <!-- 无效果 -->
      <EffectivenessSection :moves="immuneMoves" :title="t('coverage.effectiveness.immune')"
        title-class="text-gray-700 dark:text-gray-400" effectiveness-color="text-gray-600 dark:text-gray-400"
        background-color="bg-gray-100 dark:bg-gray-800" :get-move-display-info="getMoveDisplayInfo" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MoveEffectivenessInfo } from '~/lib/analyzer/coverageAnalyzer'

interface Props {
  categoryTitle: string
  effectiveMoves: MoveEffectivenessInfo[]
  neutralMoves: MoveEffectivenessInfo[]
  resistantMoves: MoveEffectivenessInfo[]
  immuneMoves: MoveEffectivenessInfo[]
  getMoveDisplayInfo: (move: MoveEffectivenessInfo) => any
}

defineProps<Props>()

const { t } = useI18n()
</script>
