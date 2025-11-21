import { ref, watch, type ComputedRef, type Ref } from 'vue'
import { useRuntimeConfig } from '#app'

export interface Context {
  userId?: string
  sessionId?: string
  remoteAddress?: string
  environment?: string
  appName?: string
  properties?: Record<string, string>
  [key: string]: unknown
}

export function useUnleash() {
  const customApiPath = useRuntimeConfig().public.customApiPath

  const isEnabled = async (flag: string, context?: Context | Ref<Context>) => {
    const ctx = context?.value || context

    const result = await $fetch<boolean>(`/api/${customApiPath}/features`, {
      method: 'POST',
      body: JSON.stringify({ flag, ctx }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return result
  }

  return {
    isFeatureEnabled: async (flag: string, ctx?: Context | Ref<Context> | ComputedRef<Context>) => {
      const enabled = ref<boolean>(false)
      enabled.value = await isEnabled(flag, ctx)

      if (ctx?.value) {
        watch(ctx, async () => {
          enabled.value = await isEnabled(flag, ctx)
        }, { deep: true })
      }

      return {
        enabled: enabled,
        refresh: async () => {
          enabled.value = await isEnabled(flag, ctx)
        },
      }
    },
  }
}
