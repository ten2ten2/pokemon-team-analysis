<script setup lang="ts">
import { formatDate } from '~/utils/formatDate'

// Page metadata
definePageMeta({
  layout: 'default'
})

// Composables
const { t, locale, rt, tm } = useI18n()
const config = useRuntimeConfig()

// Use existing SEO composables instead of manual implementation
useCustomSeoMeta({ page: 'privacyAndTerms' })
useSeoLinks()
useStructuredData({ page: 'privacyAndTerms' })

// Contact email (you can replace this with your actual contact email)
const contactEmail = computed(() => {
  return config.public.email
})

// Date formatting function using locale-aware utility - use computed for reactivity
const lastUpdatedDate = computed(() => {
  return formatDate(t('privacyAndTerms.lastUpdatedDate'), locale.value)
})

const breadcrumbItems = computed(() => {
  return [
    { label: t('privacyAndTerms.title'), isCurrentPage: true }
  ]
})
</script>

<template>
  <PageContainer :show-breadcrumb="true" :breadcrumb-items="breadcrumbItems">
    <!-- Page Header -->
    <template #header>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ t('privacyAndTerms.title') }}
      </h1>
    </template>
    <template #headerContent>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('privacyAndTerms.lastUpdated', { date: lastUpdatedDate }) }}
      </p>
    </template>

    <!-- Privacy Policy Section -->
    <ContentCard id="privacy-policy" :title="t('privacyAndTerms.privacyPolicy.title')">
      <div class="prose prose-gray dark:prose-invert max-w-none prose-scroll-margin">
        <!-- Introduction -->
        <div class="mb-8">
          <p class="text-body">
            {{ t('privacyAndTerms.privacyPolicy.introduction') }}
          </p>
        </div>

        <!-- Information Collection -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.privacyPolicy.informationCollection.title') }}
          </h3>
          <ul v-for="item in tm('privacyAndTerms.privacyPolicy.informationCollection.content') as string[]" :key="item">
            <li class="text-body">
              - {{ rt(item) }}
            </li>
          </ul>
        </article>

        <!-- Information Use -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.privacyPolicy.informationUse.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.privacyPolicy.informationUse.content') }}
          </p>
        </article>

        <!-- Information Sharing -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.privacyPolicy.informationSharing.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.privacyPolicy.informationSharing.content') }}
          </p>
        </article>

        <!-- Data Storage -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.privacyPolicy.dataStorage.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.privacyPolicy.dataStorage.content') }}
          </p>
        </article>

        <!-- Cookies and Storage -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.privacyPolicy.cookiesAndStorage.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.privacyPolicy.cookiesAndStorage.content') }}
          </p>
        </article>

        <!-- Third Party Services -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.privacyPolicy.thirdPartyServices.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.privacyPolicy.thirdPartyServices.content') }}
          </p>
        </article>

        <!-- User Rights -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.privacyPolicy.userRights.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.privacyPolicy.userRights.content') }}
          </p>
        </article>

        <!-- Contact -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.privacyPolicy.contact.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.privacyPolicy.contact.content', { email: contactEmail }) }}
          </p>
        </article>
      </div>
    </ContentCard>

    <!-- Terms of Service Section -->
    <ContentCard id="terms-of-service" :title="t('privacyAndTerms.termsOfService.title')">
      <div class="prose prose-gray dark:prose-invert max-w-none prose-scroll-margin">
        <!-- Introduction -->
        <div class="mb-8">
          <p class="text-body">
            {{ t('privacyAndTerms.termsOfService.introduction') }}
          </p>
        </div>

        <!-- Application Content -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.termsOfService.appContent.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.termsOfService.appContent.content') }}
          </p>
        </article>

        <!-- User Behavior -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.termsOfService.userBehavior.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.termsOfService.userBehavior.content') }}
          </p>
        </article>

        <!-- Disclaimers -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.termsOfService.disclaimers.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.termsOfService.disclaimers.content') }}
          </p>
        </article>

        <!-- Modifications -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.termsOfService.modifications.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.termsOfService.modifications.content') }}
          </p>
        </article>

        <!-- Contact -->
        <article class="mb-6">
          <h3 class="heading-section">
            {{ t('privacyAndTerms.termsOfService.contact.title') }}
          </h3>
          <p class="text-body">
            {{ t('privacyAndTerms.termsOfService.contact.content', { email: contactEmail }) }}
          </p>
        </article>
      </div>
    </ContentCard>
  </PageContainer>
</template>
