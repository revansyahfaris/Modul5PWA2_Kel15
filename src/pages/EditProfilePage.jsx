import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import userService from '../services/userService'

/**
 * EditProfilePage (Challenge 8) — edit nama & bio di halaman terpisah.
 */
export default function EditProfilePage({ onBack, onSaved }) {
  const profile = userService.getUserProfile()
  const [username, setUsername] = useState(profile.username || 'Shooter')
  const [bio, setBio] = useState(profile.bio || '')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Nama tidak boleh kosong.')
      return
    }
    const result = userService.saveUserProfile({
      ...userService.getUserProfile(),
      username: username.trim(),
      bio: bio.trim(),
    })
    if (result.success) onSaved?.()
    else setError('Gagal menyimpan profil.')
  }

  return (
    <div className="page form-page">
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Profile
      </button>

      <section className="masthead">
        <h1 className="display">Edit profile</h1>
        <p className="lede">Ubah nama dan bio yang tampil di profil dan review kamu.</p>
      </section>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="prof-name" className="form-label">
            Nama / Callsign <span className="req">*</span>
          </label>
          <input
            id="prof-name"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={40}
            placeholder="e.g. Operator Delta"
            className="form-input"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="prof-bio" className="form-label">Bio</label>
          <textarea
            id="prof-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            placeholder="Qualifications, preferred calibers, unit assignment..."
            rows={4}
            className="form-textarea"
          />
          <span className="form-hint">{bio.length}/200</span>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-row-actions">
          <button type="submit" className="btn btn--primary">
            <Save size={16} /> Save changes
          </button>
          <button type="button" className="btn btn--outline" onClick={onBack}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
