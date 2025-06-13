export interface NavItem {
  id: string
  labelKey: string // i18n key
  type: 'internal' | 'external' | 'modal' | 'dropdown'
  href?: string
  external?: boolean
  modal?: string
  children?: NavItem[]
  hasOwnLink?: boolean // for dropdown items that also have their own link
}

export const useNavigation = () => {
  const navItems: NavItem[] = [
    // {
    //   id: 'about',
    //   labelKey: 'nav.about',
    //   type: 'internal',
    //   href: '/about'
    // }
  ]

  return {
    navItems
  }
} 