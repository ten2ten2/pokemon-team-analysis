<script setup lang="ts">
// This component should only run on the client side to avoid hydration mismatches
// since cookie values and visibility state depend on browser environment

const { t } = useI18n()

// Initialize reactive state for client-side only
const visible = ref(false)
const { hasConsent, accept, decline } = useCookieConsent()

// Client-side initialization using onMounted to avoid hydration mismatch
onMounted(() => {
  // Show banner only if consent hasn't been given yet
  visible.value = !hasConsent.value
})

const handleAccept = () => {
  accept()
  visible.value = false
}

const handleDecline = () => {
  decline()
  visible.value = false
}

const handleDismiss = () => {
  visible.value = false
}
</script>

<template>
  <!-- Use ClientOnly to prevent hydration mismatch since this component
       depends on browser-specific cookie state -->
  <ClientOnly>
    <Teleport to="body">
      <section v-if="visible" role="alert" aria-live="polite"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mx-auto px-4 py-4">
          <div class="flex-1">
            <h2 class="text-subtitle">
              {{ t('cookieConsent.title') }}
            </h2>
            <p class="text-description">
              {{ t('cookieConsent.message') }}
              <NuxtLinkLocale to="/privacy-and-terms" class="ml-1">
                {{ t('cookieConsent.learnMore') }}
              </NuxtLinkLocale>
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button @click="handleDecline" type="button" class="btn-secondary focus-ring-gray text-sm"
              :aria-label="t('cookieConsent.decline')">
              {{ t('cookieConsent.decline') }}
            </button>
            <button @click="handleAccept" type="button" class="btn-primary focus-ring-red text-sm"
              :aria-label="t('cookieConsent.accept')">
              {{ t('cookieConsent.accept') }}
            </button>
            <button @click="handleDismiss" type="button" :aria-label="t('cookieConsent.dismiss')"
              class="p-2 text-gray-400 hover:text-gray-600 transition-colors focus-ring-gray rounded">
              <XIcon class="w-5 h-5" />
              <span class="sr-only">{{ t('cookieConsent.dismiss') }}</span>
            </button>
          </div>
        </div>
      </section>
    </Teleport>
  </ClientOnly>
</template>
