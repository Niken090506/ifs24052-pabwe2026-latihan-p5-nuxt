import Swal from 'sweetalert2'

export async function showSuccessDialog(message: string, title: string = 'Berhasil!'): Promise<void> {
  await Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#0284c7',
    timer: 2500,
    timerProgressBar: true
  })
}

export async function showErrorDialog(message: string, title: string = 'Gagal!'): Promise<void> {
  await Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#ef4444'
  })
}

export async function showConfirmDialog(
  message: string,
  title: string = 'Konfirmasi',
  confirmText: string = 'Ya, Lanjutkan',
  cancelText: string = 'Batal'
): Promise<boolean> {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    reverseButtons: true
  })
  return Boolean(result.isConfirmed)
}

export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return 'Rp 0'
  }
  const numericAmount = typeof amount === 'string' ? Number(amount.replace(/[^0-9.-]+/g, '')) : amount
  if (isNaN(numericAmount)) {
    return 'Rp 0'
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(numericAmount)
}

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export default {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
  formatDateTime
}
