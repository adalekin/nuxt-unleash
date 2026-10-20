// The app's side of the contract: it writes the evaluation context before the module's plugin reads it.
export default defineNuxtPlugin(() => {
  // Read as the raw string: the default decoder would turn "7" into a number, and user ids are strings.
  const user = useCookie<string | null>('test-user', { decode: value => value })
  useUnleashContext().value = user.value ? { userId: user.value } : {}
})
