// @ts-expect-error The app's dependency; this plugin is added only when @sentry/nuxt is installed.
import * as Sentry from '@sentry/nuxt'
import { defineNuxtPlugin } from '#app'

/** Sends every `unleash:error` to the app's Sentry, on the server and in the browser. */
export default defineNuxtPlugin({
  name: 'approck-nuxt-unleash:sentry',
  setup(nuxtApp) {
    nuxtApp.hook('unleash:error', (error) => {
      Sentry.captureException(error)
    })
  },
})
