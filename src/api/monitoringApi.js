import { apiSlice } from './apiSlice'

export const adminMonitoringApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── 서비스 헬스 현황 (Actuator 집계)
    getServicesHealth: builder.query({
      query: () => ({ url: '/admin/monitoring/health' }),
      providesTags: [{ type: 'AdminService', id: 'HEALTH' }],
    }),

    // ── 대시보드 요약 통계
    getDashboardSummary: builder.query({
      query: () => ({ url: '/admin/dashboard/summary' }),
      providesTags: [{ type: 'AdminMonitoring', id: 'SUMMARY' }],
    }),

  }),
})

export const {
  useGetServicesHealthQuery,
  useGetDashboardSummaryQuery,
} = adminMonitoringApi
