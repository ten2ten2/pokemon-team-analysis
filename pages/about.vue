<script setup lang="ts">
// Page metadata
definePageMeta({
  layout: 'default'
})

// Composables
const { t } = useI18n()

// Use existing SEO composables
useCustomSeoMeta({ page: 'about' })
useSeoLinks()
useStructuredData({ page: 'about' })

const breadcrumbItems = computed(() => [
  { label: t('about.title'), isCurrentPage: true }
])

// FAQ items
const faqItems = computed(() => [
  {
    id: 'what-is-this-site',
    question: t('about.faq.whatIsThisSite.question'),
    answer: t('about.faq.whatIsThisSite.answer')
  },
  {
    id: 'how-to-contact',
    question: t('about.faq.howToContact.question'),
    answer: t('about.faq.howToContact.answer')
  }
])

// Reactive state for expanded FAQ items
const expandedItems = ref<Set<string>>(new Set())

// Toggle FAQ item
const toggleFaqItem = (itemId: string) => {
  if (expandedItems.value.has(itemId)) {
    expandedItems.value.delete(itemId)
  } else {
    expandedItems.value.add(itemId)
  }
}

// Check if item is expanded
const isExpanded = (itemId: string) => {
  return expandedItems.value.has(itemId)
}
</script>

<template>
  <PageContainer :show-breadcrumb="true" :breadcrumb-items="breadcrumbItems">
    <!-- Page Header -->
    <template #header>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ t('about.title') }}
      </h1>
    </template>
    <template #headerContent>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('about.description') }}
      </p>
    </template>

    <!-- FAQ Section -->
    <ContentCard>
      <div class="space-y-6">
        <div v-for="item in faqItems" :key="item.id" class="rounded-lg overflow-hidden">
          <!-- Question Button -->
          <button @click="toggleFaqItem(item.id)"
            class="w-full px-6 py-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset rounded-lg"
            :aria-expanded="isExpanded(item.id)" :aria-controls="`faq-answer-${item.id}`">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <img src="~/assets/icons/pokeball.svg" alt="Pokeball" class="w-4 h-4" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ item.question }}
                </h3>
              </div>
              <ChevronDown :class="[
                'w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200',
                isExpanded(item.id) ? 'rotate-180' : ''
              ]" />
            </div>
          </button>

          <!-- Answer Content -->
          <div v-show="isExpanded(item.id)" :id="`faq-answer-${item.id}`"
            class="px-6 py-4 bg-white dark:bg-gray-800 rounded-lg mt-2">
            <div class="prose prose-gray dark:prose-invert max-w-none">
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed" v-html="item.answer"></p>
            </div>
          </div>
        </div>
      </div>
    </ContentCard>
  </PageContainer>
</template>
