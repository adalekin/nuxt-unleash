import { vi } from 'vitest'

// Mock unleash-proxy-client module
vi.mock('unleash-proxy-client', async () => {
  const { EventEmitter } = await import('node:events')

  class MockUnleashClient extends EventEmitter {
    private flags: Record<string, boolean> = {
      'test-feature-flag': true,
    }

    constructor(_options: Record<string, unknown>) {
      super()
      // Emit ready event in next tick to ensure listeners are registered first
      Promise.resolve().then(() => {
        this.emit('ready')
      })
    }

    start() {
      // No-op for mock
    }

    updateContext(_context: Record<string, unknown>) {
      // No-op for mock
    }

    isEnabled(flag: string): boolean {
      // Return true for test-feature-flag, false for others
      return flag === 'test-feature-flag' ? true : (this.flags[flag] || false)
    }

    getVariant(_flag: string) {
      return { name: 'disabled', enabled: false }
    }
  }

  return {
    UnleashClient: MockUnleashClient,
  }
})
