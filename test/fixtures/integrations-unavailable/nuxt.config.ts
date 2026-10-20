// The same app with an Instance ID the fake GitLab refuses: no definitions ever arrive. Its own appName keeps it off
// the backup file unleash-client writes per appName, which would hand it the definitions of another test.
export default defineNuxtConfig({
  extends: ['../integrations'],
  unleash: {
    instanceId: 'refused-instance-id',
    appName: 'integrations-unavailable',
    readyTimeout: 1,
  },
})
