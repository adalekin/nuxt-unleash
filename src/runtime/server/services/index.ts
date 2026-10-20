import { useUnleashClient, type UnleashServerConfig } from '../unleash'
import { useRuntimeConfig } from '#imports'

/** The server's Unleash client once its definitions are loaded: `isEnabled(name, context)` for server routes. */
export function useUnleash() {
  return useUnleashClient(useRuntimeConfig().unleash as UnleashServerConfig)
}
