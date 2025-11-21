import NuxtUnleash from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtUnleash,
  ],
  unleash: {
    url: 'https://your-unleash-proxy.com/api/frontend',
    clientKey: 'YOUR_CLIENT_KEY',
    appName: 'staging',
  },
})
