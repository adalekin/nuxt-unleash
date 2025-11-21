import { UnleashClient } from 'unleash-proxy-client'
import type { ModuleOptions } from '~/src/module'

let unleashInstance: UnleashClient | undefined

export default async function (options?: ModuleOptions) {
  if (unleashInstance) {
    return unleashInstance
  }

  if (!options) {
    throw new Error('Unleash must be initialized with options first!')
  }

  const instance = unleashInstance = new UnleashClient({
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
