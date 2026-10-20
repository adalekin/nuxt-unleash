export default defineNuxtPlugin((nuxtApp) => {
  const failed = useState('flags-failed', () => false)
  nuxtApp.hook('unleash:error', () => {
    failed.value = true
  })
})
