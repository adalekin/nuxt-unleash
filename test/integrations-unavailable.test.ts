import { afterAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { createResolver } from '@nuxt/kit'
import { startFakeGitlab } from './fake-gitlab'

const { resolve } = createResolver(import.meta.url)

process.env.NODE_ENV = 'production'

const gitlab = await startFakeGitlab()
process.env.NUXT_UNLEASH_URL = gitlab.url

describe('failures with Sentry installed', async () => {
  await setup({
    rootDir: resolve('./fixtures/integrations-unavailable'),
    build: true,
  })

  afterAll(() => gitlab.close())

  it('sends the failure to Sentry without a hook in the app', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('for-everyone: off')
    expect(html).toContain('sentry: Feature flags are unavailable: no flag definitions since the server started')
  })

  it('does not make a render wait once the startup wait is over', async () => {
    await $fetch<string>('/')
    const started = performance.now()
    await $fetch<string>('/')
    // readyTimeout is 1 s: a render that waited for it again would take at least that long.
    expect(performance.now() - started).toBeLessThan(500)
  })
})
