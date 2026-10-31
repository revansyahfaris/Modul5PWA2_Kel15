import { useQuery } from '@tanstack/react-query'
import gunService from '../services/gunService'
import { queryKeys } from '../lib/queryClient'

// ---------------------------------------------------------------------------
// useGuns — daftar produk, memakai TanStack Query (Query Caching).
// Data disimpan di cache dengan key ['guns', params]; komponen lain yang
// memakai params sama langsung mendapat data dari cache tanpa request baru.
//
// Returns { guns, loading, fetching, error, pagination, refetch, updatedAt }.
// ---------------------------------------------------------------------------

export function useGuns(params = {}) {
  const query = useQuery({
    queryKey: queryKeys.guns(params),
    queryFn: async () => {
      const response = await gunService.getGuns(params)
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch products.')
      }
      return response
    },
  })

  return {
    guns: query.data?.data || [],
    pagination: query.data?.pagination || null,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error
      ? query.error.message || 'An error occurred while fetching products.'
      : null,
    updatedAt: query.dataUpdatedAt,
    refetch: query.refetch,
  }
}

// ---------------------------------------------------------------------------
// useGunById — satu produk berdasarkan id (dipakai juga oleh share link).
// ---------------------------------------------------------------------------

export function useGunById(id) {
  const query = useQuery({
    queryKey: queryKeys.gun(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await gunService.getGunById(id)
      if (!response.success) throw new Error(response.message || 'Product not found.')
      return response.data
    },
  })

  return {
    gun: query.data || null,
    loading: query.isLoading,
    error: query.error ? query.error.message || 'Failed to load product details.' : null,
    refetch: query.refetch,
  }
}
