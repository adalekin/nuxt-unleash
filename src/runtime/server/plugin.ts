import type { H3Event } from 'h3'
import type { NitroApp } from 'nitropack/types'
import { FeatureFlagsUnavailable, type FeatureFlagsOutcome, type UnleashContext } from '../types'
import { startUnleash, evaluateFlags, type UnleashServerConfig } from './unleash'
import { defineNitroPlugin, useRuntimeConfig } from '#imports'

declare module 'h3' {
  interface H3EventContext {
    /**
     * Evaluates every flag for a context with this server's Unleash client. The Nuxt app is bundled apart from
     * Nitro, so it reaches the one client through the request instead of importing its own copy.
     */
    unleashEvaluate?: (context: UnleashContext) => Promise<FeatureFlagsOutcome>
  }
}

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const config = useRuntimeConfig().unleash as UnleashServerConfig
  // Started with the server so the first definitions are fetched before the first page is rendered. Without its
  // settings the server still starts: every evaluation then fails the same way and the app gets `unleash:error`.
  try {
    startUnleash(config)
  }
  catch (error) {
    if (!(error instanceof FeatureFlagsUnavailable)) throw error
    console.error('[unleash]', error.message)
  }
  nitroApp.hooks.hook('request', (event: H3Event) => {
    event.context.unleashEvaluate = async (context: UnleashContext) => {
      try {
        return await evaluateFlags(config, context)
      }
      catch (error) {
        if (!(error instanceof FeatureFlagsUnavailable)) throw error
        return { unavailable: error.reason }
      }
    }
  })
})
