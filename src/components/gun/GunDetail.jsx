import { useState } from 'react'
import {
  ArrowLeft, Star, Send, Loader, ShoppingCart, Check, Archive,
  ThumbsUp, ThumbsDown, Pencil, Trash2, X,
} from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import ShareButton from '../common/ShareButton'
import { useReviews, useReviewActions } from '../../hooks/useReviews'
import { getUserIdentifier, getUserProfile } from '../../services/userService'
import { addToCart } from '../../utils/cartStorage'
import { toggleVote, useReviewVotes } from '../../utils/reviewVotes'
import { formatPrice, averageRating } from '../../utils/helpers'

function StarPicker({ value, onChange, size = 22 }) {
  return (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="star-btn"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            fill={n <= value ? 'var(--brass)' : 'none'}
            stroke={n <= value ? 'var(--brass)' : 'var(--steel)'}
          />
        </button>
      ))}
    </div>
  )
}

/**
 * Full-screen product detail view.
 *
 * @param {Object}   props
 * @param {Object}   props.gun       — product data
 * @param {Function} props.onBack    — return to catalog
 * @param {Function} [props.onEdit]  — navigate to edit page
 * @param {Function} [props.onDelete]— trigger delete flow
 */
export default function GunDetail({ gun, onBack, onEdit, onDelete }) {
  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  // Reviews (CRUD — Challenge 7)
  const myId = getUserIdentifier()
  const { reviews, loading: reviewsLoading } = useReviews(gun.id)
  const { createReview, updateReview, deleteReview, loading: submitting } = useReviewActions(gun.id)
  const votes = useReviewVotes()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)

  const avgRating = gun.average_rating || averageRating(reviews)
  const reviewCount = gun.review_count ?? reviews.length

  const flash = (msg) => {
    setReviewSuccess(msg)
    setTimeout(() => setReviewSuccess(''), 2500)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')

    if (rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.')
      return
    }

    try {
      await createReview({ user_identifier: myId, rating, comment: comment.trim() })
      flash('Review submitted!')
      setComment('')
      setRating(5)
    } catch (err) {
      setReviewError(err.message || 'Could not submit review. The server may be unavailable.')
    }
  }

  const startEdit = (rev) => {
    setEditingId(rev.id)
    setEditRating(rev.rating)
    setEditComment(rev.comment || '')
    setReviewError('')
  }

  const handleUpdateReview = async (rev) => {
    try {
      await updateReview(rev.id, { user_id: myId, rating: editRating, comment: editComment.trim() })
      setEditingId(null)
      flash('Review updated.')
    } catch (err) {
      setReviewError(err.message || 'Failed to update review.')
    }
  }

  const handleDeleteReview = async (rev) => {
    if (!window.confirm('Hapus review ini?')) return
    try {
      await deleteReview(rev.id, myId)
      flash('Review deleted.')
    } catch (err) {
      setReviewError(err.message || 'Failed to delete review.')
    }
  }

  const handleAddToCart = () => {
    addToCart(gun)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1800)
  }

  return (
    <div className="detail">
      {/* Back button */}
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </button>

      {/* Hero */}
      <div className="detail-hero">
        <img className="detail-img" src={imgSrc} alt={gun.name} />
        <div className="detail-info">
          <h1 className="display">{gun.name}</h1>
          <p className="type">
            {category}
            {caliber ? ` · ${caliber}` : ''}
          </p>
          <p className="price detail-price">{formatPrice(price)}</p>

          {avgRating > 0 && (
            <p className="detail-rating">
              <Star size={16} fill="var(--brass)" stroke="var(--brass)" />
              {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </p>
          )}

          <div className="detail-actions">
            <button type="button" className="btn btn--primary" onClick={handleAddToCart}>
              {addedToCart ? <><Check size={16} /> Added</> : <><ShoppingCart size={16} /> Add to cart</>}
            </button>
            <FavoriteButton gunId={gun.id || gun.name} />
            <ShareButton gun={gun} />
            {onEdit && (
              <button type="button" className="btn btn--outline" onClick={() => onEdit(gun)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button type="button" className="btn btn--danger" onClick={() => onDelete(gun)}>
                <Archive size={16} /> Archive
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="detail-section">
        <h2>Description</h2>
        <p>{gun.description || 'No description available.'}</p>
      </section>

      {/* Specifications (from ingredients / steps if present) */}
      {gun.ingredients && gun.ingredients.length > 0 && (
        <section className="detail-section">
          <h2>Specifications</h2>
          <ul className="detail-specs">
            {gun.ingredients.map((ing, i) => (
              <li key={ing.id || i}>
                <strong>{ing.name}</strong> — {ing.quantity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {gun.steps && gun.steps.length > 0 && (
        <section className="detail-section">
          <h2>Assembly / Maintenance Steps</h2>
          <ol className="detail-steps">
            {gun.steps.map((step, i) => (
              <li key={step.id || i}>
                {step.instruction || step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Reviews Section */}
      <section className="detail-section">
        <h2>Reviews</h2>

        {/* Submit review */}
        <form className="review-form" onSubmit={handleSubmitReview}>
          <StarPicker value={rating} onChange={setRating} />

          <textarea
            className="review-input"
            rows="3"
            placeholder="Write a short review (optional)…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />

          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || !gun.id || String(gun.id).startsWith('local-')}
          >
            {submitting ? (
              <><Loader size={16} className="spin" /> Submitting…</>
            ) : (
              <><Send size={16} /> Submit Review</>
            )}
          </button>

          {reviewError && <p className="form-error">{reviewError}</p>}
          {reviewSuccess && <p className="form-success">{reviewSuccess}</p>}
          {!gun.id && (
            <p className="form-hint">
              Reviews require a server-generated product ID. This product is local-only.
            </p>
          )}
        </form>

        {/* Existing reviews */}
        {reviewsLoading ? (
          <p className="detail-loading">Loading reviews…</p>
        ) : reviews.length > 0 ? (
          <ul className="review-list">
            {reviews.map((rev) => {
              const mine = rev.user_id && String(rev.user_id) === String(myId)
              const myVote = votes[rev.id]
              const isEditing = editingId === rev.id
              return (
                <li key={rev.id} className="review-item">
                  <div className="review-head">
                    <span className="review-user">
                      {mine ? `${getUserProfile().username || 'You'} (you)` : rev.user_identifier || 'Anonymous'}
                    </span>
                    {!isEditing && (
                      <span className="review-stars-display">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rev.rating ? 'var(--brass)' : 'none'}
                            stroke={i < rev.rating ? 'var(--brass)' : 'var(--line)'}
                          />
                        ))}
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="review-edit">
                      <StarPicker value={editRating} onChange={setEditRating} size={18} />
                      <textarea
                        className="review-input"
                        rows="2"
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        maxLength={500}
                      />
                      <div className="review-edit-actions">
                        <button type="button" className="btn btn--primary btn--sm" disabled={submitting} onClick={() => handleUpdateReview(rev)}>
                          <Check size={14} /> Save
                        </button>
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => setEditingId(null)}>
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    rev.comment && <p className="review-comment">{rev.comment}</p>
                  )}

                  {!isEditing && (
                    <div className="review-footer">
                      <div className="review-votes">
                        <button
                          type="button"
                          className={`vote-btn ${myVote === 'up' ? 'vote-btn--active' : ''}`}
                          onClick={() => toggleVote(rev.id, 'up')}
                          aria-pressed={myVote === 'up'}
                          title="Helpful"
                        >
                          <ThumbsUp size={14} /> {myVote === 'up' ? 1 : 0}
                        </button>
                        <button
                          type="button"
                          className={`vote-btn ${myVote === 'down' ? 'vote-btn--active-down' : ''}`}
                          onClick={() => toggleVote(rev.id, 'down')}
                          aria-pressed={myVote === 'down'}
                          title="Not helpful"
                        >
                          <ThumbsDown size={14} /> {myVote === 'down' ? 1 : 0}
                        </button>
                      </div>
                      {mine && (
                        <div className="review-owner-actions">
                          <button type="button" className="link-btn" onClick={() => startEdit(rev)}>
                            <Pencil size={13} /> Edit
                          </button>
                          <button type="button" className="link-btn link-btn--danger" onClick={() => handleDeleteReview(rev)}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="detail-empty">No reviews yet. Be the first!</p>
        )}
      </section>
    </div>
  )
}
