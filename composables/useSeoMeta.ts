export function useCustomSeoMeta({ page = 'home' }: { page?: string }) {
  const { t, locale } = useI18n()
  const route = useRoute()
  const config = useRuntimeConfig()

  // Use computed to ensure reactivity and consistent values between server and client
  const currentUrl = computed(() => `${config.public.siteUrl}${route.fullPath}`)
  const title = computed(() => t(`${page}.meta.title`))
  const description = computed(() => t(`${page}.meta.description`))
  const keywords = computed(() => {
    try {
      return t(`${page}.meta.keywords`)
    } catch {
      // Fallback if translation key doesn't exist
      return ''
    }
  })
  const ogImage = computed(() => {
    try {
      return t(`${page}.meta.openGraph.image`)
    } catch {
      // Fallback if translation key doesn't exist
      return '/og-image.png'
    }
  })
  const twitterSite = computed(() => {
    try {
      return '@' + t(`${page}.meta.twitter.site`)
    } catch {
      // Fallback if translation key doesn't exist
      return '@example'
    }
  })
  const twitterImage = computed(() => {
    try {
      return t(`${page}.meta.twitter.image`)
    } catch {
      // Fallback if translation key doesn't exist
      return '/twitter-image.png'
    }
  })

  useSeoMeta({
    title: title,
    description: description,
    keywords: keywords,

    ogTitle: title,
    ogType: 'website',
    ogImage: ogImage,
    ogUrl: currentUrl,
    ogDescription: description,
    ogLocale: locale,

    twitterCard: 'summary_large_image',
    twitterSite: twitterSite,
    twitterTitle: title,
    twitterImage: twitterImage,
    twitterDescription: description,
  })
}
