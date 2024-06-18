// https://nuxt.com/doc/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [ '@pinia/nuxt' ],
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
    jwtSecret: '',
    public: {
      apiBase: '/api'
    }
  },
})
