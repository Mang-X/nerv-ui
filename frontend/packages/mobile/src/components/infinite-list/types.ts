export interface NvMobileInfiniteListProps {
  /** 数据已经取完——显示「没有更多了」，不再触发加载。 */
  finished?: boolean
  /** 暂停自动加载，但不把列表显示成已到底。 */
  paused?: boolean
  /** 距离底部多少像素时触发 `load`。 */
  offset?: number
  finishedText?: string
  loadingText?: string
}
