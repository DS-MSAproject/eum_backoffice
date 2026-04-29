import { apiSlice } from './apiSlice'

export const adminPaymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── 결제 목록 조회
    getAdminPayments: builder.query({
      query: (params = {}) => ({ url: '/admin/payments', params }),
      providesTags: [{ type: 'AdminPayment', id: 'LIST' }],
    }),

    // ── 결제-주문 정합성 검증 리포트
    getReconciliationReport: builder.query({
      query: (params = {}) => ({ url: '/admin/payments/reconciliation', params }),
      providesTags: [{ type: 'AdminPayment', id: 'RECONCILIATION' }],
    }),

    // ── 멱등성 중복 결제 의심 목록
    getIdempotencyViolations: builder.query({
      query: (params = {}) => ({ url: '/admin/payments/idempotency-violations', params }),
      providesTags: [{ type: 'AdminPayment', id: 'IDEMPOTENCY' }],
    }),

    // ── 결제 재시도 (실패 건)
    retryPayment: builder.mutation({
      query: (paymentId) => ({
        url: `/admin/payments/${paymentId}/retry`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'AdminPayment', id: 'LIST' }],
    }),

    // ── 결제 강제 취소 (보정)
    forceRefund: builder.mutation({
      query: ({ paymentId, reason }) => ({
        url: `/admin/payments/${paymentId}/force-refund`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [{ type: 'AdminPayment', id: 'LIST' }],
    }),

  }),
})

export const {
  useGetAdminPaymentsQuery,
  useGetReconciliationReportQuery,
  useGetIdempotencyViolationsQuery,
  useRetryPaymentMutation,
  useForceRefundMutation,
} = adminPaymentApi
