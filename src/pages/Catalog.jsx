import { useState, useMemo, useEffect, useRef } from 'react'
import { RefreshCw, Plus, Loader, AlertCircle, PackageOpen } from 'lucide-react'
import { useGuns } from '../hooks/useGuns'
import GUNS_LOCAL from '../data/guns'
import GunCard from '../components/gun/GunCard'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import { archiveGun, useArchive } from '../utils/archiveStorage'
import {
  matchesSearch,
  matchesCategory,
  sortItems,
  extractCategories,
} from '../utils/helpers'

/**
 * Catalog page — the main product listing.
 *
 * Data source priority:
 *   1. Live API via useGuns()
 *   2. Local static array (GUNS_LOCAL) when the API is unreachable
 *
 * Features: search, category filter, sort, CRUD actions, detail modal.
 */
const PAGE_SIZE = 6

export default function Catalog({ onNavigate }) {
  // ---- API data (di-cache oleh TanStack Query) ----
  const { guns: apiGuns, loading, fetching, error, refetch, updatedAt } = useGuns({ limit: 50 })
  const { archivedIds } = useArchive()
  const [useLocal, setUseLocal] = useState(false)

  // Decide data source
  const rawGuns = useMemo(() => {
    if (useLocal || (error && apiGuns.length === 0)) {
      // Enrich local data with synthetic ids so FavoriteButton and detail work
      return GUNS_LOCAL.map((g, i) => ({ ...g, id: g.id || `local-${i}` }))
    }
    return apiGuns
  }, [apiGuns, error, useLocal])

  // ---- filters / sort ----
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const categories = useMemo(() => extractCategories(rawGuns), [rawGuns])

  const filteredGuns = useMemo(() => {
    let result = rawGuns.filter(
      (g) =>
        !archivedIds.has(String(g.id)) &&
        matchesSearch(g, search) &&
        matchesCategory(g, activeCategory),
    )
    return sortItems(result, sortKey, sortOrder)
  }, [rawGuns, archivedIds, search, activeCategory, sortKey, sortOrder])

  // ---- Lazy load (Challenge 2): tampilkan 6 item dulu, sisanya dimuat
  // otomatis saat user scroll mendekati bawah daftar (IntersectionObserver).
  // Jumlah item yang tampil di-reset ke PAGE_SIZE setiap filter berubah.
  const filterKey = `${search}|${activeCategory}|${sortKey}|${sortOrder}`
  const [lazyState, setLazyState] = useState({ key: filterKey, count: PAGE_SIZE })
  const visibleCount = lazyState.key === filterKey ? lazyState.count : PAGE_SIZE
  const sentinelRef = useRef(null)

  const hasMore = visibleCount < filteredGuns.length

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLazyState((st) => ({
            key: filterKey,
            count: (st.key === filterKey ? st.count : PAGE_SIZE) + PAGE_SIZE,
          }))
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, filteredGuns.length, filterKey])

  const visibleGuns = filteredGuns.slice(0, visibleCount)

  // ---- soft delete: pindahkan ke arsip ----
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [toast, setToast] = useState('')

  const handleArchive = () => {
    if (!archiveTarget) return
    archiveGun(archiveTarget)
    setToast(`"${archiveTarget.name}" dipindahkan ke arsip.`)
    setArchiveTarget(null)
    setTimeout(() => setToast(''), 3000)
  }

  // ---- Main catalog view ----
  return (
    <>
      <section className="masthead">
        <h1 className="display">Hardware, by the spec sheet.</h1>
        <p className="lede">
          A small armory of pistols, rifles, and shotguns. Every piece listed
          with its type, caliber, and price — nothing else.
        </p>
      </section>

      <section>
        <div className="list-head">
          <h2>Current stock</h2>
          <div className="list-head-right">
            <span className="count">
              {filteredGuns.length} piece{filteredGuns.length !== 1 ? 's' : ''}
              {fetching && !loading && ' · refreshing…'}
              {!fetching && updatedAt > 0 && !useLocal && (
                <span className="cache-note" title="Data diambil dari cache, otomatis diperbarui setelah 1 menit">
                  {' '}· cached {new Date(updatedAt).toLocaleTimeString()}
                </span>
              )}
            </span>
            {onNavigate && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => onNavigate('Create')}
              >
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <AdvancedFilter
          search={search}
          onSearch={setSearch}
          categories={categories}
          activeCategory={activeCategory}
          onCategory={setActiveCategory}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={({ key, order }) => { setSortKey(key); setSortOrder(order) }}
        />

        {/* States */}
        {loading && (
          <div className="state-box">
            <Loader size={28} className="spin" />
            <p>Loading products…</p>
          </div>
        )}

        {!loading && error && !useLocal && (
          <div className="state-box state-box--error">
            <AlertCircle size={28} />
            <p>{error}</p>
            <div className="state-box__actions">
              <button type="button" className="btn btn--outline" onClick={refetch}>
                <RefreshCw size={16} /> Retry
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setUseLocal(true)}
              >
                View Local Catalog
              </button>
            </div>
          </div>
        )}

        {!loading && filteredGuns.length === 0 && !error && (
          <div className="state-box">
            <PackageOpen size={28} />
            <p>No products match your search.</p>
          </div>
        )}

        {/* Product grid */}
        {filteredGuns.length > 0 && (
          <ul className="stock">
            {visibleGuns.map((gun) => (
              <GunCard
                key={gun.id || gun.name}
                gun={gun}
                onSelect={(g) => onNavigate && onNavigate('Detail', g)}
                onEdit={onNavigate ? (g) => onNavigate('Edit', g) : undefined}
                onDelete={setArchiveTarget}
              />
            ))}
          </ul>
        )}

        {hasMore && (
          <div ref={sentinelRef} className="lazy-sentinel">
            <Loader size={18} className="spin" /> Loading more…
          </div>
        )}

        {useLocal && (
          <p className="local-notice">
            Showing local catalog (server unavailable).{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => { setUseLocal(false); refetch() }}
            >
              Retry server
            </button>
          </p>
        )}
      </section>

      {/* Soft delete confirmation */}
      <ConfirmModal
        open={!!archiveTarget}
        title="Move to Archive"
        message={`Pindahkan "${archiveTarget?.name}" ke arsip? Produk bisa di-restore dari Profile → Archive.`}
        confirmLabel="Archive"
        loading={false}
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
      {toast && <div className="toast toast--success">{toast}</div>}
    </>
  )
}
