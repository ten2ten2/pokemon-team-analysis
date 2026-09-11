<script setup lang="ts">
const localeHead = useLocaleHead({ seo: true })
useHead(() => localeHead.value)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
    <Header />
    <slot />
    <CookieConsent />
    <Footer />
  </div>
</template>
