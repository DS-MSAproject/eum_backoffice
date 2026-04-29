import { apiSlice } from './apiSlice'

export const adminUserApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getAdminUsers: builder.query({
      query: (params = {}) => ({ url: '/admin/users', params }),
      providesTags: [{ type: 'AdminUser', id: 'LIST' }],
    }),

    getAdminUser: builder.query({
      query: (userId) => ({ url: `/admin/users/${userId}` }),
      providesTags: (result, error, id) => [{ type: 'AdminUser', id }],
    }),

  }),
})

export const { useGetAdminUsersQuery, useGetAdminUserQuery } = adminUserApi
