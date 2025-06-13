<script setup>
const { t } = useI18n()
</script>

<template>
  <footer class="bg-white border-t border-gray-200 py-4 sm:py-6 mt-auto">
    <div
      class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4 md:flex-nowrap md:gap-0">
      <p class="text-footer">
        <!-- 使用 ClientOnly 确保年份在客户端渲染，避免 hydration 错误 -->
        <ClientOnly fallback="© 2025 ">
          © {{ new Date().getFullYear() }}
        </ClientOnly>
        {{ t('footer.copyright') }}
      </p>
      <NuxtLinkLocale to="/privacy-and-terms" class="text-base">
        {{ t('footer.privacyAndTerms') }}
      </NuxtLinkLocale>
    </div>
  </footer>
</template>
