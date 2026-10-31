import { Loader, AlertCircle, ArrowLeft } from 'lucide-react'
import { useGunById } from '../../hooks/useGuns'
import GunDetail from './GunDetail'

/**
 * Dipakai saat halaman dibuka dari share link (?gun=<id>):
 * data produk diambil dulu berdasarkan id, lalu ditampilkan di GunDetail.
 */
export default function GunDetailLoader({ id, ...props }) {
  const { gun, loading, error } = useGunById(id)

  if (loading) {
    return (
      <div className="state-box">
        <Loader size={28} className="spin" />
        <p>Loading shared hardware…</p>
      </div>
    )
  }

  if (error || !gun) {
    return (
      <div className="state-box state-box--error">
        <AlertCircle size={28} />
        <p>{error || 'Produk tidak ditemukan.'}</p>
        <button type="button" className="btn btn--outline" onClick={props.onBack}>
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>
    )
  }

  return <GunDetail gun={gun} {...props} />
}
