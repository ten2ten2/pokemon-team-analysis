<script setup lang="ts">
const { localeProperties } = useI18n()

useHead({
  htmlAttrs: { lang: localeProperties.value.iso as string }
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <NuxtPage />
    <CookieConsent />
    <Footer />
  </div>
</template>
