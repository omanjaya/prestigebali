# Prestige

Sistem booking online untuk **sewa mobil mewah** — dari landing page, pilih mobil,
booking, bayar, sampai chat dengan admin. Glossary ini adalah bahasa baku (ubiquitous
language) proyek. Istilah bisnis ditulis dalam Bahasa Indonesia; padanan identifier kode
(Bahasa Inggris) dicantumkan dalam kurung bila relevan.

## Language

### Aktor & akun

**Pelanggan** (`Customer`):
Orang yang membuat Booking. Bisa booking sebagai guest (pakai HP/email); Akun dibuat
otomatis di balik layar untuk chat, notifikasi, dan riwayat.
_Avoid_: klien, penyewa, user.

**Admin** (`Admin`):
Pengelola Prestige — mengelola armada, meng-Alokasi Unit, menyetujui Verifikasi Pengemudi,
membalas chat, dan melihat reports. Punya Akun penuh.
_Avoid_: operator, staff, owner.

**Sopir** (`Driver`):
Pengemudi untuk Booking Pakai Sopir. Pada fase 1 **tidak login** — jadwalnya dikelola Admin.
(Definisi peran domain; lihat juga Mode Sewa.)
_Avoid_: driver, supir.

**Akun** (`Account`):
Identitas login. Untuk Pelanggan dibuat otomatis dari HP/email; untuk Admin dibuat penuh.
_Avoid_: profil, user.

### Armada & ketersediaan

**Mobil** (`CarModel`):
Entri katalog yang di-browse & dibooking pelanggan — sebuah _model_, mis. "Alphard",
"Ferrari 488". Membawa: galeri foto, brand, model, tahun, transmisi, kapasitas penumpang,
Kategori, dan tarif per Mode Sewa. Ketersediaan dilacak di level ini (per model), bukan per
unit fisik.
_Avoid_: tipe, varian, produk.

**Kategori** (`category`):
Pengelompokan Mobil berdasarkan **tipe kendaraan** — Sport/Supercar, Sedan Mewah, SUV Mewah,
MPV Premium. **Brand** dipakai sebagai filter tambahan, bukan kelompok utama.
_Avoid_: kelas, tipe (ambigu dengan Mobil), grup.

**Etalase** (`catalog`):
Halaman koleksi Mobil bergaya showroom (browse-first): pengunjung melihat seluruh koleksi
lebih dulu (foto, spesifikasi, tarif), difilter per Kategori/Brand; ketersediaan baru dicek
saat menekan Booking.
_Avoid_: katalog, listing, showroom (istilah UI).

**Unit** (`CarUnit`):
Satu mobil fisik nyata dari suatu Mobil — punya plat, warna, kilometer, dan kondisi.
Beberapa Unit bisa berada di bawah satu Mobil. Pelanggan tidak memilih Unit; admin yang
mengalokasikannya.
_Avoid_: kendaraan, aset, stok fisik.

**Stok** (`stock`):
Jumlah Unit dari sebuah Mobil yang tersedia untuk suatu periode. Booking mengurangi Stok
pada level Mobil, bukan mengunci Unit tertentu.
_Avoid_: inventory, kuota.

**Buffer** (`buffer`):
Jeda wajib setelah tiap Booking (default **1 hari**, bisa dikonfigurasi) sebelum slot Stok
yang sama bisa disewa lagi — waktu untuk cuci, cek kondisi, isi BBM, dan logistik balik.
Dalam perhitungan ketersediaan, sebuah Booking memakai Periode Sewa + Buffer.
_Avoid_: jeda, cooldown, waktu istirahat.

### Booking

**Booking** (`Booking`):
Pemesanan satu Mobil oleh pelanggan untuk suatu periode sewa, opsional dengan Preferensi
Warna. Mengurangi Stok Mobil, bukan Unit spesifik.
_Avoid_: reservasi, order, pesanan, transaksi.

**Preferensi Warna** (`colorPreference`):
Permintaan warna dari pelanggan pada sebuah Booking. Bersifat _best-effort_ dan **tidak
dijamin** — hanya catatan untuk admin saat mengalokasikan Unit.
_Avoid_: pilihan warna, warna wajib.

**Alokasi** (`allocation`):
Tindakan admin menetapkan Unit fisik tertentu ke sebuah Booking, biasanya menjelang
hari-H. Sampai Alokasi terjadi, sebuah Booking hanya terikat ke Mobil (model), bukan Unit.
_Avoid_: assignment, penunjukan.

### Mode sewa

**Mode Sewa** (`RentalMode`):
Cara sebuah Booking dijalankan — **Lepas Kunci** atau **Pakai Sopir**. Dipilih pelanggan
saat booking dan menentukan syarat, jaminan, dan struktur harga yang berlaku.
_Avoid_: tipe sewa, jenis rental.

**Lepas Kunci** (`SELF_DRIVE`):
Mode di mana pelanggan menyetir sendiri. Wajib Verifikasi Pengemudi (SIM/KTP) dan Deposit,
serta terikat batas kilometer & pengecekan kondisi saat kembali.
_Avoid_: self-drive tanpa syarat, bawa sendiri.

**Pakai Sopir** (`CHAUFFEUR`):
Mode di mana Booking dijalankan oleh Sopir (lihat Aktor) dari pihak Prestige (mis. untuk
nikahan/acara). Ada biaya sopir & overtime; tidak menahan Deposit besar seperti Lepas Kunci.
_Avoid_: with driver, chauffeur, antar-jemput.

**Deposit** (`deposit`):
Dana jaminan yang ditahan pada Booking Lepas Kunci sebagai pengaman aset, dikembalikan
setelah Unit kembali sesuai kondisi. Tidak berlaku untuk Pakai Sopir.
_Avoid_: jaminan, DP, uang muka (lihat pembayaran — DP itu hal berbeda).

**Verifikasi Pengemudi** (`driverVerification`):
Proses memeriksa SIM & KTP pelanggan sebelum Booking Lepas Kunci disetujui.
_Avoid_: KYC, verifikasi akun.

### Serah-terima & lokasi

**Metode Serah-Terima** (`handoverMethod`):
Cara Unit sampai ke pelanggan pada Lepas Kunci — **Ambil Sendiri** di lokasi Prestige
(gratis) atau **Diantar** ke alamat pelanggan (kena Biaya Antar). Pada Pakai Sopir, mobil
selalu datang bersama Sopir ke Titik Jemput.
_Avoid_: pengambilan, pickup/dropoff (istilah UI).

**Biaya Antar** (`deliveryFee`):
Biaya pengantaran Unit ke alamat pelanggan pada Lepas Kunci, dihitung berbasis **zona**
(mis. dalam kota flat, luar kota per jarak) — bukan kalkulasi peta detail di fase 1.
_Avoid_: ongkir, biaya kirim.

**Titik Jemput** (`pickupPoint`):
Alamat/lokasi tempat Sopir menjemput pelanggan pada Booking Pakai Sopir.
_Avoid_: meeting point, lokasi jemput.

### Durasi & harga

**Periode Sewa** (`rentalPeriod`):
Rentang waktu mulai–selesai sebuah Booking (datetime). Satu model waktu berlaku untuk
kedua Mode Sewa; hanya cara penagihannya yang berbeda.
_Avoid_: durasi, jangka, slot.

**Tarif Harian** (`dailyRate`):
Harga per 24 jam untuk Booking Lepas Kunci. Sewa 3 hari = 3× Tarif Harian.
_Avoid_: harga sewa, harga per hari.

**Paket 12 Jam** (`chauffeurPackage`):
Tarif dasar Pakai Sopir untuk 12 jam kerja dalam satu hari. Kelebihan jam dikenakan Overtime.
_Avoid_: paket harian, paket acara.

**Overtime** (`overtime`):
Biaya per jam saat Booking Pakai Sopir melewati Paket 12 Jam.
_Avoid_: lembur, tambahan jam.

**Batas Kilometer** (`kmLimit`):
Jatah kilometer pada Booking Lepas Kunci; kelebihannya dikenakan biaya per km.
_Avoid_: limit jarak, kuota km.

**Denda** (`penalty`):
Biaya tambahan akibat pelanggaran: telat kembali, kelebihan Batas Kilometer, atau kerusakan.
_Avoid_: penalti, charge, fine.

**Biaya Luar Kota** (`outOfTownFee`):
Biaya tambahan pada Booking Pakai Sopir bila perjalanan keluar wilayah standar
(mis. akomodasi sopir, tol, BBM luar kota).
_Avoid_: biaya tambahan, surcharge.

### Siklus hidup Booking

**Hold Stok** (`stockHold`):
Penahanan Stok sementara begitu Booking dibuat, dengan batas waktu (timeout), agar tidak
direbut pelanggan lain selama proses pembayaran. Jika timeout lewat tanpa bayar, hold lepas
dan Booking menjadi Kedaluwarsa.
_Avoid_: reservasi sementara, lock.

**Permintaan** (`REQUESTED`):
State awal Booking: baru dibuat, Stok sedang di-Hold, menunggu pembayaran.
_Avoid_: pending, draft, pesanan masuk.

**Menunggu Persetujuan** (`AWAITING_APPROVAL`):
Khusus Lepas Kunci — pembayaran sudah diterima, tetapi Booking menunggu admin menyetujui
hasil Verifikasi Pengemudi sebelum Terkonfirmasi.
_Avoid_: review, pending approval.

**Terkonfirmasi** (`CONFIRMED`):
Booking pasti berjalan. Pakai Sopir mencapai state ini otomatis saat pembayaran diterima;
Lepas Kunci mencapainya setelah pembayaran **dan** persetujuan admin.
_Avoid_: aktif, disetujui, deal.

**Kedaluwarsa** (`EXPIRED`):
Booking gugur karena Hold Stok timeout tanpa pembayaran. Stok dilepas kembali.
_Avoid_: hangus, batal otomatis.

**Berjalan** (`ONGOING`):
Booking sedang berlangsung — Unit sudah di tangan pelanggan (Lepas Kunci) atau acara sedang
jalan (Pakai Sopir).
_Avoid_: aktif, in progress, jalan.

**Selesai** (`COMPLETED`):
Booking berakhir. Pada fase 1, serah-terima, inspeksi kondisi/km/BBM, perhitungan Denda, dan
refund Deposit ditangani Admin **secara manual di luar sistem** — sistem hanya menandai
Selesai (opsional mencatat nilai akhir).
_Avoid_: closed, tutup, kelar.

**Dibatalkan** (`CANCELLED`):
Booking dihentikan oleh pelanggan atau admin sebelum Berjalan. Refund DP mengikuti
Kebijakan Refund (lihat di bawah).
_Avoid_: cancel, gagal.

### Pembayaran

**Pembayaran** (`Payment`):
Transaksi uang untuk sebuah Booking, diproses lewat Payment Gateway.
_Avoid_: transaksi, bayaran.

**DP** (`downPayment`):
Pembayaran awal (uang muka) yang mengunci Booking dan memicu konfirmasi (lihat ADR-0001).
Berbeda dari Deposit: DP adalah bagian dari harga sewa, Deposit adalah jaminan yang
dikembalikan.
_Avoid_: booking fee, tanda jadi.

**Pelunasan** (`settlement`):
Pembayaran sisa harga sewa setelah DP; wajib selesai sebelum Unit diserahkan.
_Avoid_: sisa bayar, final payment.

**Payment Gateway** (`paymentGateway`):
Layanan pihak ketiga (mis. Midtrans/Xendit) yang memproses pembayaran (VA, e-wallet, kartu)
dan mengonfirmasi otomatis via webhook.
_Avoid_: payment processor, aggregator.

### Chat & notifikasi

**Percakapan** (`Conversation`):
Utas pesan in-app antara Pelanggan dan Admin, terikat ke sebuah Booking bila relevan.
Riwayat tersimpan di sistem. Pelanggan bisa memilih melanjutkan ke WhatsApp sebagai opsi.
_Avoid_: chat room, thread, obrolan.

**Notifikasi** (`Notification`):
Pemberitahuan otomatis atas suatu kejadian (Booking baru, pembayaran diterima, pesan masuk,
menunggu persetujuan) yang dikirim ke Pelanggan atau Admin. Kanal: **WhatsApp** (utama),
**Email** (cadangan/rekam jejak), dan **Web Push**.
_Avoid_: alert, pemberitahuan sistem.

### Reports

**Utilisasi** (`utilization`):
Rasio jumlah hari sebuah Mobil (atau Unit) tersewa terhadap hari tersedia dalam suatu
periode. Dipakai untuk keputusan armada (beli/lepas unit).
_Avoid_: okupansi, tingkat pakai.

**Pembayaran Tertunda** (`outstandingPayment`):
Booking yang DP-nya sudah masuk tetapi Pelunasan belum — tagihan yang harus dikejar.
_Avoid_: piutang, tunggakan.

### Pembatalan & refund

**Kebijakan Refund** (`refundPolicy`):
Aturan pengembalian DP saat Pelanggan membatalkan, berbasis skala waktu ke tanggal mulai:
**≥H-7** refund penuh (dikurangi biaya admin), **H-3 s/d H-6** refund 50%, **≤H-2** DP
hangus. Berlaku sama untuk kedua Mode Sewa (lihat ADR-0004).
_Avoid_: aturan batal, kebijakan cancel.

**Pembatalan oleh Prestige** (`operatorCancellation`):
Pembatalan yang berasal dari pihak Prestige (Unit rusak, Sopir berhalangan, dobel-alokasi).
Pelanggan selalu mendapat **refund penuh 100%**, tanpa memandang H-berapa.
_Avoid_: batal sistem, force cancel.

**Reschedule** (`reschedule`):
Pemindahan tanggal Booking sebagai alternatif Pembatalan; DP terbawa ke tanggal baru
(tidak hangus). Diberikan **1× gratis bila diminta ≥H-3** dan slot tersedia; di luar itu
diperlakukan sebagai Pembatalan biasa.
_Avoid_: pindah jadwal, ganti tanggal, rebooking.
