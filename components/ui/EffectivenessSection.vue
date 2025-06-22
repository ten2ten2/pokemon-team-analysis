<template>
  <div v-if="moves.length > 0">
    <h6 :class="titleClass" class="text-sm font-medium mb-2">
      {{ title }} ({{ moves.length }})
    </h6>
    <div class="space-y-1">
      <MoveDisplayItem v-for="move in moves" :key="`${move.pokemon.species}-${move.name}`" :move="move"
        :get-move-display-info="getMoveDisplayInfo" :effectiveness-color="effectivenessColor"
        :background-color="backgroundColor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MoveEffectivenessInfo } from '~/lib/analyzer/coverageAnalyzer'

interface Props {
  moves: MoveEffectivenessInfo[]
  title: string
  titleClass: string
  effectivenessColor: string
  backgroundColor: string
  getMoveDisplayInfo: (move: MoveEffectivenessInfo) => any
}

defineProps<Props>()
</script>
