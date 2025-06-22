<script setup lang="ts">
import type { MoveEffectivenessInfo } from '~/lib/analyzer/coverageAnalyzer'

interface Props {
  move: MoveEffectivenessInfo
  effectivenessColor?: string
  backgroundColor?: string
  getMoveDisplayInfo: (move: MoveEffectivenessInfo) => {
    name: string
    pokemon: string
    type: string
    power: string | number
    effectiveness: string
    hasSTAB: boolean
  }
}

const props = withDefaults(defineProps<Props>(), {
  effectivenessColor: 'text-gray-600 dark:text-gray-400',
  backgroundColor: 'bg-gray-50 dark:bg-gray-800/50'
})

const { t } = useI18n()
</script>

<template>
  <div :class="`text-sm ${backgroundColor} p-2 rounded`">
    <div class="flex justify-between items-center">
      <span class="font-medium text-base truncate">
        {{ getMoveDisplayInfo(move).name }} •
        {{ getMoveDisplayInfo(move).pokemon }}
      </span>
      <span :class="effectivenessColor" class="text-base">
        {{ getMoveDisplayInfo(move).effectiveness }}
      </span>
    </div>
    <div class="text-gray-600 dark:text-gray-400 text-sm">
      <span>
        {{ getMoveDisplayInfo(move).type }} •
        {{ t('coverage.moveDetails.power') }}: {{ getMoveDisplayInfo(move).power }}
      </span>
      <span v-if="getMoveDisplayInfo(move).hasSTAB" class="font-medium">×1.5 (STAB)</span>
    </div>
  </div>
</template>
