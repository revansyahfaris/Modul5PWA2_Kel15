import { ShoppingCart, Minus, Plus, Trash2, MessageCircle, ArrowRight } from 'lucide-react'
import { useCart, setCartQty, removeFromCart, clearCart } from '../utils/cartStorage'
import { getUserProfile } from '../services/userService'
import { WHATSAPP_NUMBER } from '../config/whatsapp'
import { formatPrice } from '../utils/helpers'
import { buildOrderMessage } from '../utils/orderMessage'

/**
 * CartPage (Challenge 9) — keranjang + checkout ke WhatsApp.
 */
export default function CartPage({ onNavigateCatalog }) {
  const { items, count, total } = useCart()

  const handleCheckout = () => {
    const profile = getUserProfile()
    const name = profile.username && profile.username !== 'Shooter' ? profile.username : ''
    const text = buildOrderMessage(items, total, name)
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="page cart-page">
      <section className="masthead">
        <h1 className="display">Your cart</h1>
        <p className="lede">
          {count > 0
            ? `${count} item${count !== 1 ? 's' : ''} siap di-checkout lewat WhatsApp.`
            : 'Keranjang masih kosong.'}
        </p>
      </section>

      {items.length === 0 ? (
        <div className="state-box">
          <ShoppingCart size={28} />
          <p>Belum ada produk di keranjang.</p>
          <button type="button" className="btn btn--outline" onClick={onNavigateCatalog}>
            Browse catalog <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image_url} alt={item.name} className="cart-img" loading="lazy" />
                <div className="cart-info">
                  <span className="name display">{item.name}</span>
                  <span className="type">
                    {item.type}
                    {item.caliber ? ` · ${item.caliber}` : ''}
                  </span>
                  <span className="price">{formatPrice(item.price)}</span>
                </div>
                <div className="cart-qty">
                  <button type="button" className="icon-btn" onClick={() => setCartQty(item.id, item.qty - 1)} aria-label="Kurangi">
                    <Minus size={14} />
                  </button>
                  <span className="cart-qty-val">{item.qty}</span>
                  <button type="button" className="icon-btn" onClick={() => setCartQty(item.id, item.qty + 1)} aria-label="Tambah">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="cart-subtotal">{formatPrice(item.price * item.qty)}</span>
                <button type="button" className="icon-btn" onClick={() => removeFromCart(item.id)} aria-label="Hapus dari keranjang">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>

          <aside className="cart-summary">
            <h3 className="section-title">Order summary</h3>
            <div className="cart-summary-row">
              <span>Items</span>
              <span>{count}</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button type="button" className="btn btn--primary btn--wa" onClick={handleCheckout}>
              <MessageCircle size={16} /> Checkout via WhatsApp
            </button>
            <button type="button" className="link-btn" onClick={clearCart}>
              Kosongkan keranjang
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
