import NuxtUnleash from '../../../src/module'
import FakeAuth from './fakes/auth-module'
import FakeSentry from './fakes/sentry-module'

// `url` comes from NUXT_UNLEASH_URL, set by the test to its fake GitLab.
export default defineNuxtConfig({
  modules: [
    NuxtUnleash,
    FakeAuth,
    FakeSentry,
  ],
  unleash: {
    instanceId: 'test-instance-id',
    appName: 'staging',
  },
})
