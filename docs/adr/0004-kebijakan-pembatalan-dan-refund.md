# Kebijakan pembatalan & refund berbasis skala waktu

## Konteks

Mobil mewah adalah Stok langka: Booking yang dibatalkan mendadak mengunci lalu melepas unit
yang seharusnya bisa disewa orang lain. Di sisi lain, DP yang selalu hangus terasa keras dan
memicu komplain/chargeback. Perlu kebijakan yang seimbang & bisa dijelaskan ke pelanggan.

## Keputusan

1. **Refund DP saat Pelanggan membatalkan — 3 tier skala waktu** ke tanggal mulai:
   - **≥H-7**: refund penuh dikurangi biaya admin
   - **H-3 s/d H-6**: refund 50%
   - **≤H-2**: DP hangus
   Berlaku sama untuk Lepas Kunci dan Pakai Sopir.
2. **Pembatalan oleh Prestige** (unit rusak, sopir berhalangan, dobel-alokasi): pelanggan
   selalu **refund penuh 100%** tanpa memandang H-berapa.
3. **Reschedule** sebagai alternatif: **1× gratis bila diminta ≥H-3** dan slot tersedia,
   DP terbawa; selebihnya diperlakukan sebagai pembatalan biasa.

## Status

Keputusan #3 (reschedule) diambil dari rekomendasi default saat sesi grilling — **belum
dikonfirmasi eksplisit oleh pemilik**; tinjau ulang bila perlu. Besaran "biaya admin" pada
tier ≥H-7 adalah konfigurasi yang belum ditetapkan.

## Alasan & trade-off

Skala waktu menyeimbangkan perlindungan Stok langka dengan rasa adil: pembatalan jauh hari
murah, pembatalan mepet menanggung biaya karena sulit mengisi ulang slot. Refund penuh untuk
pembatalan oleh Prestige menjaga kepercayaan. Reschedule menahan pendapatan alih-alih refund.
Alternatif *DP hangus total* ditolak (keras, rawan chargeback); *selalu refund penuh* ditolak
(risiko stok langka dilepas mendadak).

## Konsekuensi

- Perhitungan refund bergantung selisih hari antara waktu pembatalan dan tanggal mulai —
  butuh definisi zona waktu & titik potong (mis. tengah malam WIB) yang konsisten.
- Refund melibatkan Payment Gateway (ADR-0002): perlu alur refund/partial-refund lewat provider.
- Reschedule mengubah Periode Sewa sebuah Booking → harus mengecek ulang Hold/Stok pada
  tanggal baru.
