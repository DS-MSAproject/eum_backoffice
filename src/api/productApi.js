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

    // ── 상품 이미지 S3 업로드 → { imageUrl } 반환
    uploadProductImage: builder.mutation({
      query: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return { url: '/admin/products/image-upload', method: 'POST', body: formData }
      },
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

    // ── 카테고리 목록 (등록 폼용) — 백엔드: GET /product/categories (트리 구조)
    getCategories: builder.query({
      query: () => ({ url: '/product/categories' }),
      providesTags: [{ type: 'Category', id: 'LIST' }],
      // 트리 → 평탄화: 부모 + 자식 모두 선택 가능하게
      transformResponse: (res) => {
        const flat = []
        const flatten = (nodes, prefix = '') => {
          nodes.forEach((node) => {
            flat.push({ categoryId: node.categoryId, categoryName: prefix ? `${prefix} > ${node.name}` : node.name })
            if (node.children?.length) flatten(node.children, node.name)
          })
        }
        flatten(Array.isArray(res) ? res : [])
        return flat
      },
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
  useUploadProductImageMutation,
  useGetCategoriesQuery,
} = adminProductApi
