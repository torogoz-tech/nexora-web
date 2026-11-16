export type PrimaryNavigationProps = {
  onNavigate?: () => void
  activeId: string
  showContextToggle?: boolean
  sidebarOpen: boolean
  onToggleSidebar: () => void
}
