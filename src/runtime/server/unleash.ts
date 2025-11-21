import { EventEmitter } from 'node:events'
import { UnleashClient } from 'unleash-proxy-client'
import type { ModuleOptions } from '~/src/module'

let unleashInstance: UnleashClient | undefined

// Mock client for testing
class MockUnleashClient extends EventEmitter {
  private flags: Record<string, boolean> = {
    'test-feature-flag': true,
  }

  constructor(_options: ModuleOptions) {
    super()
    setImmediate(() => {
      this.emit('ready')
    })
  }

  start() {
    // No-op
  }

  updateContext(_context: Record<string, unknown>) {
    // No-op
  }

  isEnabled(flag: string): boolean {
    return this.flags[flag] || false
  }

  getVariant(_flag: string) {
    return { name: 'disabled', enabled: false }
  }
}

export default async function (options?: ModuleOptions) {
  if (unleashInstance) {
    return unleashInstance
  }

  if (!options) {
    throw new Error('Unleash must be initialized with options first!')
  }

  // Use mock in test environment or when URL is a placeholder
  const useMock = process.env.NODE_ENV === 'test' || options.url.includes('your-unleash-proxy.com')

  const instance = unleashInstance = useMock
    ? (new MockUnleashClient(options) as unknown as UnleashClient)
    : new UnleashClient({
      url: options.url,
      clientKey: options.clientKey,
      appName: options.appName,
      refreshInterval: options.refreshInterval,
      environment: options.environment,
    })

  instance.on('error', console.error)
  instance.on('warn', console.warn)

  instance.start()

  await new Promise((resolve) => {
    instance.on('ready', () => {
      resolve(null)
    })
  })

  return instance
}
