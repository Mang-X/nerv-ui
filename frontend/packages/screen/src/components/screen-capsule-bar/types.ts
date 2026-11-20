export type ScreenCapsuleTone = 'cyan' | 'indigo' | 'green' | 'amber' | 'red'

export interface ScreenCapsuleItem {
  /** 行标题，例如「焊接线 A」。 */
  label: string
  /** 填充值 0–100，超出会被夹到边界。 */
  value: number
  /** 颜色。数值本身始终显示，颜色不单独承载信息。 */
  tone?: ScreenCapsuleTone
}
