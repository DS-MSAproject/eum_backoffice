import { useGetAdminMeQuery } from '@/api/authApi'

export default function useAdminAuth() {
  const { data: admin, isLoading, isError } = useGetAdminMeQuery()
  return {
    admin,
    isLoggedIn: !!admin && !isError,
    isLoading,
  }
}
