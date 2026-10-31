import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

// ---------------------------------------------------------------------------
// Query Caching (Challenge 3)
// Satu QueryClient global. Hasil fetch disimpan di cache memori:
//  - staleTime 60 dtk  → selama 1 menit data dianggap segar, pindah halaman
//                         tidak memicu request ulang ke Supabase.
//  - gcTime 10 menit   → cache yang tidak dipakai dibuang setelah 10 menit.
//  - Cache juga disimpan ke localStorage (persister), jadi walaupun halaman
//    di-reload, data masih diambil dari cache selama belum lewat 1 menit.
// Setelah create / update / delete, service memanggil invalidateQueries
// supaya cache yang terkait di-refresh.
// ---------------------------------------------------------------------------
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000, // harus >= maxAge persister
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const queryKeys = {
  guns: (params) => ['guns', params],
  gun: (id) => ['gun', String(id)],
  reviews: (gunId) => ['reviews', String(gunId)],
}

export const invalidateGuns = () => {
  queryClient.invalidateQueries({ queryKey: ['guns'] })
  queryClient.invalidateQueries({ queryKey: ['gun'] })
}

export const invalidateReviews = (gunId) =>
  queryClient.invalidateQueries({
    queryKey: gunId ? queryKeys.reviews(gunId) : ['reviews'],
  })

export const queryPersister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'bore_barrel_query_cache',
})

export const persistOptions = {
  persister: queryPersister,
  maxAge: 24 * 60 * 60 * 1000,
  buster: 'v1',
}
