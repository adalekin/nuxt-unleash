// The playground's "session": the user id lives in a cookie so the server renders the page for the same person.
export default defineNuxtPlugin(() => {
  const userId = useCookie<string | null>('playground-user', { decode: value => value })
  useUnleashContext().value = userId.value ? { userId: userId.value } : {}
})
