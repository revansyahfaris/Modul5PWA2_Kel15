import { useState, useEffect, lazy, Suspense } from 'react'
import { Loader } from 'lucide-react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import PWABadge from './components/PWABadge.jsx'
import ConfirmModal from './components/modals/ConfirmModal.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import { archiveGun } from './utils/archiveStorage'
import './App.css'

// ---------------------------------------------------------------------------
// Lazy load (Challenge 2) — setiap halaman dipecah menjadi chunk JS sendiri
// (code splitting) dan baru diunduh saat halaman itu pertama kali dibuka.
// ---------------------------------------------------------------------------
const Catalog = lazy(() => import('./pages/Catalog.jsx'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const CartPage = lazy(() => import('./pages/CartPage.jsx'))
const CreateGunPage = lazy(() => import('./pages/CreateGunPage.jsx'))
const EditGunPage = lazy(() => import('./pages/EditGunPage.jsx'))
const EditProfilePage = lazy(() => import('./pages/EditProfilePage.jsx'))
const ArchivePage = lazy(() => import('./pages/ArchivePage.jsx'))
const GunDetailLoader = lazy(() => import('./components/gun/GunDetailLoader.jsx'))
const GunDetail = lazy(() => import('./components/gun/GunDetail.jsx'))

function PageFallback() {
  return (
    <div className="state-box">
      <Loader size={28} className="spin" />
      <p>Loading page…</p>
    </div>
  )
}

// Share link (Challenge 1): baca ?gun=<id> dari URL
const getSharedGunId = () => {
  try {
    return new URLSearchParams(window.location.search).get('gun')
  } catch {
    return null
  }
}

const setUrlGun = (id) => {
  const url = new URL(window.location.href)
  if (id) url.searchParams.set('gun', id)
  else url.searchParams.delete('gun')
  window.history.replaceState(null, '', url)
}

function App() {
  const sharedId = getSharedGunId()
  const [showSplash, setShowSplash] = useState(!sharedId)
  const [tab, setTab] = useState('Catalog')
  // 'list' | 'create' | 'edit' | 'detail' | 'editProfile' | 'archive'
  const [mode, setMode] = useState(sharedId ? 'detail' : 'list')
  const [selectedGun, setSelectedGun] = useState(sharedId ? { id: sharedId } : null)
  const [editingGun, setEditingGun] = useState(null)
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [returnTab, setReturnTab] = useState('Catalog')

  // Sinkronkan URL dengan produk yang sedang dibuka, supaya URL di address
  // bar selalu bisa dibagikan.
  useEffect(() => {
    setUrlGun(mode === 'detail' && selectedGun?.id ? selectedGun.id : null)
  }, [mode, selectedGun])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      setMode('create')
    } else if (target === 'Edit') {
      setEditingGun(payload)
      setMode('edit')
    } else if (target === 'Detail') {
      setReturnTab(tab)
      setSelectedGun(payload)
      setMode('detail')
    } else if (target === 'EditProfile') {
      setMode('editProfile')
    } else if (target === 'Archive') {
      setMode('archive')
    } else {
      setTab(target)
      setMode('list')
      setSelectedGun(null)
      setEditingGun(null)
    }
    scrollTop()
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedGun(null)
    setEditingGun(null)
  }

  const backToProfile = () => {
    setTab('Profile')
    handleBackToList()
  }

  const detailProps = {
    onBack: () => { setTab(returnTab); handleBackToList() },
    onEdit: (g) => handleNavigate('Edit', g),
    onDelete: (g) => setArchiveTarget(g),
  }

  return (
    <div className="shell">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Header
        tab={mode === 'list' ? tab : mode === 'editProfile' || mode === 'archive' ? 'Profile' : ''}
        onTab={(newTab) => handleNavigate(newTab)}
        onNavigateCreate={() => handleNavigate('Create')}
      />

      <main className="main">
        <Suspense fallback={<PageFallback />}>
          {mode === 'create' && (
            <CreateGunPage
              onBack={handleBackToList}
              onSuccess={() => { handleBackToList(); setTab('Catalog') }}
            />
          )}

          {mode === 'edit' && (
            <EditGunPage
              gun={editingGun}
              gunId={editingGun?.id}
              onBack={handleBackToList}
              onSuccess={() => { handleBackToList(); setTab('Catalog') }}
            />
          )}

          {mode === 'detail' && selectedGun && (
            selectedGun.name
              ? <GunDetail gun={selectedGun} {...detailProps} />
              : <GunDetailLoader id={selectedGun.id} {...detailProps} />
          )}

          {mode === 'editProfile' && (
            <EditProfilePage onBack={backToProfile} onSaved={backToProfile} />
          )}

          {mode === 'archive' && <ArchivePage onBack={backToProfile} />}

          {mode === 'list' && (
            <>
              {tab === 'Catalog' && (
                <Catalog onNavigate={(destination, payload) => handleNavigate(destination, payload)} />
              )}
              {tab === 'Favorites' && (
                <FavoritesPage
                  onSelectGun={(g) => handleNavigate('Detail', g)}
                  onNavigateCatalog={() => handleNavigate('Catalog')}
                />
              )}
              {tab === 'Cart' && <CartPage onNavigateCatalog={() => handleNavigate('Catalog')} />}
              {tab === 'Profile' && (
                <ProfilePage
                  onReplaySplash={() => setShowSplash(true)}
                  onNavigate={(destination, payload) => handleNavigate(destination, payload)}
                />
              )}
            </>
          )}
        </Suspense>
      </main>

      {/* Soft delete dari halaman detail */}
      <ConfirmModal
        open={Boolean(archiveTarget)}
        title="Move to Archive"
        message={`Pindahkan "${archiveTarget?.name}" ke arsip? Produk bisa di-restore dari Profile → Archive.`}
        confirmLabel="Archive"
        onConfirm={() => {
          if (!archiveTarget) return
          archiveGun(archiveTarget)
          setArchiveTarget(null)
          handleBackToList()
          setTab('Catalog')
        }}
        onCancel={() => setArchiveTarget(null)}
      />

      <PWABadge />
      <Footer />
    </div>
  )
}

export default App
