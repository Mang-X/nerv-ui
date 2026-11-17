export type StatusWallMode = 'grid' | 'grouped'

export type StatusWallTone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

export interface StatusWallItem {
  /** Stable identity, independent of label and order. */
  key: string
  label: string
  /** Secondary identity so repeated names stay distinguishable. */
  identity?: string
  status: { label: string; tone: StatusWallTone }
  summary?: string | null
  group?: { key: string; label: string }
  disabled?: boolean
}

export interface StatusWallGroup {
  key: string
  label: string
  items: StatusWallItem[]
}
