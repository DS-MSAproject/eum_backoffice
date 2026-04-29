export const formatPrice = (amount) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount ?? 0)

export const formatDate = (iso) => {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso))
}

export const formatDateShort = (iso) => {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export const formatNumber = (n) =>
  new Intl.NumberFormat('ko-KR').format(n ?? 0)

export const statusLabel = {
  PENDING: '대기',
  PROCESSING: '처리중',
  COMPLETED: '완료',
  FAILED: '실패',
  CANCELLED: '취소',
  REFUNDED: '환불',
  PAID: '결제완료',
  SHIPPED: '배송중',
  DELIVERED: '배송완료',
}

export const getStatusLabel = (status) => statusLabel[status] ?? status
