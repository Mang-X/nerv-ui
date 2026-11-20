export interface NvBreadcrumbProps {
  /** Accessible name for the navigation landmark. */
  label?: string
}

export interface NvBreadcrumbLinkProps {
  /** When omitted the crumb renders as plain text. */
  href?: string
  /** Marks the crumb as the current page. */
  current?: boolean
}
