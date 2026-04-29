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

let isRefreshing = false

const baseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra)
  const url = typeof args === 'string' ? args : args?.url ?? ''

  if (result.error?.status === 401 && !url.includes('/admin/auth/me') && !url.includes('/admin/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true
      const refreshResult = await rawBaseQuery(
        { url: '/admin/auth/refresh', method: 'POST' },
        api,
        extra,
      )
      isRefreshing = false

      if (refreshResult.data) {
        return rawBaseQuery(args, api, extra)
      }
    }
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
    'ProductSales',
    'AdminPayment',
    'AdminInventory',
    'AdminEvent',
    'AdminMonitoring',
    'AdminOutbox',
    'AdminService',
    'AdminUser',
  ],
  endpoints: () => ({}),
})
