import { computed, type ComputedRef, type Ref } from 'vue'
import type { UnleashContext } from '../types'
import { useState } from '#app'

/**
 * The context flags are evaluated for. The application writes it — typically in a plugin, from its session — before
 * the module's plugin runs (that one is enforced after the app's plugins), and again whenever the person changes.
 */
export function useUnleashContext(): Ref<UnleashContext> {
  return useState<UnleashContext>('unleash-context', () => ({}))
}

/**
 * Names of the flags that are on for the current context. Evaluated on the server and delivered with the page, so
 * they are known from the first render; `null` only on a page rendered without SSR, until the browser reads them.
 */
export function useFeatureFlags(): Ref<string[] | null> {
  return useState<string[] | null>('unleash-flags', () => null)
}

/** Whether a flag is on for the current context; off while the flags are not known. */
export function useFeatureFlag(name: string): ComputedRef<boolean> {
  const flags = useFeatureFlags()
  return computed(() => flags.value?.includes(name) === true)
}
