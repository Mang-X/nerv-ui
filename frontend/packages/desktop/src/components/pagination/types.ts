export type NvPaginationSize = 'sm' | 'md' | 'lg'

/** 分页器右侧附加控件的布局：总数 / 每页条数 / 快速跳转在哪些位置显示。 */
export interface NvPaginationTotalArgs {
  /** 数据总数。 */
  total: number
  /** 当前页第一条的下标（从 1 开始）。总数 0 时也是 0。 */
  from: number
  /** 当前页最后一条的下标（从 1 开始）。总数 0 时也是 0。 */
  to: number
  /** 当前页码。 */
  page: number
  /** 总页数。 */
  pageCount: number
}

export interface NvPaginationProps {
  /** Controlled current page (`v-model:page`), from 1. */
  page?: number
  /** Page shown at first, when uncontrolled. */
  defaultPage?: number
  /** How many pages there are. Or pass `total` and `pageSize`. */
  pageCount?: number
  total?: number
  pageSize?: number
  /** Pages shown on each side of the current one. */
  siblings?: number
  /** Pages always shown at each end. */
  boundaries?: number
  /** URL builder; makes page parts real links instead of buttons. */
  getHref?: (page: number) => string
  /** Accessible name for the navigation landmark. */
  label?: string
  /** Shows first/last jumps at either end. */
  showEdges?: boolean
  prevLabel?: string
  nextLabel?: string
  firstLabel?: string
  lastLabel?: string
  size?: NvPaginationSize
  /** 禁用整个分页器。 */
  disabled?: boolean
  /** 只有一页时隐藏分页器（常用于小列表）。 */
  hideOnSinglePage?: boolean
  /**
   * 显示「共 N 条」。传 `true` 用默认模板，传函数可自定义文案
   * （参数含总数、当前区间与页数）。
   */
  showTotal?: boolean | ((args: NvPaginationTotalArgs) => string)
  /**
   * 显示每页条数选择器。传 `true` 用 `sizeOptions` 里的选项，
   * 传数组直接指定可选项。
   */
  sizeCanChange?: boolean | number[]
  /** `sizeCanChange` 为 `true` 时的可选条数。 */
  sizeOptions?: number[]
  /** 每页条数变化时是否把页码重置到第 1 页。 */
  pageSizeChangeResetPage?: boolean
  /** 显示「跳至第 N 页」输入框（带确认键，回车/失焦生效）。 */
  showJumper?: boolean
  /** 精简模式：`‹ 2 / 12 ›`，点击中间的页码可直接输入跳转。 */
  simple?: boolean
  /** `simple` 模式下是否允许点中间页码直接跳转。 */
  simpleJumper?: boolean
  /** 附加在分页按钮上时使用的无障碍名称模板。 */
  jumpLabel?: string
  pageSizeLabel?: string
  totalLabel?: string
}
