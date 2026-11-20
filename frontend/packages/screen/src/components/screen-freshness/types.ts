/**
 * 数据新鲜度。`live` = 正常刷新，`stale` = 数据过期，`wait` = 等待首次到达。
 * 文案与时钟由调用方持有——不同来源的刷新节奏不同，不能合并成同一个钟。
 */
export type ScreenFreshnessTone = 'live' | 'stale' | 'wait'
