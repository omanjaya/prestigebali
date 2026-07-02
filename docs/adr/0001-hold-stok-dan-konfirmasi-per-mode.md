# Hold stok sementara + konfirmasi Booking bergantung Mode Sewa

## Konteks

Prestige menyewakan mobil mewah dalam Stok terbatas (per model), dengan dua Mode Sewa
berisiko berbeda: Lepas Kunci menyerahkan aset mahal ke pelanggan, Pakai Sopir tidak.
Selama pelanggan memproses pembayaran, Stok bisa direbut pelanggan lain (dobel-booking).

## Keputusan

1. **Hold Stok sementara.** Begitu Booking dibuat (state Permintaan), Stok ditahan dengan
   timeout. Jika timeout lewat tanpa pembayaran, hold dilepas dan Booking menjadi Kedaluwarsa.
2. **Konfirmasi bergantung Mode Sewa.** Pakai Sopir menjadi Terkonfirmasi otomatis saat
   pembayaran diterima. Lepas Kunci melewati state Menunggu Persetujuan dulu — butuh admin
   menyetujui Verifikasi Pengemudi (SIM/KTP) sebelum Terkonfirmasi, walau sudah bayar.

## Alasan & trade-off

Hold+timeout mencegah dobel-booking tanpa memaksa pembayaran instan. Percabangan konfirmasi
per mode menyeimbangkan kecepatan (Pakai Sopir langsung jalan) dengan kontrol risiko (Lepas
Kunci selalu lewat mata admin). Alternatif yang ditolak: *selalu approval* (aman tapi lambat
untuk Pakai Sopir bervolume) dan *selalu auto* (cepat tapi menyerahkan aset mahal tanpa
verifikasi).

## Konsekuensi

- Butuh mekanisme timeout/kedaluwarsa untuk melepas Hold Stok yang tidak dibayar.
- State machine Booking bercabang per Mode Sewa (`AWAITING_APPROVAL` hanya untuk Lepas Kunci).
