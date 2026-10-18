import NuxtUnleash from '../../../src/module'

// `url` comes from NUXT_UNLEASH_URL, set by the test to its fake GitLab.
export default defineNuxtConfig({
  modules: [
    NuxtUnleash,
  ],
  unleash: {
    instanceId: 'test-instance-id',
    appName: 'staging',
  },
})
