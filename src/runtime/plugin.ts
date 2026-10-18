import { watch } from 'vue'
import { FetchError } from 'ofetch'
import { FeatureFlagsUnavailable, type FeatureFlagsEvaluation } from './types'
import { useFeatureFlags, useUnleashContext } from './composables'
import { defineNuxtPlugin, useRequestEvent, useRuntimeConfig } from '#app'

declare module '#app' {
  interface RuntimeNuxtHooks {
    /** Flags could not be read and are all off for now — report it (e.g. to Sentry). */
    'unleash:error': (error: FeatureFlagsUnavailable) => void | Promise<void>
  }
}

/**
 * Server: evaluates every flag for the context the app wrote and hands the result to the browser in the payload.
 * Browser: reads the flags again only when that context changes; a page rendered without SSR reads them once first.
 * Flags of the previous context stay until the new ones arrive, so the interface does not blink on login or logout.
 * A failed read turns every flag off and calls the `unleash:error` hook.
 */
export default defineNuxtPlugin({
  name: 'approck-nuxt-unleash',
  // After the app's own plugins: they write the context and subscribe to `unleash:error` first.
  enforce: 'post',
  async setup(nuxtApp) {
    const flags = useFeatureFlags()
    const context = useUnleashContext()

    const fail = async (error: FeatureFlagsUnavailable) => {
      flags.value = []
      await nuxtApp.callHook('unleash:error', error)
    }

    if (import.meta.server) {
      const evaluate = useRequestEvent()?.context.unleashEvaluate
      if (!evaluate) throw new Error('approck-nuxt-unleash: the server plugin did not attach unleashEvaluate')
      const outcome = await evaluate({ ...context.value })
      if ('unavailable' in outcome) {
        await fail(new FeatureFlagsUnavailable(outcome.unavailable))
        return
      }
      flags.value = outcome.enabled
      return
    }

    const { apiPath } = useRuntimeConfig().public.unleash as { apiPath: string }
    // Only the latest read may write: the context can change again while an earlier read is in flight.
    let latestRead = 0
    const read = async () => {
      const run = ++latestRead
      try {
        const result = await $fetch<FeatureFlagsEvaluation>(apiPath, {
          method: 'POST',
          body: { context: context.value },
        })
        if (run === latestRead) flags.value = result.enabled
      }
      catch (error) {
        if (!(error instanceof FetchError)) throw error
        if (run !== latestRead) return
        await fail(new FeatureFlagsUnavailable('the flags endpoint did not answer', { cause: error }))
      }
    }

    if (!nuxtApp.payload.serverRendered) {
      await read()
    }
    // Compared by value: the app may write an equal context again (e.g. on hydration) without anything to re-read.
    watch(() => JSON.stringify(context.value), () => {
      void read()
    })
  },
})
