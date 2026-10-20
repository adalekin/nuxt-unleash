<template>
  <ul>
    <li>for-everyone: {{ forEveryone ? 'on' : 'off' }}</li>
    <li>only-user-7: {{ onlyUser7 ? 'on' : 'off' }}</li>
    <li>sentry: {{ captured || 'nothing' }}</li>
  </ul>
</template>

<script setup lang="ts">
const forEveryone = useFeatureFlag('for-everyone')
const onlyUser7 = useFeatureFlag('only-user-7')
const captured = useState('sentry-captured', () => '')
</script>
