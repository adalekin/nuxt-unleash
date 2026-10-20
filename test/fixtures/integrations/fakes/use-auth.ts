import { computed } from 'vue'
import { useCookie } from '#app'

/** The session of the person in the `test-user` cookie; ids are numbers, as in nuxt-auth's typed session data. */
export function useAuth() {
  const user = useCookie<string | null>('test-user', { decode: value => value })
  return { data: computed(() => (user.value ? { id: Number(user.value) } : null)) }
}
