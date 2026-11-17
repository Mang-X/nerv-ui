import type { StatusTone } from '../../blocks/status-badge/statusMap'
export interface NvTreeNode {
  key: string
  label: string
  code?: string
  children?: NvTreeNode[]
  inactive?: boolean
  disabled?: boolean
  status?: { label: string; tone: StatusTone }
}
