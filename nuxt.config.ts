// https://nuxt.com/doc/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      script: [
        { src: "https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js", type: "text/javascript" },
      ],
    },
  },
  css: [ '~/assets/css/main.css' ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    jwtSecret: process.env.NUXT_JWT_SECRET ?? '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '/api'
    }
  },
  experimental: {
    renderJsonPayloads: false,
  },
  nitro: {
    preset: 'bun',
  },
})
