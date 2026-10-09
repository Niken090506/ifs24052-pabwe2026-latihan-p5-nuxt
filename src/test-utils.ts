import { mount, flushPromises, type MountingOptions } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
export { flushPromises, nextTick }

export function createMockPinia(): Pinia {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

const dummyComponent = { template: '<div></div>' }

export const testRoutes = [
  { path: '/', component: dummyComponent },
  {
    path: '/auth',
    component: dummyComponent,
    children: [
      { path: 'login', component: dummyComponent },
      { path: 'register', component: dummyComponent }
    ]
  },
  { path: '/cash-flows/:cashFlowId', component: dummyComponent },
  { path: '/users', component: dummyComponent },
  { path: '/profile', component: dummyComponent },
  { path: '/:pathMatch(.*)*', component: dummyComponent }
]

export function createTestRouter(initialRoute: string = '/', routes = testRoutes): Router {
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })
  router.push(initialRoute)
  return router
}

export interface RenderWithProvidersOptions extends MountingOptions<any> {
  pinia?: Pinia
  router?: Router
  initialRoute?: string
}

export function renderWithProviders(
  component: any,
  options: RenderWithProvidersOptions = {}
) {
  const pinia = options.pinia || createMockPinia()
  const router = options.router || createTestRouter(options.initialRoute || '/')

  const plugins = [pinia, router, ...(options.global?.plugins || [])]

  const wrapper = mount(component, {
    ...options,
    global: {
      ...options.global,
      plugins,
      stubs: {
        NuxtPage: { template: '<div><slot /></div>' },
        NuxtLink: {
          props: ['to'],
          template: '<a :href="to"><slot /></a>'
        },
        ...(options.global?.stubs || {})
      }
    }
  })

  return {
    wrapper,
    pinia,
    router
  }
}

export default {
  createMockPinia,
  createTestRouter,
  renderWithProviders,
  flushPromises,
  nextTick
}
