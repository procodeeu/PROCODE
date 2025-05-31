export default defineNuxtConfig({
  devtools: { enabled: true },
  typescript: {
    typeCheck: true
  },
  css: ['~/assets/css/main.css'],
  modules: [
    '@pinia/nuxt'
  ],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    public: {
      apiBase: '/api'
    }
  }
})