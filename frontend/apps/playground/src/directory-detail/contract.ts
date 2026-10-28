import type { EntityPickerOption, TimelineItem } from '@nerv-iip/ui'
export interface DirectoryRow {
  key: string
  code: string
  name: string
  parent: string
  quantity: number | null
  note?: string
  eligible: boolean
  reason: string
}
export interface DirectoryFilter {
  parent: string
  entity: string
  keyword: string
}
export interface DirectoryRequest {
  source: string
  filter: DirectoryFilter
  page: number
  pageSize: number
}
export interface DirectoryPage {
  rows: DirectoryRow[]
  total: number
}
export type DirectoryTimeline =
  | { state: 'ready'; items: TimelineItem[] }
  | { state: 'forbidden' | 'unlinked'; message: string }
export interface DirectoryHost {
  source: string
  parents: EntityPickerOption[]
  entities: (EntityPickerOption & { parent: string })[]
  query: (request: DirectoryRequest, signal: AbortSignal) => Promise<DirectoryPage>
  timeline: (row: DirectoryRow, signal: AbortSignal) => Promise<DirectoryTimeline>
  create?: (
    name: string,
    parent: string,
    signal: AbortSignal,
  ) => Promise<{ receipt: string; row: DirectoryRow }>
}
