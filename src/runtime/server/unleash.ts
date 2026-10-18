import { Unleash, UnleashEvents } from 'unleash-client'
import { FeatureFlagsUnavailable, type FeatureFlagsEvaluation, type UnleashContext } from '../types'

export interface UnleashServerConfig {
  url: string
  instanceId: string
  appName: string
  /** Seconds between refreshes of the flag definitions. */
  refreshInterval: number
  /** Seconds an evaluation waits for the first definitions before it fails. */
  readyTimeout: number
}

let client: Unleash | undefined
let ready: Promise<void> | undefined

function requireSetting(config: UnleashServerConfig, key: 'url' | 'instanceId' | 'appName'): string {
  const value = config[key]
  if (!value) throw new FeatureFlagsUnavailable(`runtimeConfig.unleash.${key} is not set`)
  return value
}

/**
 * The one Unleash client of this server process. It keeps the flag definitions in memory and evaluates every call
 * against the context passed to that call, so concurrent requests of different people never share state.
 *
 * `ready` resolves once definitions are in memory: from the first fetch, or from the backup file of an earlier run
 * when the server is unreachable at start — those are real last-known flags, not a guess.
 */
export function startUnleash(config: UnleashServerConfig): Unleash {
  if (client) return client

  client = new Unleash({
    url: requireSetting(config, 'url'),
    instanceId: requireSetting(config, 'instanceId'),
    appName: requireSetting(config, 'appName'),
    refreshInterval: config.refreshInterval * 1000,
    // GitLab accepts client metrics and drops them (lib/api/unleash.rb: "not supported yet").
    disableMetrics: true,
  })
  const started = client
  ready = new Promise<void>((resolve) => {
    if (started.isSynchronized()) return resolve()
    started.once(UnleashEvents.Ready, () => resolve())
  })
  client.on(UnleashEvents.Error, (error: unknown) => console.error('[unleash]', error))
  client.on(UnleashEvents.Warn, (message: unknown) => console.warn('[unleash]', message))
  return client
}

async function readyClient(config: UnleashServerConfig): Promise<Unleash> {
  const unleash = startUnleash(config)
  let timer: ReturnType<typeof setTimeout> | undefined
  const late = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new FeatureFlagsUnavailable(`no flag definitions within ${config.readyTimeout} s`)),
      config.readyTimeout * 1000,
    )
  })
  try {
    await Promise.race([ready, late])
  }
  finally {
    clearTimeout(timer)
  }
  return unleash
}

/** The client once its definitions are in memory, for server routes that evaluate flags themselves. */
export function useUnleashClient(config: UnleashServerConfig): Promise<Unleash> {
  return readyClient(config)
}

/** Every flag defined for this `appName`, evaluated for one context. */
export async function evaluateFlags(config: UnleashServerConfig, context: UnleashContext): Promise<FeatureFlagsEvaluation> {
  const unleash = await readyClient(config)
  const enabled = unleash
    .getFeatureToggleDefinitions()
    .map(definition => definition.name)
    .filter(name => unleash.isEnabled(name, context))
  return { enabled }
}
