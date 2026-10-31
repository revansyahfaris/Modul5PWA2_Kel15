import { createLocalStore } from './localStore'

// ---------------------------------------------------------------------------
// Keranjang belanja (Challenge 9) — disimpan di localStorage.
// Bentuk item: { id, name, type, caliber, price, image_url, qty }
// ---------------------------------------------------------------------------
const cartStore = createLocalStore('bore_barrel_cart', [])

export const addToCart = (gun, qty = 1) =>
  cartStore.set((items) => {
    const existing = items.find((i) => String(i.id) === String(gun.id))
    if (existing) {
      return items.map((i) =>
        String(i.id) === String(gun.id) ? { ...i, qty: i.qty + qty } : i,
      )
    }
    return [
      ...items,
      {
        id: gun.id,
        name: gun.name,
        type: gun.type || gun.category || '',
        caliber: gun.caliber || '',
        price: Number(gun.price ?? gun.cook_time ?? 0),
        image_url: gun.image_url || gun.image || '/guns/pistol.svg',
        qty,
      },
    ]
  })

export const setCartQty = (id, qty) =>
  cartStore.set((items) =>
    qty <= 0
      ? items.filter((i) => String(i.id) !== String(id))
      : items.map((i) => (String(i.id) === String(id) ? { ...i, qty } : i)),
  )

export const removeFromCart = (id) =>
  cartStore.set((items) => items.filter((i) => String(i.id) !== String(id)))

export const clearCart = () => cartStore.set([])

export const useCart = () => {
  const items = cartStore.useStore()
  const count = items.reduce((sum, i) => sum + i.qty, 0)
  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0)
  return { items, count, total }
}
