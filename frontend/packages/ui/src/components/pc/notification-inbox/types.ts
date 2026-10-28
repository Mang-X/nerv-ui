import type { StatusTone } from '../../blocks/status-badge/statusMap'
/** Host-owned display facts. Keys must be unique and stable, never array indexes. */
export interface NvNotificationItem {
  key: string
  title: string
  summary?: string
  code?: string
  meta?: string
  read?: boolean
  statuses?: readonly { label: string; tone: StatusTone }[]
}
