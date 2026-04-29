import { apiSlice } from './apiSlice'

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: '/admin/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: [{ type: 'Auth', id: 'ME' }],
    }),

    adminLogout: builder.mutation({
      query: () => ({ url: '/admin/auth/logout', method: 'POST' }),
      invalidatesTags: [{ type: 'Auth', id: 'ME' }],
    }),

    getAdminMe: builder.query({
      query: () => '/admin/auth/me',
      providesTags: [{ type: 'Auth', id: 'ME' }],
    }),

  }),
})

export const {
  useAdminLoginMutation,
  useAdminLogoutMutation,
  useGetAdminMeQuery,
} = authApi
