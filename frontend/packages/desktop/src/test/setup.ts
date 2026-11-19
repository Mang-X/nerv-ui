/**
 * 测试环境的公共桩。
 *
 * jsdom 只实现了一部分浏览器 API；组件在用到的那些上出错时，是"整棵挂不上"，
 * 而不是"样式不对看得见"。这里补的是**缺了会直接抛异常**的那几个。
 */

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

// 轮播自动播放与浮层定位都读它；jsdom 默认没有。
if (!globalThis.matchMedia) {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof matchMedia
}

// 滚动 API 在 jsdom 里是空实现但存在；ui-sdk 依赖 scrollTo 不抛即可。
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function scrollTo() {}
}
