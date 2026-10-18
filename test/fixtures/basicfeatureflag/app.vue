<template>
  <ul>
    <li>for-everyone: {{ forEveryone ? 'on' : 'off' }}</li>
    <li>only-user-7: {{ onlyUser7 ? 'on' : 'off' }}</li>
    <li>switched-off: {{ switchedOff ? 'on' : 'off' }}</li>
    <li v-if="failed">
      flags failed
    </li>
  </ul>
</template>

<script setup lang="ts">
const forEveryone = useFeatureFlag('for-everyone')
const onlyUser7 = useFeatureFlag('only-user-7')
const switchedOff = useFeatureFlag('switched-off')
const failed = useState('flags-failed', () => false)
</script>
