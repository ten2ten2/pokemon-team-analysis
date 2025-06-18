<script setup lang="ts">
interface Props {
  errors: string[]
  showEditButton?: boolean
  editButtonText?: string
  description?: string
}

interface Emits {
  (e: 'edit'): void
}

const props = withDefaults(defineProps<Props>(), {
  showEditButton: false,
  editButtonText: '',
  description: ''
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

const displayEditButtonText = computed(() =>
  props.editButtonText || t('teamDetail.editTeam')
)

const displayDescription = computed(() =>
  props.description || t('teamDetail.validationErrors.description')
)
</script>

<template>
  <section
    class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
    <header class="flex items-start justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
          {{ t('teamDetail.validationErrors.title') }}
        </h2>
        <p class="text-sm text-yellow-700 dark:text-yellow-300">
          {{ displayDescription }}
        </p>
      </div>
      <button v-if="showEditButton" type="button" @click="emit('edit')"
        class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800/50 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800/70 transition-colors focus-ring-red">
        <Edit2 class="w-4 h-4" aria-hidden="true" />
        {{ displayEditButtonText }}
      </button>
    </header>
    <ul class="space-y-2">
      <li v-for="(error, index) in errors" :key="index"
        class="flex items-start gap-2 text-yellow-700 dark:text-yellow-300">
        <AlertCircle class="w-4 h-4 mt-1 flex-shrink-0" aria-hidden="true" />
        <span>{{ error }}</span>
      </li>
    </ul>
  </section>
</template>
