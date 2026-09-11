import tailwindcss from '@tailwindcss/vite'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://pokemonteamanalysis.com'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-11',
  modules: ['@nuxtjs/i18n', '@nuxtjs/sitemap', '@nuxtjs/robots', '@nuxt/image', 'nuxt-gtag'],
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/css/tailwind.css'],
  vite: { plugins: [tailwindcss()] },
  site: { url: siteUrl, name: 'Pokémon Team Analysis', defaultLocale: 'en' },
  runtimeConfig: {
    public: { siteUrl, email: 'contact@example.com' },
  },
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },
  image: {
    domains: ['raw.githubusercontent.com'],
    quality: 80,
    format: ['webp'],
  },
  i18n: {
    baseUrl: siteUrl,
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
      { code: 'ja', language: 'ja', name: '日本語', file: 'ja.json' },
      { code: 'ko', language: 'ko', name: '한국어', file: 'ko.json' },
      { code: 'zh-hans', language: 'zh-Hans', name: '简体中文', file: 'zh-hans.json' },
      { code: 'zh-hant', language: 'zh-Hant', name: '繁体中文', file: 'zh-hant.json' },
    ],
    detectBrowserLanguage: false,
    compilation: { strictMessage: false },
  },
  sitemap: { exclude: ['/teams/**', '/**/teams/**'] },
  routeRules: {
    '/api/pokemon-translations': { prerender: true },
  },
  gtag: {
    initMode: 'manual',
    initCommands: [
      ['consent', 'default', {
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        ad_storage: 'denied',
        analytics_storage: 'denied',
      }],
    ],
  },
  devtools: { enabled: true },
})
