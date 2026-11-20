import type { EntityPickerOption, TimelineItem } from '@nerv-ui/ui'
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
/** Callbacks must settle with display-safe host facts. Signal cancellation may be ignored; recipe versions still reject stale results. */
export interface DirectoryHost {
  /** Stable source identity; changing it invalidates pending work. */
  source: string
  parents: EntityPickerOption[]
  entities: (EntityPickerOption & { parent: string })[]
  query: (request: DirectoryRequest, signal: AbortSignal) => Promise<DirectoryPage>
  timeline: (row: DirectoryRow, signal: AbortSignal) => Promise<DirectoryTimeline>
  /** A nonempty string receipt and stable row.key confirm in-host creation. Missing service never implies success. */
  create?: (
    name: string,
    parent: string,
    signal: AbortSignal,
  ) => Promise<{ receipt: string; row: DirectoryRow }>
}
