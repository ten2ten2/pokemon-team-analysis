export function useSeoLinks() {
  const { locales } = useI18n()
  const route = useRoute()
  const config = useRuntimeConfig()

  // Use computed to ensure consistent values between server and client
  const baseUrl = computed(() => config.public.siteUrl || 'http://localhost:3000')
  const canonicalUrl = computed(() => `${baseUrl.value}${route.fullPath}`)

  // Generate hreflang links with computed for reactivity
  const hreflangs = computed(() => {
    return (locales.value as any[]).map((loc) => {
      const localePath = loc.code === config.public.defaultLocale ? '' : `/${loc.code}`
      return {
        rel: 'alternate',
        hreflang: loc.iso,
        href: `${baseUrl.value}${localePath}${route.path.replace(/^\/[^\/]+/, '') || ''}`,
      }
    })
  })

  useHead({
    link: computed(() => [
      { rel: 'canonical', href: canonicalUrl.value },
      ...hreflangs.value
    ])
  })
}
