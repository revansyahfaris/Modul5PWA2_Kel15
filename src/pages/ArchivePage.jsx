import { useState } from 'react'
import { ArrowLeft, Archive, RotateCcw, Trash2 } from 'lucide-react'
import { useArchive, restoreGun } from '../utils/archiveStorage'
import gunService from '../services/gunService'
import ConfirmModal from '../components/modals/ConfirmModal'
import { formatPrice } from '../utils/helpers'

/**
 * ArchivePage (Challenge 6) — daftar produk yang di-soft delete.
 * Restore → muncul lagi di katalog. Delete permanently → hard delete ke API.
 */
export default function ArchivePage({ onBack }) {
  const { items } = useArchive()
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')

  const notify = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handlePermanentDelete = async () => {
    if (!target) return
    try {
      setDeleting(true)
      if (!String(target.id).startsWith('local-')) {
        await gunService.deleteGun(target.id)
      }
      restoreGun(target.id) // keluarkan dari daftar arsip
      notify(`"${target.name}" dihapus permanen.`)
      setTarget(null)
    } catch (err) {
      notify(err.message || 'Gagal menghapus permanen.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Profile
      </button>

      <section className="masthead">
        <h1 className="display">Archive</h1>
        <p className="lede">
          Produk yang dihapus masuk ke sini dulu (soft delete). Restore untuk
          menampilkannya lagi, atau hapus permanen dari database.
        </p>
      </section>

      {message && <div className="toast toast--success">{message}</div>}

      {items.length === 0 ? (
        <div className="state-box">
          <Archive size={28} />
          <p>Arsip kosong.</p>
        </div>
      ) : (
        <ul className="row-list">
          {items.map((g) => (
            <li key={g.id} className="row-item">
              <img src={g.image_url || g.image || '/guns/pistol.svg'} alt={g.name} className="cart-img" />
              <div className="row-info">
                <span className="name display">{g.name}</span>
                <span className="type">
                  {g.type || g.category} · {formatPrice(g.price)} · diarsipkan{' '}
                  {new Date(g.archivedAt).toLocaleString()}
                </span>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn--outline btn--sm" onClick={() => { restoreGun(g.id); notify(`"${g.name}" dikembalikan ke katalog.`) }}>
                  <RotateCcw size={14} /> Restore
                </button>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => setTarget(g)}>
                  <Trash2 size={14} /> Delete permanently
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={Boolean(target)}
        title="Delete Permanently"
        message={`Hapus "${target?.name}" secara permanen dari database? Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Delete permanently"
        danger
        loading={deleting}
        onConfirm={handlePermanentDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  )
}
