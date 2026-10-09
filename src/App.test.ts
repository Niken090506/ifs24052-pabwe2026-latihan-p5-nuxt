import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App', () => {
  it('renders root element and RouterView', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: '<div data-testid="router-view-stub"></div>' }
        }
      }
    })

    expect(wrapper.find('div#app').exists()).toBe(true)
    expect(wrapper.find('[data-testid="router-view-stub"]').exists()).toBe(true)
  })
})
