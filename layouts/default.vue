<script setup lang="ts">
const { localeProperties } = useI18n()

useHead({
  htmlAttrs: { lang: localeProperties.value.iso as string }
})
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
    <Header />
    <NuxtPage />
    <CookieConsent />
    <Footer />
  </div>
</template>
