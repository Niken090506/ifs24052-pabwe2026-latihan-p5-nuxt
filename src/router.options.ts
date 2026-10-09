import type { RouterConfig } from '@nuxt/schema'
import routes from './routes'

export const routerConfig: RouterConfig = {
  routes: (_routes) => routes
}

export default routerConfig
