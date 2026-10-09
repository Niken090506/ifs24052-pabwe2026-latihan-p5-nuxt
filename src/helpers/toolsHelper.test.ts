import { describe, it, expect, vi } from 'vitest'
import Swal from 'sweetalert2'
import toolsHelperDefault, {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
  formatDateTime
} from './toolsHelper'

describe('toolsHelper', () => {
  describe('Dialogs', () => {
    it('calls Swal.fire for showSuccessDialog', async () => {
      const swalSpy = vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true } as any)
      await showSuccessDialog('Berhasil menyimpan data')
      expect(swalSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'success',
          text: 'Berhasil menyimpan data'
        })
      )
    })

    it('calls Swal.fire for showErrorDialog', async () => {
      const swalSpy = vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true } as any)
      await showErrorDialog('Terjadi error')
      expect(swalSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'error',
          text: 'Terjadi error'
        })
      )
    })

    it('calls Swal.fire for showConfirmDialog returning true when confirmed', async () => {
      vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true } as any)
      const confirmed = await showConfirmDialog('Yakin hapus?')
      expect(confirmed).toBe(true)
    })

    it('calls Swal.fire for showConfirmDialog returning false when dismissed', async () => {
      vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: false } as any)
      const confirmed = await showConfirmDialog('Yakin hapus?')
      expect(confirmed).toBe(false)
    })
  })

  describe('formatRupiah', () => {
    it('formats numeric values into Rupiah string', () => {
      const result = formatRupiah(1500000)
      expect(result).toMatch(/Rp\s?1\.500\.000/)
    })

    it('formats string numbers into Rupiah', () => {
      const result = formatRupiah('500000')
      expect(result).toMatch(/Rp\s?500\.000/)
    })

    it('returns Rp 0 for null, undefined, empty, or NaN inputs', () => {
      expect(formatRupiah(null)).toBe('Rp 0')
      expect(formatRupiah(undefined)).toBe('Rp 0')
      expect(formatRupiah('')).toBe('Rp 0')
      expect(formatRupiah('invalid-number')).toBe('Rp 0')
    })
  })

  describe('formatDate', () => {
    it('formats valid date string into Indonesian format', () => {
      const formatted = formatDate('2024-10-05T12:00:00Z')
      expect(formatted).not.toBe('-')
      expect(formatted).toMatch(/2024/)
    })

    it('returns dash for null, undefined, or invalid date inputs', () => {
      expect(formatDate(null)).toBe('-')
      expect(formatDate(undefined)).toBe('-')
      expect(formatDate('invalid-date')).toBe('-')
    })
  })

  describe('formatDateTime', () => {
    it('formats valid date and time string', () => {
      const formatted = formatDateTime('2024-10-05T12:00:00Z')
      expect(formatted).not.toBe('-')
      expect(formatted).toMatch(/2024/)
    })

    it('returns dash for null, undefined, or invalid date inputs', () => {
      expect(formatDateTime(null)).toBe('-')
      expect(formatDateTime(undefined)).toBe('-')
      expect(formatDateTime('invalid-datetime')).toBe('-')
    })
  })

  describe('default export', () => {
    it('exports all utility functions', () => {
      expect(toolsHelperDefault.showSuccessDialog).toBe(showSuccessDialog)
      expect(toolsHelperDefault.showErrorDialog).toBe(showErrorDialog)
      expect(toolsHelperDefault.showConfirmDialog).toBe(showConfirmDialog)
      expect(toolsHelperDefault.formatRupiah).toBe(formatRupiah)
      expect(toolsHelperDefault.formatDate).toBe(formatDate)
      expect(toolsHelperDefault.formatDateTime).toBe(formatDateTime)
    })
  })
})
