// The same app, pointed by the test at a port nobody listens on.
export default defineNuxtConfig({
  extends: ['../basicfeatureflag'],
  unleash: {
    appName: 'unavailable',
    readyTimeout: 1,
  },
})
