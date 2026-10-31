import { createLocalStore } from './localStore'

// ---------------------------------------------------------------------------
// Thumbs up / thumbs down untuk review (Challenge 7).
// Disimpan per browser: { [reviewId]: 'up' | 'down' }.
// ---------------------------------------------------------------------------
const voteStore = createLocalStore('bore_barrel_review_votes', {})

export const toggleVote = (reviewId, direction) =>
  voteStore.set((votes) => {
    const next = { ...votes }
    if (next[reviewId] === direction) delete next[reviewId]
    else next[reviewId] = direction
    return next
  })

export const useReviewVotes = () => voteStore.useStore()
