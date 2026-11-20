export interface MobileSwipeAction {
  value: string
  label: string
  /** Background of the revealed action. Defaults to brand. */
  variant?: 'brand' | 'danger' | 'neutral'
  disabled?: boolean
}

export interface MobileSwipeCellProps {
  actions?: MobileSwipeAction[]
  /** How wide each revealed action is. */
  actionWidth?: number
  /** Disables dragging the row open. */
  disabled?: boolean
  /** Accessible name for the action panel. */
  actionsLabel?: string
  /** Which edge the action list sits on; dragging reveals it from that side. */
  side?: 'end' | 'start'
}
