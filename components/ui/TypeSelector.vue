<template>
  <div>
    <h3 class="component-title mb-4">
      {{ title }}
    </h3>
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      <button v-for="type in types" :key="type" @click="handleTypeSelection(type)" :class="[
        'type-selector-btn',
        selectedTypes.includes(type)
          ? 'type-selector-btn-selected'
          : 'type-selector-btn-unselected'
      ]">
        <span :class="getTypeBadgeClass(type)" class="mb-1 flex-shrink-0">
          <i :class="getTypeIconClass(type)" aria-hidden="true"></i>
        </span>
        <span class="text-sm text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis px-1">
          {{ translateName(type, 'type') }}
        </span>
      </button>
    </div>
    <p v-if="helpText" class="text-muted-sm mt-3">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { getTypeBadgeClass, getTypeIconClass } from '~/utils/pokemonTypeUtils'

interface Props {
  types: string[]
  selectedTypes: string[]
  title: string
  helpText?: string
  maxSelection?: number
  translateName: (name: string, type?: 'species' | 'ability' | 'move' | 'item' | 'type') => string
}

interface Emits {
  (e: 'update:selectedTypes', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  maxSelection: 2,
})

const emit = defineEmits<Emits>()

const handleTypeSelection = (type: string) => {
  const newSelectedTypes = [...props.selectedTypes]
  const index = newSelectedTypes.indexOf(type)

  if (index > -1) {
    // 如果已选择，则取消选择
    newSelectedTypes.splice(index, 1)
  } else if (newSelectedTypes.length < props.maxSelection) {
    // 如果未选择且少于最大选择数，则添加
    newSelectedTypes.push(type)
  }

  emit('update:selectedTypes', newSelectedTypes)
}
</script>
