// Set NUXT_UNLEASH_URL and NUXT_UNLEASH_INSTANCE_ID to a project's GitLab feature flags (Deploy > Feature flags >
// Configure) to try it against real flags.
export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },
  compatibilityDate: '2024-11-17',

  unleash: {
    appName: 'staging',
    customApiPath: 'my-custom-unleash-path',
  },
})
