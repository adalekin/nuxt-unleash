import { afterAll, describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { createResolver } from '@nuxt/kit'
import { startFakeGitlab } from './fake-gitlab'

const { resolve } = createResolver(import.meta.url)

process.env.NODE_ENV = 'production'

const gitlab = await startFakeGitlab()
process.env.NUXT_UNLEASH_URL = gitlab.url

describe('context from the nuxt-auth session', async () => {
  await setup({
    rootDir: resolve('./fixtures/integrations'),
    build: true,
  })

  afterAll(() => gitlab.close())

  it('renders the flags of the signed-in person without a plugin in the app', async () => {
    const html = await $fetch<string>('/', { headers: { cookie: 'test-user=7' } })
    expect(html).toContain('only-user-7: on')
  })

  it('renders the flags of a guest when there is no session', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('for-everyone: on')
    expect(html).toContain('only-user-7: off')
  })

  it('writes the session user into the payload context, so the browser does not read the flags again', async () => {
    const html = await $fetch<string>('/', { headers: { cookie: 'test-user=7' } })
    expect(html).toMatch(/"\$sunleash-context":\d+/)
    expect(html).toContain('"userId":')
  })
})
