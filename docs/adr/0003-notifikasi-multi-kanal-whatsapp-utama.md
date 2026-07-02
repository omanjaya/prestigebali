# Notifikasi multi-kanal dengan WhatsApp sebagai kanal utama

## Konteks

"Notifikasi ke HP" adalah kebutuhan produk inti: Admin harus tahu segera saat ada Booking
atau pesan baru, dan Pelanggan perlu konfirmasi & reminder. Pasar sasaran adalah pelanggan
mobil mewah di Indonesia, di mana WhatsApp adalah kanal yang paling dibaca.

## Keputusan

Kirim Notifikasi lewat tiga kanal: **WhatsApp sebagai kanal utama** (via API pihak ketiga
mis. Fonnte/Twilio/WhatsApp Business), **Email** sebagai cadangan & rekam jejak, dan
**Web Push** untuk pengguna yang mengizinkan.

## Alasan & trade-off

WhatsApp benar-benar "sampai ke HP" dan punya tingkat baca tinggi di Indonesia — cocok untuk
kebutuhan real-time Admin. Email memberi keandalan & jejak audit tanpa biaya berarti. Web
Push melengkapi tanpa biaya per pesan. Alternatif SMS ditolak (mahal, kesan kuno);
mengandalkan Email/Web Push saja ditolak karena kurang instan/andal untuk segmen ini.

## Konsekuensi

- Ketergantungan pada penyedia WhatsApp API: biaya per pesan, setup/approval template.
- Perlu lapisan pengiriman notifikasi yang abstrak dari kanal (satu kejadian → banyak kanal),
  agar penambahan/penggantian kanal tidak menyebar ke seluruh kode.
- Provider WhatsApp spesifik belum dipilih; ADR ini menetapkan *strategi kanal*, bukan vendor.
