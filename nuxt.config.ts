

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    'nuxt-auth-utils'
  ],
  i18n: {
    locales: ['uz', 'ko', 'en'],
    defaultLocale: 'uz',
    strategy: 'prefix', // 모든 언어에 대해 URL 접두사(/ko, /en 등)를 강제합니다.
    vueI18n: 'i18n.config.ts', // i18n 폴더 기준 상대 경로
    bundle: {
      optimizeTranslationDirective: false
    }
  },
  experimental: {
    scanPageMeta: true,
    appManifest: false
  },
  compatibilityDate: '2024-04-03',
  content: {
    highlight: {
      theme: 'github-dark',
      preload: ['python', 'javascript', 'html', 'css', 'bash']
    }
  },
  devtools: { enabled: true }
})
