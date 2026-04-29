import { apiSlice } from './apiSlice'

export const adminInventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── 재고 현황 목록
    getInventoryStatus: builder.query({
      query: (params = {}) => ({ url: '/admin/inventory', params }),
      providesTags: [{ type: 'AdminInventory', id: 'LIST' }],
    }),

    // ── 재고 변경 이벤트 이력 (Trace ID / 상품 ID 기반)
    getInventoryEventHistory: builder.query({
      query: (params = {}) => ({ url: '/admin/inventory/events', params }),
      providesTags: [{ type: 'AdminEvent', id: 'INVENTORY' }],
    }),

    // ── 재고 이벤트 지연 알림 목록 (처리 지연 감지)
    getInventoryLagAlerts: builder.query({
      query: () => ({ url: '/admin/inventory/lag-alerts' }),
      providesTags: [{ type: 'AdminInventory', id: 'LAG_ALERTS' }],
    }),

    // ── 특정 상품 재고 이벤트 추적 (Trace ID 기반)
    traceInventoryByProduct: builder.query({
      query: ({ productId, ...params }) => ({
        url: `/admin/inventory/products/${productId}/trace`,
        params,
      }),
      providesTags: (result, error, { productId }) => [
        { type: 'AdminEvent', id: `TRACE_${productId}` },
      ],
    }),

  }),
})

export const {
  useGetInventoryStatusQuery,
  useGetInventoryEventHistoryQuery,
  useGetInventoryLagAlertsQuery,
  useTraceInventoryByProductQuery,
  useLazyTraceInventoryByProductQuery,
} = adminInventoryApi
