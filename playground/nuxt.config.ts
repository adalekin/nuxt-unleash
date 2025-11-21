export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },
  compatibilityDate: '2024-11-17',

  unleash: {
    url: 'https://your-unleash-proxy.com/api/frontend',
    clientKey: 'YOUR_CLIENT_KEY',
    appName: 'staging',
    customApiPath: 'my-custom-unleash-path',
  },
})
