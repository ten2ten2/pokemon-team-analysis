<template>
  <div>
    <h5 class="category-title mb-3">
      {{ categoryTitle }}
    </h5>
    <div class="space-y-3">
      <!-- 效果拔群 -->
      <EffectivenessSection :moves="effectiveMoves" :title="t('coverage.effectiveness.effective')"
        title-class="effectiveness-effective-title" effectiveness-color="effectiveness-effective"
        background-color="effectiveness-effective-bg" :get-move-display-info="getMoveDisplayInfo" />

      <!-- 一般效果 -->
      <EffectivenessSection :moves="neutralMoves" :title="t('coverage.effectiveness.neutral')"
        title-class="effectiveness-neutral-title" effectiveness-color="effectiveness-neutral"
        background-color="effectiveness-neutral-bg" :get-move-display-info="getMoveDisplayInfo" />

      <!-- 效果不佳 -->
      <EffectivenessSection :moves="resistantMoves" :title="t('coverage.effectiveness.resistant')"
        title-class="effectiveness-resistant-title" effectiveness-color="effectiveness-resistant"
        background-color="effectiveness-resistant-bg" :get-move-display-info="getMoveDisplayInfo" />

      <!-- 无效果 -->
      <EffectivenessSection :moves="immuneMoves" :title="t('coverage.effectiveness.immune')"
        title-class="effectiveness-immune-title" effectiveness-color="effectiveness-immune"
        background-color="effectiveness-immune-bg" :get-move-display-info="getMoveDisplayInfo" />
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
