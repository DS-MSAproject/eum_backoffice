import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const getCsrfToken = () => {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:8072/api/v1',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const csrf = getCsrfToken()
    if (csrf) headers.set('X-XSRF-TOKEN', csrf)
    return headers
  },
})

const baseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra)
  // getAdminMe 는 AdminProtectedRoute 에서 isError 로 처리하므로 제외.
  // 그 외 401 은 이미 로그인된 상태에서 세션이 만료된 것이므로 logout 처리.
  const url = typeof args === 'string' ? args : args?.url ?? ''
  if (result.error?.status === 401 && !url.includes('/admin/auth/me')) {
    api.dispatch({ type: 'auth/logout' })
  }
  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Auth',
    'AdminProduct',
    'Category',
    'AdminOrder',
    'AdminPayment',
    'AdminInventory',
    'AdminEvent',
    'AdminMonitoring',
    'AdminOutbox',
    'AdminKafka',
    'AdminService',
    'AdminLog',
    'AuditLog',
  ],
  endpoints: () => ({}),
})
