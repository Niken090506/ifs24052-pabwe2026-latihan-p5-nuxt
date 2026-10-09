import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test-utils'
import AuthLayout from './AuthLayout.vue'

describe('AuthLayout', () => {
  it('renders brand header, description, and footer', () => {
    const { wrapper } = renderWithProviders(AuthLayout)

    expect(wrapper.text()).toContain('Delcom Cash Flow')
    expect(wrapper.text()).toContain('Platform Manajemen Keuangan & Arus Kas Pribadi')
    expect(wrapper.text()).toContain('2026 Delcom Cash Flow')
  })

  it('renders custom slot content', () => {
    const { wrapper } = renderWithProviders(AuthLayout, {
      slots: {
        default: '<div data-testid="custom-auth-slot">Formulir Khusus</div>'
      }
    })

    expect(wrapper.find('[data-testid="custom-auth-slot"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Formulir Khusus')
  })
})
