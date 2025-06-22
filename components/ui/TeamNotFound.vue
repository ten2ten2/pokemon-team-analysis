<script setup lang="ts">
interface Props {
  teamId: string
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="text-center py-12">
    <header>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {{ t('teamDetail.notFound.title') }}
      </h1>
    </header>
    <main>
      <p class="text-muted mb-6">
        {{ t('teamDetail.notFound.description', { id: teamId }) }}
      </p>
      <NuxtLink to="/"
        class="btn-primary inline-flex items-center px-6 py-3 shadow-md hover:shadow-lg focus-ring-red transform hover:scale-105 active:scale-95">
        {{ t('teamDetail.notFound.backToHome') }}
      </NuxtLink>
    </main>
  </div>
</template>
