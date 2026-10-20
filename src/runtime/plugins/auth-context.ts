import { watch } from 'vue'
import { useUnleashContext } from '../composables'
import { defineNuxtPlugin } from '#app'
// @ts-expect-error `useAuth` is auto-imported by @sidebase/nuxt-auth; this plugin is added only when it is installed.
import { useAuth } from '#imports'

interface AuthSession {
  id?: string | number | null
}

/**
 * Evaluates flags for the signed-in person of @sidebase/nuxt-auth: `userId` is the session's `id`. nuxt-auth reads
 * the session on the server before the page renders, so the first HTML already has that person's flags; login,
 * logout and another account change the context, and the module's plugin reads the flags again.
 */
export default defineNuxtPlugin({
  name: 'approck-nuxt-unleash:auth-context',
  // After nuxt-auth's own plugin has read the session; registered before the module's plugin, which reads the context.
  enforce: 'post',
  setup() {
    const { data } = useAuth() as { data: { value: AuthSession | null | undefined } }
    const context = useUnleashContext()
    watch(() => data.value?.id, (id) => {
      context.value = id == null ? {} : { userId: String(id) }
    }, { immediate: true })
  },
})
