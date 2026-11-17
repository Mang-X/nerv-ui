import { inject, type ComputedRef, type InjectionKey } from 'vue'
import type { NvDescriptionsLayout } from './types'

export interface NvDescriptionsContext {
  layout: ComputedRef<NvDescriptionsLayout>
  bordered: ComputedRef<boolean>
  columns: ComputedRef<number>
  labelWidth: ComputedRef<number | string>
}

export const nvDescriptionsInjectionKey: InjectionKey<NvDescriptionsContext> =
  Symbol('nv-descriptions')

export function useNvDescriptionsContext(): NvDescriptionsContext | null {
  return inject(nvDescriptionsInjectionKey, null)
}
