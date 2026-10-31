import { createLocalStore } from './localStore'

// ---------------------------------------------------------------------------
// Soft delete / Arsip (Challenge 6).
// Menghapus produk TIDAK langsung menghapus dari database, tapi memindahkan
// produk ke arsip (disimpan snapshot-nya beserta waktu diarsipkan).
// Produk yang diarsip disembunyikan dari katalog & favorit, dan dari halaman
// Arsip bisa di-restore atau dihapus permanen (hard delete ke API).
//
// Catatan: database Supabase praktikum dipakai bersama dan strukturnya tidak
// bisa diubah (tidak ada kolom deleted_at), sehingga status arsip disimpan
// di localStorage browser.
// ---------------------------------------------------------------------------
const archiveStore = createLocalStore('bore_barrel_archive', [])

export const archiveGun = (gun) =>
  archiveStore.set((items) => [
    { ...gun, archivedAt: new Date().toISOString() },
    ...items.filter((i) => String(i.id) !== String(gun.id)),
  ])

export const restoreGun = (id) =>
  archiveStore.set((items) => items.filter((i) => String(i.id) !== String(id)))

export const useArchive = () => {
  const items = archiveStore.useStore()
  const archivedIds = new Set(items.map((i) => String(i.id)))
  return { items, archivedIds, isArchived: (id) => archivedIds.has(String(id)) }
}
