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
  if (result.error?.status === 401) api.dispatch({ type: 'auth/logout' })
  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Auth',
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
