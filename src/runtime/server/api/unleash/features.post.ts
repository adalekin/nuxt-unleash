import unleashClient from '../../unleash'
import { defineEventHandler, readBody } from '#imports'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const client = await unleashClient()
  
  // Update context if provided
  if (body.ctx) {
    client.updateContext(body.ctx)
  }
  
  const features = client.isEnabled(body.flag)
  return features
})
