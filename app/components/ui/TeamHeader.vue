<script setup lang="ts">
import type { Team } from '~/types/team'
import { formatDate } from '~/utils/formatDate'

interface Props {
  team: Team
  useTranslation: boolean
  getGameVersionLabel: (version: string) => string
  getRulesLabel: (rules: string) => string
}

interface Emits {
  (e: 'update:useTranslation', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t, locale } = useI18n()

const handleTranslationToggle = () => {
  emit('update:useTranslation', !props.useTranslation)
}
</script>

<template>
  <header class="mb-8">
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ team.name }}
        </h1>
        <div class="flex flex-wrap items-center gap-4 text-muted-sm">
          <span class="inline-flex items-center gap-1">
            <span class="font-medium">{{ t('common.gameVersion.title') }}:</span>
            {{ getGameVersionLabel(team.gameVersion) }}
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="font-medium">{{ t('common.rules.title') }}:</span>
            {{ getRulesLabel(team.rules) }}
          </span>
          <ClientOnly>
            <time :datetime="team.createdAt.toISOString()" class="inline-flex items-center gap-1">
              <span class="font-medium">{{ t('teamDetail.createdAt') }}:</span>
              {{ formatDate(team.createdAt.toISOString(), locale) }}
            </time>
            <template #fallback>
              <time :datetime="team.createdAt.toISOString()" class="inline-flex items-center gap-1">
                <span class="font-medium">{{ t('teamDetail.createdAt') }}:</span>
                {{ team.createdAt.toLocaleDateString() }}
              </time>
            </template>
          </ClientOnly>
        </div>
      </div>

      <!-- 翻译开关 (仅非英文语言且团队无错误时显示) -->
      <ClientOnly>
        <div v-if="locale !== 'en' && (!team.errors || team.errors.length === 0)" class="flex items-center gap-3">
          <label for="translation-toggle" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('teamDetail.useTranslation') }}
          </label>
          <button id="translation-toggle" type="button" :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-ring-red',
            useTranslation ? 'bg-red-400 hover:bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
          ]" role="switch" :aria-checked="useTranslation" @click="handleTranslationToggle">
            <span :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              useTranslation ? 'translate-x-5' : 'translate-x-0'
            ]" aria-hidden="true" />
          </button>
        </div>
      </ClientOnly>
    </div>

    <!-- Tab 导航 -->
    <nav class="border-b border-gray-200 dark:border-gray-700" role="tablist">
      <div class="-mb-px flex space-x-8">
        <slot name="tabs" />
      </div>
    </nav>
  </header>
</template>
