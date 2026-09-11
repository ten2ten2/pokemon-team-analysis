export function useStructuredData({ page = 'home' }: { page?: string }) {
  const { t, localeProperties } = useI18n()
  const route = useRoute()
  const config = useRuntimeConfig()
  useHead(() => ({
    script: [{
      type: 'application/ld+json',
      textContent: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebPage',
        url: new URL(route.path, config.public.siteUrl).href,
        name: t(`${page}.meta.title`), description: t(`${page}.meta.description`),
        inLanguage: localeProperties.value.language,
      }).replace(/</g, '\\u003c'),
    }],
  }))
}
