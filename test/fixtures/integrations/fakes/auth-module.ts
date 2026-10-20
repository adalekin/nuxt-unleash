import { addImports, createResolver, defineNuxtModule } from '@nuxt/kit'

// Stands in for @sidebase/nuxt-auth: the module looks it up by this name and calls its `useAuth`.
export default defineNuxtModule({
  meta: { name: '@sidebase/nuxt-auth' },
  setup() {
    const { resolve } = createResolver(import.meta.url)
    addImports({ name: 'useAuth', from: resolve('./use-auth') })
  },
})
