import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { getGunShareUrl } from '../../utils/shareLink'

/**
 * ShareButton (Challenge 1) — pakai Web Share API (menu share bawaan HP)
 * bila tersedia, jika tidak salin tautan ke clipboard.
 */
export default function ShareButton({ gun, variant = 'button' }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e) => {
    e.stopPropagation()
    const url = getGunShareUrl(gun)
    const shareData = {
      title: `${gun.name} — Bore & Barrel`,
      text: `Cek ${gun.name} di Bore & Barrel`,
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return // user menutup menu share
    }

    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Salin tautan ini:', url)
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className="card-act-btn"
        onClick={handleShare}
        aria-label={`Share ${gun.name}`}
        title={copied ? 'Link copied!' : 'Share link'}
      >
        {copied ? <Check size={16} color="var(--brass)" /> : <Share2 size={16} />}
      </button>
    )
  }

  return (
    <button type="button" className="btn btn--outline" onClick={handleShare}>
      {copied ? <><Check size={16} /> Link copied</> : <><Share2 size={16} /> Share</>}
    </button>
  )
}
