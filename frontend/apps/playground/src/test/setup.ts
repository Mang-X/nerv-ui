import { disableUnovisTooltipThrottle } from '@nerv-ui/ui/test-support'

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

// jsdom 建了 `document` / `window`，但 vitest 4 的 jsdom 环境里 `window.localStorage`
// 的 getter 返回 `undefined`——演示页面（主题持久化、导航记忆）直接读全局，于是整棵
// 组件在 setup 阶段就抛 `Cannot read properties of undefined (reading 'getItem')`。
// 这里补一个内存版 Storage，和上面的 ResizeObserver 是同一类「缺了直接挂」的桩。
if (!globalThis.localStorage) {
  const store = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return store.size
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  }
  globalThis.localStorage = storage
}

await disableUnovisTooltipThrottle()
