import { useUnleash } from '#unleash'

// A server route evaluates flags itself, with the context of its own request.
export default defineEventHandler(async () => {
  const client = await useUnleash()
  return client.isEnabled('test-feature-flag-server', {})
})
