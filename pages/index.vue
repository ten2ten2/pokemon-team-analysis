<script setup lang="ts">
import { useSeoLinks } from '~/composables/useSeoLinks'
import { useCustomSeoMeta } from '~/composables/useSeoMeta'
import { useStructuredData } from '~/composables/useStructuredData'

const { t, localeProperties } = useI18n()
const route = useRoute()
const pageName = 'home'

useSeoLinks()
useCustomSeoMeta({ page: pageName })
useStructuredData({ page: pageName })
</script>

<template>
  <PageContainer>
    <!-- Page Header -->
    <template #header>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ t('home.meta.title') }}
      </h1>
    </template>
    <template #headerContent>
      <p class="text-base text-gray-600 dark:text-gray-400">
        {{ t('home.meta.description') }}
      </p>
    </template>

    <ContentCard>
      <div class="prose prose-gray dark:prose-invert max-w-none prose-scroll-margin">
        <p class="text-body">
          Test Locale: {{ localeProperties.iso }}
        </p>
        <p class="text-body">
          Test Route: {{ route.fullPath }}
        </p>
        <p class="text-body">
          Test External Link: <NuxtLink to="https://www.github.com" target="_blank">GitHub</NuxtLink>
        </p>
        <p class="text-body">
          Test Internal Link: <NuxtLinkLocale to="/privacy-and-terms">Privacy and Terms</NuxtLinkLocale>
        </p>
      </div>
    </ContentCard>
  </PageContainer>
</template>
