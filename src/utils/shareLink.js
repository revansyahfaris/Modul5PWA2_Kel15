/**
 * Tautan unik untuk satu produk, contoh: https://domain.vercel.app/?gun=12
 * Saat dibuka, App membaca parameter ?gun= dan langsung menampilkan detailnya.
 */
export const getGunShareUrl = (gun) =>
  `${window.location.origin}/?gun=${encodeURIComponent(gun.id)}`
