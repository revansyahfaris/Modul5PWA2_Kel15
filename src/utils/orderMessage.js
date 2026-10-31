import { formatPrice } from './helpers'

/**
 * Susun pesan WhatsApp dari isi keranjang.
 */
export const buildOrderMessage = (items, total, buyerName) => {
  const lines = items.map(
    (i, idx) => `${idx + 1}. ${i.name} (${i.type}${i.caliber ? ` · ${i.caliber}` : ''}) x${i.qty} = ${formatPrice(i.price * i.qty)}`,
  )
  return [
    'Hi, aku mau pesan:',
    '',
    ...lines,
    '',
    `Total: ${formatPrice(total)}`,
    buyerName ? `Atas nama: ${buyerName}` : '',
    '',
    'Terima kasih!',
  ]
    .filter((l, idx, arr) => !(l === '' && arr[idx - 1] === ''))
    .join('\n')
}
