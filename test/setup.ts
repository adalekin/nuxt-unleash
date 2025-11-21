import { vi } from 'vitest'

// Mock unleash-proxy-client module
vi.mock('unleash-proxy-client', async () => {
  const { EventEmitter } = await import('events')

  class MockUnleashClient extends EventEmitter {
    private flags: Record<string, boolean> = {
      'test-feature-flag': true,
    }

    constructor(options: any) {
      super()
      // Emit ready event in next tick to ensure listeners are registered first
      Promise.resolve().then(() => {
        this.emit('ready')
      })
    }

    start() {
      // No-op for mock
    }

    updateContext(context: any) {
      // No-op for mock
    }

    isEnabled(flag: string): boolean {
      console.log('[MOCK] isEnabled called with flag:', flag)
      // Return true for test-feature-flag, false for others
      const result = flag === 'test-feature-flag' ? true : (this.flags[flag] || false)
      console.log('[MOCK] isEnabled returning:', result)
      return result
    }

    getVariant(flag: string) {
      return { name: 'disabled', enabled: false }
    }
  }

  return {
    UnleashClient: MockUnleashClient,
  }
})

