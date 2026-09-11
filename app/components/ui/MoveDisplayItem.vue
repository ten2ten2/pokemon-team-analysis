<script setup lang="ts">
import type { MoveEffectivenessInfo, MoveDisplayInfo } from '~/lib/analyzer/coverageAnalyzer'

interface Props {
  move: MoveEffectivenessInfo
  effectivenessColor?: string
  backgroundColor?: string
  getMoveDisplayInfo: (move: MoveEffectivenessInfo) => MoveDisplayInfo
}

const props = withDefaults(defineProps<Props>(), {
  effectivenessColor: 'text-muted',
  backgroundColor: 'bg-gray-50 dark:bg-gray-800/50'
})

const { t } = useI18n()
const display = computed(() => props.getMoveDisplayInfo(props.move))
</script>

<template>
  <div :class="`move-item ${backgroundColor}`">
    <div class="flex justify-between items-center">
      <span class="move-item-text">
        {{ display.name }} •
        {{ display.pokemon }}
      </span>
      <span :class="effectivenessColor" class="text-base">
        {{ display.effectiveness }}
      </span>
    </div>
    <div class="move-item-details">
      <span>
        {{ display.type }} •
        {{ t('coverage.moveDetails.power') }}: {{ display.power }}
      </span>
      <span v-if="display.hasSTAB" class="font-medium">×1.5 (STAB)</span>
    </div>
  </div>
</template>
