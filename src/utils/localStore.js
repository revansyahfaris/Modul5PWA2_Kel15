import { useSyncExternalStore } from 'react'

// ---------------------------------------------------------------------------
// createLocalStore — state kecil yang disimpan di localStorage dan bisa
// di-subscribe banyak komponen sekaligus (mis. badge keranjang di Header
// ikut berubah saat item ditambah dari GunCard).
// ---------------------------------------------------------------------------
export function createLocalStore(key, initialValue) {
  const listeners = new Set()

  const read = () => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  }

  let snapshot = read()

  const set = (updater) => {
    snapshot = typeof updater === 'function' ? updater(snapshot) : updater
    try {
      localStorage.setItem(key, JSON.stringify(snapshot))
    } catch {
      /* storage penuh / private mode — tetap simpan di memori */
    }
    listeners.forEach((l) => l())
  }

  const subscribe = (listener) => {
    listeners.add(listener)
    const onStorage = (e) => {
      if (e.key === key) {
        snapshot = read()
        listener()
      }
    }
    window.addEventListener('storage', onStorage) // sinkron antar-tab
    return () => {
      listeners.delete(listener)
      window.removeEventListener('storage', onStorage)
    }
  }

  const get = () => snapshot
  const useStore = () => useSyncExternalStore(subscribe, get, get)

  return { get, set, subscribe, useStore }
}
