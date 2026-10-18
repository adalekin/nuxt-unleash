import type { UnleashContext } from '../../types'
import { createError, defineEventHandler, readBody } from '#imports'

const CONTEXT_FIELDS = ['userId', 'sessionId', 'remoteAddress'] as const

/**
 * The browser asks here when its context changes (login, logout, another account). The context comes from the
 * browser: flags gate the interface, not access — whatever a flag hides must still be checked by the API.
 */
function readContext(body: unknown): UnleashContext {
  const source = (body as { context?: unknown } | null)?.context
  if (typeof source !== 'object' || source === null) {
    throw createError({ statusCode: 400, statusMessage: 'body.context must be an object' })
  }
  const context: UnleashContext = {}
  for (const field of CONTEXT_FIELDS) {
    const value = (source as Record<string, unknown>)[field]
    if (value === undefined) continue
    if (typeof value !== 'string') {
      throw createError({ statusCode: 400, statusMessage: `body.context.${field} must be a string` })
    }
    context[field] = value
  }
  const properties = (source as Record<string, unknown>).properties
  if (properties !== undefined) {
    if (typeof properties !== 'object' || properties === null
      || Object.values(properties).some(value => typeof value !== 'string')) {
      throw createError({ statusCode: 400, statusMessage: 'body.context.properties must map strings to strings' })
    }
    context.properties = properties as Record<string, string>
  }
  return context
}

export default defineEventHandler(async (event) => {
  const context = readContext(await readBody(event))
  const evaluate = event.context.unleashEvaluate
  if (!evaluate) throw new Error('approck-nuxt-unleash: the server plugin did not attach unleashEvaluate')
  const outcome = await evaluate(context)
  if ('unavailable' in outcome) throw createError({ statusCode: 503, statusMessage: outcome.unavailable })
  return outcome
})
