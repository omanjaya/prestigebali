// Konfigurasi situs Prestige Bali.
// ⚠️ PLACEHOLDER — GANTI dengan data asli sebelum live.
export const SITE = {
  name: "Prestige Bali",
  tagline: "Luxury Car Rental · Bali",
  // Nomor WhatsApp format internasional TANPA "+" (untuk wa.me). TODO: isi asli.
  whatsapp: "6281234567890",
  phone: "+62 812-3456-7890",
  email: "hello@prestigebali.com",
  address: "Jl. Sunset Road No. 88, Seminyak, Bali 80361",
  hours: "Every day · 08:00–22:00 WITA",
  instagram: "https://instagram.com/prestigebali",
  maps: "https://maps.google.com/?q=Seminyak+Bali",
} as const;

/** Link WhatsApp (opsional teks awal). */
export function waLink(text?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
