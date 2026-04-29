import { apiSlice } from './apiSlice'

export const adminMonitoringApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── 서비스 헬스 현황 (Actuator 집계)
    getServicesHealth: builder.query({
      query: () => ({ url: '/admin/monitoring/health' }),
      providesTags: [{ type: 'AdminService', id: 'HEALTH' }],
    }),

    // ── Kafka 컨슈머 그룹 오프셋 랙
    getKafkaConsumerLag: builder.query({
      query: () => ({ url: '/admin/monitoring/kafka/consumer-lag' }),
      providesTags: [{ type: 'AdminKafka', id: 'LAG' }],
    }),

    // ── ELK 로그 검색 (orderId / traceId / service / level / 시간 범위)
    searchLogs: builder.query({
      query: (params = {}) => ({ url: '/admin/monitoring/logs/search', params }),
      providesTags: [{ type: 'AdminLog', id: 'SEARCH' }],
    }),

    // ── 특정 주문 전체 서비스 로그 타임라인
    getOrderLogTimeline: builder.query({
      query: (orderId) => ({ url: `/admin/monitoring/logs/order/${orderId}/timeline` }),
      providesTags: (result, error, orderId) => [
        { type: 'AdminLog', id: `ORDER_${orderId}` },
      ],
    }),

    // ── 감사 로그 (관리자 작업 이력)
    getAuditLogs: builder.query({
      query: (params = {}) => ({ url: '/admin/audit-logs', params }),
      providesTags: [{ type: 'AuditLog', id: 'LIST' }],
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
  useGetKafkaConsumerLagQuery,
  useSearchLogsQuery,
  useLazySearchLogsQuery,
  useGetOrderLogTimelineQuery,
  useLazyGetOrderLogTimelineQuery,
  useGetAuditLogsQuery,
  useGetDashboardSummaryQuery,
} = adminMonitoringApi
