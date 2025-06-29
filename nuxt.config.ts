import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@nuxt/image',
    'nuxt-gtag'
  ].filter(Boolean),
  plugins: ['~/plugins/lucide.ts'],
  image: {
    quality: 80,
    format: ['webp', 'png'],
    presets: {
      pokemon: {
        modifiers: {
          format: 'webp',
          quality: 85
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: 'https://pokemonteamanalysis.com',
      email: 'contact@example.com',
      defaultLocale: 'en',
      ga4Id: process.env.NUXT_PUBLIC_GA4_ID || '',
      adsenseClient: process.env.NUXT_PUBLIC_ADSENSE_CLIENT || '',
    },
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicon-512x512.png' },
        { rel: 'apple-touch-icon', type: 'image/png', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },
  components: [
    { path: '~/components', global: false },
    { path: '~/components/global', global: true },
    { path: '~/components/layout', global: true },
    { path: '~/components/ui', global: true }
  ],
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    lazy: true,
    locales: [
      { code: 'en', iso: 'en', name: 'English', file: 'en.json' },
      { code: 'ja', iso: 'ja', name: '日本語', file: 'ja.json' },
      { code: 'ko', iso: 'ko', name: '한국어', file: 'ko.json' },
      { code: 'zh-hans', iso: 'zh-Hans', name: '简体中文', file: 'zh-hans.json' },
      { code: 'zh-hant', iso: 'zh-Hant', name: '繁体中文', file: 'zh-hant.json' },
    ],
    detectBrowserLanguage: false,
    bundle: {
      optimizeTranslationDirective: false,
    },
    compilation: {
      strictMessage: false,
    }
  },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    css: {
      postcss: {
        plugins: [
          require('@tailwindcss/postcss'),
          require('autoprefixer'),
        ],
      },
    },
    optimizeDeps: {
      include: ['lucide-vue-next'],
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            // 将 Pokémon 相关的大型依赖分离到单独的chunk
            pokemon: ['@pkmn/data', '@pkmn/dex', '@pkmn/sets', '@pkmn/sim'],
            // 将 UI 库分离
            ui: ['lucide-vue-next']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    }
  },
  sitemap: {
    // @ts-expect-error
    hostname: 'https://pokemonteamanalysis.com',
    gzip: true,
    routes: ['/', '/about', '/resources', '/privacy-and-terms']
  },
  robots: {
    enabled: true,
    allow: ['/'],
    sitemap: ['https://pokemonteamanalysis.com/sitemap.xml'],
  },
  gtag: {
    id: process.env.NUXT_PUBLIC_GA4_ID,
    // Only load nuxt-gtag when NUXT_PUBLIC_GA4_ID environment variable exists
    enabled: process.env.NUXT_PUBLIC_GA4_ID ? true : false,
    initCommands: [
      ['consent', 'default', {
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        ad_storage: 'granted',
        analytics_storage: 'granted',
        wait_for_update: 500,
      }]
    ]
  },
  scripts: {
    registry: process.env.NUXT_PUBLIC_ADSENSE_CLIENT ? {
      googleAdsense: {
        client: process.env.NUXT_PUBLIC_ADSENSE_CLIENT,
        autoAds: true
      }
    } : {}
  },
  devtools: { enabled: true },
  compatibilityDate: '2025-06-11',
})
