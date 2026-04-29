import { apiSlice } from './apiSlice'

export const adminOrderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── 주문 목록 조회 (필터·페이지)
    getAdminOrders: builder.query({
      query: (params = {}) => ({ url: '/admin/orders', params }),
      providesTags: [{ type: 'AdminOrder', id: 'LIST' }],
    }),

    // ── 주문 상태 불일치 목록 (결제 서비스와 상태 비교)
    getOrderInconsistencies: builder.query({
      query: (params = {}) => ({ url: '/admin/orders/inconsistencies', params }),
      providesTags: [{ type: 'AdminOrder', id: 'INCONSISTENCIES' }],
    }),

    // ── Outbox 미발행 이벤트 목록
    getOutboxPendingEvents: builder.query({
      query: (params = {}) => ({ url: '/admin/outbox/pending', params }),
      providesTags: [{ type: 'AdminOutbox', id: 'LIST' }],
    }),

    // ── Outbox 이벤트 수동 재처리
    retryOutboxEvent: builder.mutation({
      query: (eventId) => ({
        url: `/admin/outbox/${eventId}/retry`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'AdminOutbox', id: 'LIST' },
        { type: 'AdminOrder', id: 'INCONSISTENCIES' },
      ],
    }),

    // ── 보상 트랜잭션 수동 실행
    applyCompensation: builder.mutation({
      query: ({ orderId, action }) => ({
        url: `/admin/orders/${orderId}/compensate`,
        method: 'POST',
        body: { action },
      }),
      invalidatesTags: [{ type: 'AdminOrder', id: 'LIST' }],
    }),

  }),
})

export const {
  useGetAdminOrdersQuery,
  useGetOrderInconsistenciesQuery,
  useGetOutboxPendingEventsQuery,
  useRetryOutboxEventMutation,
  useApplyCompensationMutation,
} = adminOrderApi
