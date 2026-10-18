import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { describe, expect, it } from 'vitest'
import { setup, $fetch, fetch } from '@nuxt/test-utils/e2e'
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

process.env.NODE_ENV = 'production'

// A port that was free a moment ago: nothing answers there.
const probe = createServer()
await new Promise<void>(done => probe.listen(0, '127.0.0.1', done))
const { port } = probe.address() as AddressInfo
await new Promise<void>(done => probe.close(() => done()))
process.env.NUXT_UNLEASH_URL = `http://127.0.0.1:${port}/api/v4/feature_flags/unleash/1`

describe('flags when GitLab is unreachable', async () => {
  await setup({
    rootDir: resolve('./fixtures/unavailable'),
    build: true,
  })

  it('renders the page with every flag off and calls unleash:error', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('for-everyone: off')
    expect(html).toContain('flags failed')
  })

  it('answers the browser with 503', async () => {
    const response = await fetch('/api/unleash/features', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ context: {} }),
    })
    expect(response.status).toBe(503)
  })
})
