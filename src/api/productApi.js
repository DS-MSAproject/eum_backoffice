import { apiSlice } from './apiSlice'

export const adminProductApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── 상품 목록 (lifecycleStatus 필터)
    getAdminProducts: builder.query({
      query: (params = {}) => ({ url: '/admin/products', params }),
      providesTags: [{ type: 'AdminProduct', id: 'LIST' }],
    }),

    // ── 상품 상세
    getAdminProductDetail: builder.query({
      query: (productId) => ({ url: `/admin/products/${productId}` }),
      providesTags: (result, error, id) => [{ type: 'AdminProduct', id }],
    }),

    // ── 상품 등록
    createAdminProduct: builder.mutation({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'AdminProduct', id: 'LIST' }],
    }),

    // ── 상품 수정
    updateAdminProduct: builder.mutation({
      query: ({ productId, ...body }) => ({
        url: `/admin/products/${productId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'AdminProduct', id: 'LIST' },
        { type: 'AdminProduct', id: productId },
      ],
    }),

    // ── 상품 삭제
    deleteAdminProduct: builder.mutation({
      query: (productId) => ({ url: `/admin/products/${productId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'AdminProduct', id: 'LIST' }],
    }),

    // ── 라이프사이클 상태 전이
    transitionProductStatus: builder.mutation({
      query: ({ productId, ...body }) => ({
        url: `/admin/products/${productId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'AdminProduct', id: 'LIST' },
        { type: 'AdminProduct', id: productId },
      ],
    }),

    // ── CSV 대량 업로드
    bulkUploadProducts: builder.mutation({
      query: (formData) => ({
        url: '/admin/products/bulk-upload',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: [{ type: 'AdminProduct', id: 'LIST' }],
    }),

    // ── 카테고리 목록 (등록 폼용)
    getCategories: builder.query({
      query: () => ({ url: '/category/list' }),
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

  }),
})

export const {
  useGetAdminProductsQuery,
  useGetAdminProductDetailQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useTransitionProductStatusMutation,
  useBulkUploadProductsMutation,
  useGetCategoriesQuery,
} = adminProductApi
