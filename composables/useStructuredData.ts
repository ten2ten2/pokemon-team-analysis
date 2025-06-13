export function useStructuredData({ page = 'home' }: { page?: string }) {
  const { t, locale } = useI18n()
  const route = useRoute()
  const config = useRuntimeConfig()

  // Use computed to ensure consistent values between server and client
  const currentUrl = computed(() => `${config.public.siteUrl}${route.fullPath}`)

  const structuredData = computed(() => {
    try {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: currentUrl.value,
        name: t(`${page}.meta.title`),
        description: t(`${page}.meta.description`),
        inLanguage: locale.value,
        keywords: (() => {
          try {
            return t(`${page}.meta.keywords`)
          } catch {
            return undefined // Don't include keywords if not available
          }
        })(),
      }
    } catch (error) {
      // Fallback structured data if translations fail
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: currentUrl.value,
        name: 'Page',
        description: 'Page description',
        inLanguage: locale.value,
      }
    }
  })

  useHead({
    script: computed(() => [
      {
        type: 'application/ld+json',
        children: JSON.stringify(structuredData.value)
      }
    ])
  })
}
