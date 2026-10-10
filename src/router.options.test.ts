import { describe, it, expect } from 'vitest'
import { routerConfig } from './router.options'
import appRouterConfigDefault, { routerConfig as appRouterConfig } from './app/router.options'
import routes from './routes'

describe('router.options', () => {
  it('provides routerConfig returning custom routes', () => {
    expect(typeof routerConfig.routes).toBe('function')
    const resolvedRoutes = routerConfig.routes!([])
    expect(resolvedRoutes).toEqual(routes)
    expect(appRouterConfigDefault).toBe(routerConfig)
    expect(appRouterConfig).toBe(routerConfig)
  })

  it('declares all expected route paths', () => {
    const paths = routes.map((r) => r.path)
    expect(paths).toContain('/auth')
    expect(paths).toContain('/')
    expect(paths).toContain('/:pathMatch(.*)*')

    const authRoute = routes.find((r) => r.path === '/auth')
    expect(authRoute?.children?.map((c) => c.path)).toContain('login')
    expect(authRoute?.children?.map((c) => c.path)).toContain('register')

    const dashboardRoute = routes.find((r) => r.path === '/')
    expect(dashboardRoute?.children?.map((c) => c.path)).toContain('')
    expect(dashboardRoute?.children?.map((c) => c.path)).toContain('cash-flows/:cashFlowId')
    expect(dashboardRoute?.children?.map((c) => c.path)).toContain('users')
    expect(dashboardRoute?.children?.map((c) => c.path)).toContain('profile')
  })

  it('resolves all dynamic component imports in route definitions', async () => {
    for (const route of routes) {
      if (typeof route.component === 'function') {
        const mod = await (route.component as Function)()
        expect(mod.default).toBeDefined()
      }
      if (route.children) {
        for (const child of route.children) {
          if (typeof child.component === 'function') {
            const mod = await (child.component as Function)()
            expect(mod.default).toBeDefined()
          }
        }
      }
    }
  })
})
