export function useCustomSeoMeta({ page = 'home' }: { page?: string }) {
  const { t } = useI18n()
  const route = useRoute()
  const config = useRuntimeConfig()
  const title = computed(() => t(`${page}.meta.title`))
  const description = computed(() => t(`${page}.meta.description`))
  const image = new URL('/favicon-512x512.png', config.public.siteUrl).href

  useSeoMeta({
    title, description,
    ogTitle: title, ogDescription: description, ogType: 'website',
    ogUrl: () => new URL(route.path, config.public.siteUrl).href,
    ogImage: image,
    twitterCard: 'summary', twitterTitle: title,
    twitterDescription: description, twitterImage: image,
  })
}
