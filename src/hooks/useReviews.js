import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import reviewService from '../services/reviewService'
import { queryKeys } from '../lib/queryClient'

// ---------------------------------------------------------------------------
// useReviews — review untuk satu produk (di-cache per produk).
// ---------------------------------------------------------------------------

export function useReviews(gunId) {
  const query = useQuery({
    queryKey: queryKeys.reviews(gunId),
    enabled: Boolean(gunId) && !String(gunId).startsWith('local-'),
    queryFn: async () => {
      const response = await reviewService.getReviews(gunId)
      if (!response.success) throw new Error(response.message || 'Failed to fetch reviews.')
      return response.data || []
    },
  })

  return {
    reviews: query.data || [],
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  }
}

// ---------------------------------------------------------------------------
// useReviewActions — create / update / delete review (CRUD, Challenge 7).
// ---------------------------------------------------------------------------

export function useReviewActions(gunId) {
  const [loading, setLoading] = useState(false)

  const run = async (fn) => {
    setLoading(true)
    try {
      return await fn()
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    createReview: (data) => run(() => reviewService.createReview(gunId, data)),
    updateReview: (reviewId, data) => run(() => reviewService.updateReview(reviewId, data, gunId)),
    deleteReview: (reviewId, userId) => run(() => reviewService.deleteReview(reviewId, gunId, userId)),
  }
}

// Kompatibilitas dengan kode lama
export function useCreateReview() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createReview = async (gunId, reviewData) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const response = await reviewService.createReview(gunId, reviewData)
      setSuccess(true)
      return response.data
    } catch (err) {
      setError(err.message || 'An error occurred while submitting review.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createReview, loading, error, success }
}
