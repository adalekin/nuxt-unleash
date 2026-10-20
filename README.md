<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# Nuxt Unleash Module

Feature flags from [Unleash](https://www.getunleash.io) — including [GitLab feature flags](https://docs.gitlab.com/operations/feature_flags/), which serve an Unleash-compatible API — for Nuxt 3 and 4, evaluated on the server and delivered with the page.

## Features

- Flags are evaluated on the server with the Node SDK ([unleash-client](https://www.npmjs.com/package/unleash-client)) for the context of each request, and handed to the browser in the payload: the first HTML already has them, nothing appears after hydration.
- One client per server process keeps the flag definitions in memory; every evaluation gets its own context, so concurrent requests of different people never share state.
- The browser reads the flags again, in one request, only when the context changes (login, logout, another account).
- With [@sidebase/nuxt-auth](https://auth.sidebase.io) the flags are evaluated for the signed-in person, and with [@sentry/nuxt](https://docs.sentry.io/platforms/javascript/guides/nuxt/) failures are reported — nothing to write in the app.
- `useFeatureFlag(name)` is synchronous.
- Server routes can evaluate flags themselves through `#unleash`.

## Quick Setup

```bash
npm install approck-nuxt-unleash
```

```ts
export default defineNuxtConfig({
  modules: ['approck-nuxt-unleash'],
  unleash: {
    // GitLab: Deploy > Feature flags > Configure
    url: 'https://gitlab.example.com/api/v4/feature_flags/unleash/42',
    instanceId: 'glffct-…',
    // The environment the app runs in: GitLab scopes flag strategies to environments by this name.
    appName: 'production',
  },
})
```

The settings are server-only runtime config, so they can be set at deploy time instead:
`NUXT_UNLEASH_URL`, `NUXT_UNLEASH_INSTANCE_ID`, `NUXT_UNLEASH_APP_NAME`.

| Option | Default | |
| --- | --- | --- |
| `url` | — | Unleash client API URL (GitLab: API URL). |
| `instanceId` | — | GitLab: Instance ID. Never sent to the browser. |
| `appName` | — | GitLab: environment name. |
| `refreshInterval` | `15` | Seconds between refreshes of the flag definitions. |
| `readyTimeout` | `5` | Seconds after the server starts in which renders wait, together, for the first definitions. No render waits after that: without definitions the flags are off until they arrive. |
| `customApiPath` | `'unleash'` | The browser reads flags from `POST /api/<customApiPath>/features`. |

Without `url`, `instanceId` or `appName` the app still starts; every flag is off and `unleash:error` is called.

## Usage

With @sidebase/nuxt-auth installed the module evaluates flags for the session's `id` as `userId`. nuxt-auth reads the session on the server, so the first HTML has that person's flags; login, logout and another account read them again.

Without nuxt-auth the app tells the module whom to evaluate for. Write the context in a plugin — the module's own plugin runs after the app's plugins — and again whenever the person changes:

```ts
// plugins/unleash-context.ts
export default defineNuxtPlugin(() => {
  const userId = useCookie<string | null>('user-id')
  useUnleashContext().value = userId.value ? { userId: userId.value } : {}
})
```

Read flags anywhere:

```ts
const canvasEnabled = useFeatureFlag('canvas') // ComputedRef<boolean>
const flags = useFeatureFlags() // Ref<string[] | null>: names of the flags that are on
```

A read that failed leaves every flag off and calls `unleash:error`. With @sentry/nuxt installed the module sends it to Sentry itself; otherwise subscribe to the hook:

```ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('unleash:error', error => console.error(error))
})
```

In a server route:

```ts
import { useUnleash } from '#unleash'

export default defineEventHandler(async () => {
  const client = await useUnleash()
  return client.isEnabled('my-flag', { userId: '42' })
})
```

The context the browser posts is not verified: flags gate the interface, not access — whatever a flag hides must still be checked by the API.

## Migrating from 0.1

- Options: `clientKey` and `environment` are gone; set `instanceId` instead. `url` points at the Unleash client API (GitLab's API URL), not at an Unleash Proxy.
- `useUnleash().isFeatureEnabled(flag, ctx)` is replaced by `useFeatureFlag(flag)`; the context is set once with `useUnleashContext()`.
- On the server, `#unleash` exports `useUnleash()`, which resolves to the `unleash-client` instance: `isEnabled(name, context)`.

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/approck-nuxt-unleash/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/approck-nuxt-unleash
[npm-downloads-src]: https://img.shields.io/npm/dm/approck-nuxt-unleash.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/approck-nuxt-unleash
[license-src]: https://img.shields.io/npm/l/approck-nuxt-unleash.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/approck-nuxt-unleash
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
