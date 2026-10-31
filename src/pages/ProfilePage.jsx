import { useState } from 'react'
import {
  Shield, Copy, Check, Heart, FileText, Camera, Play, Pencil,
  Archive, ArrowRight, Trash2, ShoppingCart,
} from 'lucide-react'
import userService from '../services/userService'
import { useFavorites } from '../hooks/useFavorites'
import { useArchive } from '../utils/archiveStorage'
import { useCart } from '../utils/cartStorage'
import {
  getAllDraftIds,
  loadDraft,
  deleteDraft,
  getDraftTimestamp,
  formatDraftTime,
} from '../utils/draftStorage'
import About from './About'
import Contact from './Contact'

/**
 * Baca semua draft (Challenge 5) dari localStorage.
 */
const readDrafts = () =>
  getAllDraftIds()
    .map((id) => {
      const draft = loadDraft(id) || {}
      return {
        id,
        isNew: id === 'create',
        name: draft.formData?.name?.trim() || '(Untitled hardware)',
        type: draft.formData?.type || '',
        price: draft.formData?.price,
        image: draft.uploadedImageUrl || draft.formData?.image_url || '',
        savedAt: draft.savedAt || getDraftTimestamp(id),
      }
    })
    .sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))

/**
 * ProfilePage — identitas user, statistik, draft, arsip, About & Contact.
 */
export default function ProfilePage({ onReplaySplash, onNavigate }) {
  const [profile] = useState(() => userService.getUserProfile())
  const [avatar, setAvatar] = useState(profile.avatar || null)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [drafts, setDrafts] = useState(readDrafts)

  const { favorites } = useFavorites()
  const { items: archived } = useArchive()
  const { count: cartCount } = useCart()

  const notify = (msg) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 3000)
  }

  const handleCopyId = () => {
    if (profile.userId) {
      navigator.clipboard.writeText(profile.userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      notify('Avatar image must be under 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setAvatar(base64)
      userService.updateAvatar(base64)
      notify('Avatar updated.')
    }
    reader.readAsDataURL(file)
  }

  const handleContinueDraft = (draft) => {
    if (draft.isNew) onNavigate?.('Create')
    else onNavigate?.('Edit', { id: draft.id })
  }

  const handleDeleteDraft = (draft) => {
    if (!window.confirm(`Hapus draft "${draft.name}"?`)) return
    deleteDraft(draft.id)
    setDrafts(readDrafts())
    notify('Draft deleted.')
  }

  return (
    <div className="profile-page">
      <section className="masthead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="display">Operator Profile</h1>
          <p className="lede">
            Operator credentials, drafts, archive, and shop information.
          </p>
        </div>
        {onReplaySplash && (
          <button type="button" className="btn btn--outline btn--sm" onClick={onReplaySplash} title="Replay introductory splash animation">
            <Play size={14} /> Replay Intro
          </button>
        )}
      </section>

      {feedback && (
        <div className="toast toast--success">
          <Check size={18} /> {feedback}
        </div>
      )}

      {/* Operator Card */}
      <div className="profile-card">
        <div className="profile-card-top">
          <div className="avatar-wrap">
            {avatar ? (
              <img src={avatar} alt={profile.username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <Shield size={36} stroke="var(--brass)" />
              </div>
            )}
            <label htmlFor="avatar-file-input" className="avatar-upload-btn" title="Upload avatar">
              <Camera size={14} />
              <input id="avatar-file-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden-file-input" />
            </label>
          </div>

          <div className="profile-identity">
            <h2 className="display">{profile.username || 'Shooter'}</h2>
            <p className="profile-bio">{profile.bio || 'Belum ada bio.'}</p>
            <div className="profile-id-row">
              <span className="mono-badge">{profile.userId}</span>
              <button type="button" className="icon-btn" onClick={handleCopyId} title="Copy User ID to clipboard">
                {copied ? <Check size={14} color="var(--brass)" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <button type="button" className="btn btn--outline btn--sm profile-edit-btn" onClick={() => onNavigate?.('EditProfile')}>
            <Pencil size={14} /> Edit profile
          </button>
        </div>

        <div className="profile-stats profile-stats--4">
          <div className="stat-item">
            <Heart size={20} className="stat-icon" stroke="var(--brass)" />
            <div className="stat-val">{favorites.length}</div>
            <div className="stat-label">Favorites</div>
          </div>
          <div className="stat-item">
            <FileText size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{drafts.length}</div>
            <div className="stat-label">Drafts</div>
          </div>
          <div className="stat-item">
            <Archive size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{archived.length}</div>
            <div className="stat-label">Archived</div>
          </div>
          <div className="stat-item">
            <ShoppingCart size={20} className="stat-icon" stroke="var(--brass)" />
            <div className="stat-val">{cartCount}</div>
            <div className="stat-label">In cart</div>
          </div>
        </div>
      </div>

      {/* Drafts (Challenge 5) */}
      <section className="profile-section" id="drafts">
        <h3 className="section-title"><FileText size={18} /> My drafts</h3>
        {drafts.length === 0 ? (
          <p className="muted">Belum ada draft. Draft tersimpan otomatis saat mengisi form Add / Edit Hardware.</p>
        ) : (
          <ul className="row-list">
            {drafts.map((d) => (
              <li key={d.id} className="row-item">
                {d.image ? (
                  <img src={d.image} alt="" className="cart-img" />
                ) : (
                  <div className="cart-img row-placeholder"><FileText size={20} /></div>
                )}
                <div className="row-info">
                  <span className="name display">{d.name}</span>
                  <span className="type">
                    {d.isNew ? 'New hardware' : 'Edit existing'}
                    {d.type ? ` · ${d.type}` : ''} · saved {formatDraftTime(d.savedAt)}
                  </span>
                </div>
                <div className="row-actions">
                  <button type="button" className="btn btn--primary btn--sm" onClick={() => handleContinueDraft(d)}>
                    Continue <ArrowRight size={14} />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => handleDeleteDraft(d)} aria-label="Delete draft">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Archive (Challenge 6) */}
      <section className="profile-section" id="archive">
        <h3 className="section-title"><Archive size={18} /> Archive</h3>
        <p className="muted">
          {archived.length > 0
            ? `${archived.length} produk sedang diarsipkan (soft delete).`
            : 'Belum ada produk yang diarsipkan.'}
        </p>
        <div>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => onNavigate?.('Archive')}>
            Open archive <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* About & Contact (Challenge 4) */}
      <About />
      <Contact />
    </div>
  )
}
