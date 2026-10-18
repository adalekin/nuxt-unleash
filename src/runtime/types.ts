/**
 * Unleash context of one evaluation. The application fills it (see `useUnleashContext`); the module adds nothing
 * of its own. `appName` and `environment` are not part of it: GitLab picks the environment from the client's
 * `appName`, which is fixed per deployment in the module options.
 */
export type UnleashContext = {
  userId?: string
  sessionId?: string
  remoteAddress?: string
  properties?: Record<string, string>
}

/** Names of the flags that are on for a context. */
export interface FeatureFlagsEvaluation {
  enabled: string[]
}

/**
 * What the server hands the Nuxt app for one context. The app and Nitro are separate bundles with their own copy of
 * every class, so a failure crosses as data — an `instanceof` check on a thrown error would never match.
 */
export type FeatureFlagsOutcome = FeatureFlagsEvaluation | { unavailable: string }

/** Flag definitions were not available in time, or the browser could not reach the module's endpoint. */
export class FeatureFlagsUnavailable extends Error {
  constructor(reason: string, options?: ErrorOptions) {
    super(`Feature flags are unavailable: ${reason}`, options)
    this.name = 'FeatureFlagsUnavailable'
  }
}
