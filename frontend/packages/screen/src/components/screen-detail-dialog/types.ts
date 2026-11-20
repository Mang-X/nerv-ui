/**
 * 详情弹层的四种状态。只有 `data` 会渲染正文，其余三种都是占位说明，
 * 各自的 role 不同（error 用 alert，其余用 status）。
 */
export type ScreenDetailState = 'data' | 'pending' | 'error' | 'empty'
