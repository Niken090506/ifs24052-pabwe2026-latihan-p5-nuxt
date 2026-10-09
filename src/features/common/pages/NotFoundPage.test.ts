import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test-utils'
import NotFoundPage from './NotFoundPage.vue'

describe('NotFoundPage', () => {
  it('renders 404 message and navigation button', () => {
    const { wrapper } = renderWithProviders(NotFoundPage)

    expect(wrapper.text()).toContain('404')
    expect(wrapper.text()).toContain('Halaman Tidak Ditemukan')
    expect(wrapper.find('a#btn-back-home-404').attributes('href')).toBe('/')
  })
})
