export interface MobileListPosition {
  filterKey: string
  scrollTop: number
}
/** Synchronous, host-owned storage. Omission means no persistence. */
export interface MobileListStorage {
  load: (sourceKey: string) => MobileListPosition | undefined
  save: (sourceKey: string, state: MobileListPosition) => void
}
