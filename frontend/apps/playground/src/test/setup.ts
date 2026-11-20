import { disableUnovisTooltipThrottle } from '@nerv-ui/ui/test-support'

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}
await disableUnovisTooltipThrottle()
