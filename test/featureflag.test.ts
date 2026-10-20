import { afterAll, describe, expect, it } from 'vitest'
import { setup, $fetch, fetch } from '@nuxt/test-utils/e2e'
import { createResolver } from '@nuxt/kit'
import { startFakeGitlab } from './fake-gitlab'

const { resolve } = createResolver(import.meta.url)

process.env.NODE_ENV = 'production'

const gitlab = await startFakeGitlab()
process.env.NUXT_UNLEASH_URL = gitlab.url

describe('flags evaluated on the server', async () => {
  await setup({
    rootDir: resolve('./fixtures/basicfeatureflag'),
    build: true,
  })

  afterAll(() => gitlab.close())

  it('renders the flags of a guest in the first HTML', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('for-everyone: on')
    expect(html).toContain('only-user-7: off')
    expect(html).toContain('switched-off: off')
    expect(html).not.toContain('flags failed')
  })

  it('renders the flags of the signed-in person', async () => {
    const html = await $fetch<string>('/', { headers: { cookie: 'test-user=7' } })
    expect(html).toContain('only-user-7: on')
  })

  it('hands the evaluated flags to the browser in the payload', async () => {
    const html = await $fetch<string>('/', { headers: { cookie: 'test-user=7' } })
    expect(html).toContain('$sunleash-flags')
  })

  it('evaluates a context the browser posts', async () => {
    const result = await $fetch('/api/unleash/features', { method: 'POST', body: { context: { userId: '7' } } })
    expect(result).toEqual({ enabled: ['for-everyone', 'only-user-7'] })
  })

  it('rejects a context that is not an object', async () => {
    const response = await fetch('/api/unleash/features', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ context: 'user-7' }),
    })
    expect(response.status).toBe(400)
  })

  // 0.1.0 shared one client between requests and read it before its context update finished, so a request could
  // get the flags of the request before it — another person's.
  it('keeps concurrent requests of different people apart', async () => {
    const people = Array.from({ length: 20 }, (_, index) => (index % 2 === 0 ? '7' : '8'))
    const results = await Promise.all(people.map(userId =>
      $fetch<{ enabled: string[] }>('/api/unleash/features', { method: 'POST', body: { context: { userId } } }),
    ))
    results.forEach((result, index) => {
      expect(result.enabled.includes('only-user-7')).toBe(people[index] === '7')
    })
  })
})
