<script setup lang="ts">
interface Props {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  size: 'md'
})

const { t } = useI18n()

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16'
}

const displayMessage = computed(() => props.message || t('common.loading.default'))
</script>

<template>
  <div class="text-center py-12" role="status" aria-live="polite">
    <div :class="[
      'animate-spin rounded-full border-b-2 border-red-400 mx-auto mb-4',
      sizeClasses[size]
    ]" aria-hidden="true" />
    <p class="text-gray-600 dark:text-gray-400">{{ displayMessage }}</p>
  </div>
</template>
