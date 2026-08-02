// Route constants for better organization
export const ROUTES = {
  HOME: '/dashboard',
  ADMIN: '/admin',
  LOGIN: '/login',
  RECIPES: '/search',
  ACCOUNT: '/profile'
} as const

export type ValidRoute = typeof ROUTES[keyof typeof ROUTES]

export const userNavs = [
  {
    route: ROUTES.HOME,
    icon: 'home-outline'
  },
  {
    route: ROUTES.ADMIN,
    icon: 'copy'
  },
  {
    route: ROUTES.RECIPES,
    icon: 'book-outline'
  },
  {
    route: ROUTES.ACCOUNT,
    icon: 'person-outline'
  }
]


// Storage keys
export const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  ACCESS_TOKEN: 'token'
}