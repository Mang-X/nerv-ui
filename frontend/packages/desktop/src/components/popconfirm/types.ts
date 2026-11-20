export interface NvPopconfirmProps {
  /** 标题问题，例如「确认删除这条记录？」。 */
  title?: string
  /** 补充说明，告诉用户这个动作的后果。 */
  description?: string
  confirmText?: string
  cancelText?: string
  /** 确认按钮的语义：危险动作（删除/停用）用 `danger`。 */
  tone?: 'default' | 'danger'
  /** 受控打开态（`v-model:open`）；不给就自管理。 */
  open?: boolean
  /** 确认进行中：按钮不可再点。 */
  loading?: boolean
}
