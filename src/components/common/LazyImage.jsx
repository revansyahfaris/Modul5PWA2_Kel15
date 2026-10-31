import { useEffect, useRef, useState } from 'react'

/**
 * LazyImage (Challenge 2 — Lazy load)
 * Gambar BELUM diunduh sama sekali sampai elemennya masuk ke layar.
 * Sebelum terlihat, yang tampil hanya placeholder abu-abu (skeleton).
 * Deteksi pakai IntersectionObserver, jadi bisa dibuktikan di tab Network:
 * request gambar baru muncul saat kartu di-scroll ke layar.
 */
export default function LazyImage({ src, alt, className = '', ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(
    () => typeof window !== 'undefined' && !('IntersectionObserver' in window),
  )
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px', threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  return (
    <div ref={ref} className={`lazy-img ${loaded ? 'lazy-img--loaded' : ''} ${className}`}>
      {visible && (
        <img src={src} alt={alt} onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} {...rest} />
      )}
    </div>
  )
}
