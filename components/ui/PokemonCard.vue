<script setup lang="ts">
import type { Pokemon } from '~/lib/core/types'
import { getSprite } from '~/utils/teamUtils'
import { getTypeBadgeClass, getTypeChipClass, getTypeIconClass, getMoveCategoryIconClass } from '~/utils/pokemonTypeUtils'

interface Props {
  pokemon: Pokemon
  translateName: (name: string, type?: 'species' | 'ability' | 'move' | 'item' | 'type') => string
  showMoves?: boolean
  spriteVariant?: 'official-artwork' | 'official-artwork-shiny' | 'default' | 'default-shiny'
}

const props = withDefaults(defineProps<Props>(), {
  showMoves: true,
  spriteVariant: 'official-artwork'
})

const { t } = useI18n()

const spriteUrl = computed(() => {
  if (props.pokemon.shiny) {
    return props.spriteVariant.includes('shiny')
      ? getSprite(props.pokemon, props.spriteVariant)
      : getSprite(props.pokemon, `${props.spriteVariant}-shiny` as any)
  }
  return getSprite(props.pokemon, props.spriteVariant.replace('-shiny', '') as any)
})
</script>

<template>
  <article
    class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
    <!-- 宝可梦基本信息 -->
    <header class="flex items-center gap-4 mb-4">
      <div class="relative">
        <NuxtImg :src="spriteUrl" :alt="translateName(pokemon.species, 'species')"
          :title="translateName(pokemon.species, 'species')" class="w-16 h-16 object-contain" height="64" width="64"
          loading="lazy" />
        <span v-if="pokemon.shiny" class="absolute -top-1 -right-1" title="异色" aria-label="异色">
          <Sparkles class="w-4 h-4 text-yellow-400" aria-hidden="true" />
        </span>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {{ translateName(pokemon.species, 'species') }}
        </h3>
        <div class="flex flex-wrap gap-1 mt-1">
          <span v-for="type in pokemon.types" :key="type" :class="getTypeBadgeClass(type)">
            <i :class="getTypeIconClass(type)" aria-hidden="true"></i>
            {{ translateName(type, 'type') }}
          </span>
        </div>
      </div>
    </header>

    <!-- 宝可梦详细信息 -->
    <div class="space-y-3 text-sm">
      <div v-if="pokemon.ability" class="flex items-center gap-2">
        <span class="font-medium text-gray-700 dark:text-gray-300 min-w-0 flex-shrink-0">
          {{ t('teamDetail.pokemon.ability') }}:
        </span>
        <span class="text-gray-600 dark:text-gray-400 break-words">
          {{ translateName(pokemon.ability, 'ability') }}
        </span>
      </div>

      <div v-if="pokemon.item" class="flex items-center gap-2">
        <span class="font-medium text-gray-700 dark:text-gray-300 min-w-0 flex-shrink-0">
          {{ t('teamDetail.pokemon.item') }}:
        </span>
        <span class="text-gray-600 dark:text-gray-400 break-words">
          {{ translateName(pokemon.item, 'item') }}
        </span>
      </div>

      <div v-if="pokemon.teraType" class="flex items-center gap-2">
        <span class="font-medium text-gray-700 dark:text-gray-300 min-w-0 flex-shrink-0">
          {{ t('teamDetail.pokemon.teraType') }}:
        </span>
        <span :class="getTypeBadgeClass(pokemon.teraType)">
          <i :class="getTypeIconClass(pokemon.teraType)" aria-hidden="true"></i>
          {{ translateName(pokemon.teraType, 'type') }}
        </span>
      </div>

      <div v-if="showMoves && pokemon.moves && pokemon.moves.length > 0" class="flex items-start gap-2">
        <span class="font-medium text-gray-700 dark:text-gray-300 min-w-0 flex-shrink-0">
          {{ t('teamDetail.pokemon.moves') }}:
        </span>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap gap-1">
            <span v-for="move in pokemon.moves" :key="move" :class="getTypeChipClass(pokemon.movesDetails[move].type)">
              <i :class="getMoveCategoryIconClass(pokemon.movesDetails[move].category)" aria-hidden="true"></i>
              {{ translateName(move, 'move') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
