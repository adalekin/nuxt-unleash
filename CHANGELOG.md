# Changelog

## v0.2.0

Breaking: flags are evaluated on the server and delivered with the page.

- The server uses the Node SDK (`unleash-client`) with one client per process and evaluates every call with its own
  context. 0.1 shared one `unleash-proxy-client` between requests and read it before its context update finished,
  so a request could get the flags of the request before it.
- Flags reach the browser in the payload (`useFeatureFlag`, `useFeatureFlags`); the browser reads them again only when
  the context from `useUnleashContext` changes.
- Options: `url` + `instanceId` + `appName` (GitLab feature flags or an Unleash client API); `clientKey` and
  `environment` are removed. New `readyTimeout`.
- A failed read turns every flag off and calls the `unleash:error` hook.
- `customApiPath` now sets the route the browser uses (0.1 wrote and read different config keys).
- `useUnleash().isFeatureEnabled` is removed; `#unleash` exports `useUnleash()` resolving to the SDK client.


## v0.1.4

