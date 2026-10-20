<template>
  <div>
    <h1>approck-nuxt-unleash playground</h1>
    <p :style="{ color: enabled ? 'green' : 'red' }">
      test-feature-flag is {{ enabled ? 'enabled' : 'disabled' }} for {{ context.userId ?? 'a guest' }}
    </p>
    <p>
      <button
        type="button"
        @click="signIn('testuser1@example.com')"
      >
        Act as testuser1@example.com
      </button>
      <button
        type="button"
        @click="signIn('testuser2@example.com')"
      >
        Act as testuser2@example.com
      </button>
    </p>
    <p :style="{ color: serverFeatureFlag ? 'green' : 'red' }">
      test-feature-flag-server is {{ serverFeatureFlag ? 'enabled' : 'disabled' }} in a server route
    </p>
    <p>
      <button
        type="button"
        @click="checkFeatureFlagApi"
      >
        Check feature flag on api
      </button>
    </p>
    <NuxtLink to="/otherpage">
      Go to other page
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const enabled = useFeatureFlag('test-feature-flag')
const context = useUnleashContext()
const userCookie = useCookie<string | null>('playground-user', { decode: value => value })

// Changing the context makes the module read the flags again for the new person.
const signIn = (userId: string) => {
  userCookie.value = userId
  context.value = { userId }
}

const serverFeatureFlag = ref(false)

const checkFeatureFlagApi = async () => {
  serverFeatureFlag.value = await $fetch<boolean>('/api/feature-flag')
}
</script>
