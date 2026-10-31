// ---------------------------------------------------------------------------
// Nomor WhatsApp tujuan checkout (Challenge 9).
// Format internasional tanpa "+" atau "0" di depan, contoh: 6281234567890.
// Bisa diatur lewat .env / Vercel:  VITE_WHATSAPP_NUMBER=62xxxxxxxxxx
// ---------------------------------------------------------------------------
export const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER || '6281292635514').replace(/\D/g, '')
