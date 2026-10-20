import { createResolver, defineNuxtModule } from '@nuxt/kit'

// Stands in for @sentry/nuxt: the module looks it up by this name and imports `@sentry/nuxt`.
export default defineNuxtModule({
  meta: { name: '@sentry/nuxt/module' },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.options.alias['@sentry/nuxt'] = resolve('./sentry')
  },
})
