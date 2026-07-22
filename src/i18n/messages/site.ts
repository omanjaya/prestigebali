// Pesan halaman konten/marketing (landing, about, blog). Kunci datar "site.*";
// 4 kamus, en-AU memakai kamus "en" (lihat dictLocaleOf di ../config).
//
// CATATAN GAYA: id/ru/zh adalah TRANSCREATION, bukan terjemahan literal — setiap
// bahasa ditulis ulang dalam register hospitality mewah yang wajar bagi penutur
// asli (ID: halus & hangat; RU: формальное «вы», elegan; ZH: ringkas & bermartabat).
// Saat menambah kunci, tulis ulang per bahasa — jangan menerjemahkan kata-per-kata.

import type { MessageModule } from "../config";

export const siteMessages: MessageModule = {
  en: {
    // ---- Nav (extra items beyond common.nav.*) ----
    "site.nav.experience": "Experience",
    "site.nav.waysToRide": "Ways to Ride",

    // ---- Hero ----
    "site.hero.kicker": "Luxury Car Rental · Bali",
    "site.hero.title1": "The art",
    "site.hero.title2": "of arriving.",
    "site.hero.sub":
      "A curated fleet of supercars, sedans, SUVs and premium MPVs. Choose Self-Drive for the freedom of the road, or Chauffeur for effortless luxury.",
    "site.hero.ctaPrimary": "Explore the Fleet",
    "site.hero.ctaSecondary": "Ways to Ride",
    "site.hero.scroll": "Scroll",

    // ---- USP strip ----
    "site.usp.deposit.title": "Minimum Deposit",
    "site.usp.deposit.body":
      "A fair, transparent security deposit — paid at checkout and refunded in full for Self-Drive.",
    "site.usp.offers.title": "Seasonal Offers",
    "site.usp.offers.body":
      "Exclusive seasonal rates — contact our concierge for the current promo code.",
    "site.usp.offers.cta": "Ask for a promo code",
    "site.usp.delivery.title": "Free Delivery",
    "site.usp.delivery.body": "We deliver the car to your villa or hotel anywhere in Bali.",

    // ---- Offers band ----
    "site.offers.kicker": "Have a promo code?",
    "site.offers.title": "Enter it when you book.",
    "site.offers.body":
      "Seasonal codes are shared privately by our concierge team — reach out on WhatsApp and we'll send you the current offer.",
    "site.offers.cta": "Ask for a promo code",
    "site.offers.card1.title": "Seasonal Rate",
    "site.offers.card1.body":
      "A softer rate for longer self-drive or chauffeur bookings of three days or more.",
    "site.offers.card2.title": "Early Bird",
    "site.offers.card2.body":
      "Reserve well ahead of your trip and secure priority pick of the fleet.",
    "site.offers.card3.title": "Event & Wedding",
    "site.offers.card3.body":
      "Chauffeur packages tailored for weddings, photoshoots and celebrations.",

    // ---- Experience ----
    "site.experience.kicker": "Why Prestige",
    "site.experience.title": "An experience, not a transaction.",
    "site.experience.feature1.title": "Impeccable Fleet",
    "site.experience.feature1.body":
      "Every car detailed, serviced and insured before it reaches you.",
    "site.experience.feature2.title": "Seamless Booking",
    "site.experience.feature2.body":
      "Reserve online in minutes, with instant confirmation and secure payment.",
    "site.experience.feature3.title": "Discreet Chauffeurs",
    "site.experience.feature3.body":
      "Professional drivers for weddings, events and executive travel.",
    "site.experience.feature4.title": "24/7 Concierge",
    "site.experience.feature4.body":
      "A dedicated team on hand, from first enquiry to safe return.",

    // ---- Collection ----
    "site.collection.kicker": "The Collection",
    "site.collection.title": "Choose your drive.",
    "site.collection.available": "available",
    "site.collection.categoryLabel": "Category",
    "site.collection.marqueLabel": "Marque",
    "site.collection.all": "All",
    "site.collection.noMatch": "No cars match those filters.",

    // ---- Modes ----
    "site.modes.kicker": "Two Ways to Ride",
    "site.modes.title": "However you wish to arrive.",
    "site.modes.selfDrive.title": "Take the wheel.",
    "site.modes.selfDrive.body":
      "Full freedom of the road. Verified licence, refundable deposit, transparent mileage.",
    "site.modes.chauffeur.title": "Be driven.",
    "site.modes.chauffeur.body":
      "A professional driver for weddings, events and executive travel. Sit back and arrive in style.",

    // ---- Stats ----
    "site.stats.marques": "Marques",
    "site.stats.vehicles": "Vehicles",
    "site.stats.concierge": "Concierge",
    "site.stats.insured": "Insured",

    // ---- Final CTA ----
    "site.finalCta.kicker": "Ready when you are",
    "site.finalCta.title": "Reserve your drive.",
    "site.finalCta.sub":
      "Browse the collection and book in minutes — instant confirmation, secure payment.",
    "site.finalCta.cta": "Explore the Fleet",

    // ---- Bali story ----
    "site.baliStory.kicker": "Explore Bali",
    "site.baliStory.title": "From Seminyak to Ubud, in your own key.",
    "site.baliStory.lede":
      "The island rewards those who take the scenic way. A morning through the rice terraces, an afternoon along cliff roads above the Indian Ocean, and a car that belongs in the frame.",
    "site.baliStory.body":
      "Arrive at a Uluwatu clifftop wedding without a crease. Trace the coast as the light turns gold over Canggu. Slip up to Ubud for dinner among the terraces. Whichever road you choose, the fleet is prepared, insured and waiting.",
    "site.baliStory.caption": "Ubud · Central Bali",
    "site.baliStory.cta": "Choose your drive",

    // ---- How it works ----
    "site.howItWorks.kicker": "Simple & Seamless",
    "site.howItWorks.title": "How it works",
    "site.howItWorks.step1.title": "Choose your car",
    "site.howItWorks.step1.body":
      "Browse the collection and pick the marque, category and dates that suit your journey.",
    "site.howItWorks.step2.title": "Book & pay the deposit online",
    "site.howItWorks.step2.body":
      "Reserve in minutes with instant confirmation and a secure, refundable deposit.",
    "site.howItWorks.step3.title": "Self-drive or be chauffeured",
    "site.howItWorks.step3.body":
      "Take the wheel yourself, or let a discreet professional driver do the honours.",

    // ---- Testimonials ----
    "site.testimonials.kicker": "Testimonials",
    "site.testimonials.title": "What guests say",
    "site.testimonials.q1.text":
      "Our Bentley was waiting at the villa gate, immaculate and on time. The chauffeur made every evening in Seminyak feel effortless.",
    "site.testimonials.q1.name": "Amara S.",
    "site.testimonials.q1.meta": "Singapore",
    "site.testimonials.q2.text":
      "Self-drove a Range Rover along the Bukit coast for a week. Faultless car, transparent deposit, and a team that answered at midnight.",
    "site.testimonials.q2.name": "James W.",
    "site.testimonials.q2.meta": "Australia",
    "site.testimonials.q3.text":
      "They arranged a Mercedes for our wedding in Ubud down to the last detail. Discreet, elegant, and genuinely luxurious.",
    "site.testimonials.q3.name": "Putri R.",
    "site.testimonials.q3.meta": "Jakarta",

    // ---- FAQ ----
    "site.faq.kicker": "FAQ",
    "site.faq.title": "Frequently asked",
    "site.faq.q1.q": "Do you deliver the car to my hotel or villa?",
    "site.faq.q1.a":
      "Yes. We deliver and collect at any hotel, villa or private residence across Seminyak, Canggu, Ubud, Nusa Dua and the airport, at a time that suits your itinerary.",
    "site.faq.q2.q": "What do I need to drive myself?",
    "site.faq.q2.a":
      "For self-drive we require a valid passport and either a national driving licence with an International Driving Permit, or an Indonesian licence. A refundable security deposit is held for the rental period.",
    "site.faq.q3.q": "How does the deposit and insurance work?",
    "site.faq.q3.a":
      "A refundable deposit secures your booking and is returned in full on safe return of the vehicle. Every car is comprehensively insured, with the coverage and excess set out clearly before you confirm.",
    "site.faq.q4.q": "Can I book a chauffeur for a wedding or event?",
    "site.faq.q4.a":
      "Absolutely. Our discreet, professionally attired chauffeurs are available for weddings, photoshoots and executive travel, with flexible hourly and full-day packages tailored to your schedule.",
    "site.faq.q5.q": "What is your cancellation policy?",
    "site.faq.q5.a":
      "Plans change. Cancel at least 48 hours before your start time for a full refund of the deposit; inside 48 hours we will always work with you to reschedule wherever possible.",

    // ---- About ----
    "site.about.kicker": "About Prestige Bali",
    "site.about.title": "Luxury, curated for the island.",
    "site.about.lede":
      "Prestige Bali brings together an exceptional fleet, discreet professionals and round-the-clock care — so every drive across the island feels effortless.",
    "site.about.body1":
      "We curate every car in our collection ourselves: supercars, executive sedans, SUVs and premium MPVs, each detailed, serviced and comprehensively insured before it reaches you. Nothing is outsourced, and nothing is left to chance.",
    "site.about.body2":
      "Prefer to be driven? Our chauffeurs are trained, professionally attired and deeply familiar with the island — from a sunrise departure for Uluwatu to a discreet wait outside an evening event in Seminyak.",
    "site.about.body3":
      "A dedicated concierge team is on hand 24/7, from your first enquiry to the safe return of the vehicle, so help is always a message away.",
    "site.about.stat1Value": "12+",
    "site.about.stat1Label": "Marques curated",
    "site.about.stat2Value": "24/7",
    "site.about.stat2Label": "Concierge on call",
    "site.about.stat3Value": "100%",
    "site.about.stat3Label": "Fleet insured",
    "site.about.ctaWhatsApp": "Chat with our concierge",
    "site.about.ctaFleet": "Explore the Fleet",

    // ---- Blog ----
    "site.blog.kicker": "Journal",
    "site.blog.title": "Stories from the island.",
    "site.blog.sub":
      "Notes on the fleet, the roads worth taking, and life around Prestige Bali.",
    "site.blog.empty": "New stories are on their way. Please check back soon.",
    "site.blog.backToBlog": "Back to Journal",
    "site.blog.readMore": "Read the story",
    "site.blog.notFoundTitle": "Story not found",
    "site.blog.notFoundBody": "This story may have been moved or is no longer published.",

    // ---- Car detail ----
    "site.detail.back": "Back to collection",
    "site.detail.specifications": "Specifications",
    "site.detail.rates": "Rates",
    "site.detail.contactPricing": "Contact us for pricing.",
    "site.detail.outOfStock": "Out of stock",
    "site.detail.unit": "unit",
    "site.detail.units": "units",
    "site.detail.disclaimer":
      "The specific colour and unit are assigned by our team; customers don't choose the colour.",
  },
  id: {
    // ---- Nav ----
    "site.nav.experience": "Pengalaman",
    "site.nav.waysToRide": "Cara Berkendara",

    // ---- Hero ----
    "site.hero.kicker": "Sewa Mobil Mewah · Bali",
    "site.hero.title1": "Tiba",
    "site.hero.title2": "dengan berkelas.",
    "site.hero.sub":
      "Armada pilihan: supercar, sedan, SUV, hingga MPV premium. Lepas kunci untuk bebas menjelajah, atau bersama sopir pribadi untuk kemewahan tanpa repot.",
    "site.hero.ctaPrimary": "Jelajahi Koleksi",
    "site.hero.ctaSecondary": "Cara Berkendara",
    "site.hero.scroll": "Scroll",

    // ---- USP strip ----
    "site.usp.deposit.title": "Deposit Ringan",
    "site.usp.deposit.body":
      "Deposit jaminan yang wajar dan transparan — dibayarkan saat checkout, dikembalikan utuh setelah mobil kembali.",
    "site.usp.offers.title": "Penawaran Musiman",
    "site.usp.offers.body":
      "Tarif spesial di musim-musim tertentu — sapa concierge kami untuk kode promo yang sedang berlaku.",
    "site.usp.offers.cta": "Tanyakan kode promo",
    "site.usp.delivery.title": "Antar Gratis",
    "site.usp.delivery.body": "Mobil kami antar sampai ke vila atau hotel Anda, di mana pun di Bali.",

    // ---- Offers band ----
    "site.offers.kicker": "Punya kode promo?",
    "site.offers.title": "Cukup masukkan saat booking.",
    "site.offers.body":
      "Kode musiman kami bagikan secara pribadi melalui tim concierge — sapa kami di WhatsApp, dan penawaran terbaru langsung kami kirimkan.",
    "site.offers.cta": "Tanyakan kode promo",
    "site.offers.card1.title": "Tarif Musiman",
    "site.offers.card1.body":
      "Harga lebih bersahabat untuk sewa tiga hari atau lebih, lepas kunci maupun dengan sopir.",
    "site.offers.card2.title": "Pesan Lebih Awal",
    "site.offers.card2.body":
      "Amankan jadwal jauh-jauh hari, dan mobil incaran Anda yang menunggu — bukan sebaliknya.",
    "site.offers.card3.title": "Acara & Pernikahan",
    "site.offers.card3.body":
      "Paket sopir yang dirancang khusus untuk pernikahan, pemotretan, dan perayaan Anda.",

    // ---- Experience ----
    "site.experience.kicker": "Kenapa Prestige",
    "site.experience.title": "Sebuah pengalaman, bukan sekadar transaksi.",
    "site.experience.feature1.title": "Armada Prima",
    "site.experience.feature1.body":
      "Setiap mobil dirawat detail, diservis, dan diasuransikan penuh sebelum tiba di tangan Anda.",
    "site.experience.feature2.title": "Booking Tanpa Ribet",
    "site.experience.feature2.body":
      "Reservasi online hitungan menit — konfirmasi langsung, pembayaran aman.",
    "site.experience.feature3.title": "Sopir Profesional",
    "site.experience.feature3.body":
      "Sopir santun dan berpengalaman untuk pernikahan, acara, hingga perjalanan bisnis.",
    "site.experience.feature4.title": "Concierge 24 Jam",
    "site.experience.feature4.body":
      "Selalu ada yang bisa dihubungi — sejak tanya-tanya pertama sampai mobil kembali.",

    // ---- Collection ----
    "site.collection.kicker": "Koleksi Kami",
    "site.collection.title": "Pilih mobil Anda.",
    "site.collection.available": "tersedia",
    "site.collection.categoryLabel": "Kategori",
    "site.collection.marqueLabel": "Merek",
    "site.collection.all": "Semua",
    "site.collection.noMatch": "Belum ada mobil yang pas dengan filter ini — coba longgarkan pilihannya.",

    // ---- Modes ----
    "site.modes.kicker": "Dua Cara Berkendara",
    "site.modes.title": "Tiba dengan cara Anda.",
    "site.modes.selfDrive.title": "Pegang kemudinya sendiri.",
    "site.modes.selfDrive.body":
      "Bebas menjelajah sesuka hati. SIM terverifikasi, deposit kembali utuh, jarak tempuh transparan.",
    "site.modes.chauffeur.title": "Biar kami yang menyetir.",
    "site.modes.chauffeur.body":
      "Sopir profesional untuk pernikahan, acara, dan perjalanan bisnis. Anda tinggal duduk nyaman — sisanya urusan kami.",

    // ---- Stats ----
    "site.stats.marques": "Merek",
    "site.stats.vehicles": "Kendaraan",
    "site.stats.concierge": "Concierge",
    "site.stats.insured": "Terasuransi",

    // ---- Final CTA ----
    "site.finalCta.kicker": "Kapan pun Anda siap",
    "site.finalCta.title": "Reservasi mobil Anda.",
    "site.finalCta.sub":
      "Lihat-lihat koleksinya, booking dalam hitungan menit — konfirmasi langsung, pembayaran aman.",
    "site.finalCta.cta": "Jelajahi Koleksi",

    // ---- Bali story ----
    "site.baliStory.kicker": "Jelajahi Bali",
    "site.baliStory.title": "Dari Seminyak ke Ubud, dengan cara Anda sendiri.",
    "site.baliStory.lede":
      "Bali selalu memanjakan mereka yang memilih rute terindah. Pagi menembus sawah berundak, sore menyusuri jalan tebing di atas Samudra Hindia — dengan mobil yang pantas masuk dalam setiap bingkai foto.",
    "site.baliStory.body":
      "Hadiri pernikahan di tebing Uluwatu dengan penampilan tetap sempurna. Susuri pantai Canggu kala langit berubah keemasan. Atau naiklah ke Ubud untuk makan malam di tepi sawah. Ke mana pun arah Anda, mobilnya sudah siap, terasuransi, dan menunggu.",
    "site.baliStory.caption": "Ubud · Bali Tengah",
    "site.baliStory.cta": "Pilih mobil Anda",

    // ---- How it works ----
    "site.howItWorks.kicker": "Mudah & Cepat",
    "site.howItWorks.title": "Caranya sederhana",
    "site.howItWorks.step1.title": "Pilih mobilnya",
    "site.howItWorks.step1.body":
      "Telusuri koleksi, tentukan merek, kategori, dan tanggal yang pas dengan rencana Anda.",
    "site.howItWorks.step2.title": "Booking & bayar DP online",
    "site.howItWorks.step2.body":
      "Selesai dalam hitungan menit — konfirmasi langsung, dengan deposit aman yang kembali utuh.",
    "site.howItWorks.step3.title": "Nyetir sendiri, atau diantar",
    "site.howItWorks.step3.body":
      "Pegang kemudi sendiri, atau serahkan pada sopir profesional kami.",

    // ---- Testimonials ----
    "site.testimonials.kicker": "Testimoni",
    "site.testimonials.title": "Kata mereka",
    "site.testimonials.q1.text":
      "Bentley-nya sudah menunggu di gerbang vila — kinclong, tepat waktu. Berkat sopirnya, tiap malam di Seminyak terasa ringan tanpa mikir apa-apa.",
    "site.testimonials.q1.name": "Amara S.",
    "site.testimonials.q1.meta": "Singapura",
    "site.testimonials.q2.text":
      "Seminggu bawa Range Rover sendiri menyusuri pesisir Bukit. Mobilnya tanpa cela, deposit jelas, dan timnya masih membalas chat tengah malam.",
    "site.testimonials.q2.name": "James W.",
    "site.testimonials.q2.meta": "Australia",
    "site.testimonials.q3.text":
      "Mercedes untuk pernikahan kami di Ubud disiapkan sampai ke detail terkecil. Tidak berlebihan, elegan — mewah dalam arti yang sesungguhnya.",
    "site.testimonials.q3.name": "Putri R.",
    "site.testimonials.q3.meta": "Jakarta",

    // ---- FAQ ----
    "site.faq.kicker": "Tanya Jawab",
    "site.faq.title": "Yang sering ditanyakan",
    "site.faq.q1.q": "Apakah mobil bisa diantar ke hotel atau vila saya?",
    "site.faq.q1.a":
      "Bisa. Kami antar dan jemput ke hotel, vila, atau kediaman pribadi di Seminyak, Canggu, Ubud, Nusa Dua, hingga bandara — mengikuti jadwal Anda.",
    "site.faq.q2.q": "Apa saja syarat untuk menyetir sendiri?",
    "site.faq.q2.a":
      "Cukup paspor yang masih berlaku dan SIM negara asal beserta SIM Internasional (IDP), atau SIM Indonesia. Deposit jaminan ditahan selama masa sewa dan kembali utuh di akhir.",
    "site.faq.q3.q": "Bagaimana soal deposit dan asuransi?",
    "site.faq.q3.a":
      "Deposit mengamankan reservasi Anda dan dikembalikan utuh begitu mobil kembali dalam kondisi baik. Semua mobil terasuransi penuh — cakupan dan ketentuannya kami jelaskan gamblang sebelum Anda konfirmasi.",
    "site.faq.q4.q": "Bisa pesan sopir untuk pernikahan atau acara?",
    "site.faq.q4.a":
      "Tentu. Sopir kami santun dan berseragam rapi, siap untuk pernikahan, pemotretan, maupun perjalanan bisnis — dengan paket per jam atau seharian penuh yang menyesuaikan jadwal Anda.",
    "site.faq.q5.q": "Bagaimana jika saya perlu membatalkan?",
    "site.faq.q5.a":
      "Rencana bisa berubah, kami paham. Batalkan minimal 48 jam sebelum jadwal dan deposit kembali utuh; jika kurang dari itu, kami selalu upayakan penjadwalan ulang lebih dulu.",

    // ---- About ----
    "site.about.kicker": "Tentang Prestige Bali",
    "site.about.title": "Kemewahan yang dikurasi khusus untuk pulau ini.",
    "site.about.lede":
      "Prestige Bali memadukan armada istimewa, tim yang santun, dan layanan sepanjang waktu — agar setiap perjalanan Anda di pulau ini terasa ringan.",
    "site.about.body1":
      "Setiap mobil dalam koleksi kami pilih sendiri: supercar, sedan eksekutif, SUV, dan MPV premium — semuanya dirawat detail, diservis, dan diasuransikan penuh sebelum sampai ke tangan Anda. Semua kami tangani langsung, tanpa menyerahkan apa pun pada kebetulan.",
    "site.about.body2":
      "Lebih suka disetiri? Sopir kami terlatih, berseragam rapi, dan hafal pulau ini luar-dalam — dari berangkat subuh mengejar matahari terbit di Uluwatu, sampai menunggu dengan tenang di luar acara malam di Seminyak.",
    "site.about.body3":
      "Tim concierge kami siaga 24 jam, dari pertanyaan pertama Anda sampai mobil kembali dengan selamat. Kapan pun butuh bantuan, cukup kirim satu pesan.",
    "site.about.stat1Value": "12+",
    "site.about.stat1Label": "Merek terkurasi",
    "site.about.stat2Value": "24/7",
    "site.about.stat2Label": "Concierge siaga",
    "site.about.stat3Value": "100%",
    "site.about.stat3Label": "Armada terasuransi",
    "site.about.ctaWhatsApp": "Sapa concierge kami",
    "site.about.ctaFleet": "Jelajahi Koleksi",

    // ---- Blog ----
    "site.blog.kicker": "Jurnal",
    "site.blog.title": "Cerita dari pulau ini.",
    "site.blog.sub":
      "Catatan tentang armada kami, rute-rute yang layak ditempuh, dan keseharian Prestige Bali.",
    "site.blog.empty": "Cerita baru sedang kami siapkan — mampir lagi sebentar lagi, ya.",
    "site.blog.backToBlog": "Kembali ke Jurnal",
    "site.blog.readMore": "Baca selengkapnya",
    "site.blog.notFoundTitle": "Cerita tidak ditemukan",
    "site.blog.notFoundBody": "Cerita ini mungkin sudah dipindahkan atau tidak lagi tayang.",

    // ---- Car detail ----
    "site.detail.back": "Kembali ke koleksi",
    "site.detail.specifications": "Spesifikasi",
    "site.detail.rates": "Tarif",
    "site.detail.contactPricing": "Hubungi kami untuk penawaran harga.",
    "site.detail.outOfStock": "Stok habis",
    "site.detail.unit": "unit",
    "site.detail.units": "unit",
    "site.detail.disclaimer":
      "Warna dan unit ditentukan oleh tim kami menjelang hari-H — bagian dari cara kami menjaga kualitas setiap armada.",
  },
  ru: {
    // ---- Nav ----
    "site.nav.experience": "Преимущества",
    "site.nav.waysToRide": "Форматы аренды",

    // ---- Hero ----
    "site.hero.kicker": "Аренда автомобилей класса люкс · Бали",
    "site.hero.title1": "Искусство",
    "site.hero.title2": "прибытия.",
    "site.hero.sub":
      "Коллекция суперкаров, седанов, внедорожников и премиальных минивэнов. За рулём сами — ради свободы дороги. С личным водителем — ради роскоши без забот.",
    "site.hero.ctaPrimary": "Смотреть автопарк",
    "site.hero.ctaSecondary": "Форматы аренды",
    "site.hero.scroll": "Листайте",

    // ---- USP strip ----
    "site.usp.deposit.title": "Умеренный залог",
    "site.usp.deposit.body":
      "Честный и прозрачный залог: вносится при оформлении и возвращается полностью после возврата автомобиля.",
    "site.usp.offers.title": "Сезонные предложения",
    "site.usp.offers.body":
      "Особые условия в течение сезона — актуальный промокод подскажет наш консьерж.",
    "site.usp.offers.cta": "Узнать промокод",
    "site.usp.delivery.title": "Бесплатная подача",
    "site.usp.delivery.body": "Подадим автомобиль к вашей вилле или отелю в любой точке Бали.",

    // ---- Offers band ----
    "site.offers.kicker": "У вас есть промокод?",
    "site.offers.title": "Просто укажите его при бронировании.",
    "site.offers.body":
      "Сезонные коды мы передаём лично, через консьержа. Напишите нам в WhatsApp — и мы поделимся актуальным предложением.",
    "site.offers.cta": "Узнать промокод",
    "site.offers.card1.title": "Сезонный тариф",
    "site.offers.card1.body":
      "Особые условия при аренде от трёх дней — за рулём или с водителем.",
    "site.offers.card2.title": "Раннее бронирование",
    "site.offers.card2.body":
      "Бронируйте заранее — и выбирайте автомобиль первым.",
    "site.offers.card3.title": "Свадьбы и события",
    "site.offers.card3.body":
      "Пакеты с личным водителем для свадеб, фотосъёмок и торжеств.",

    // ---- Experience ----
    "site.experience.kicker": "Почему Prestige",
    "site.experience.title": "Это впечатление, а не просто аренда.",
    "site.experience.feature1.title": "Безупречный автопарк",
    "site.experience.feature1.body":
      "Каждый автомобиль подготовлен, обслужен и застрахован до мелочей — прежде чем попасть к вам.",
    "site.experience.feature2.title": "Бронирование за минуты",
    "site.experience.feature2.body":
      "Онлайн, с мгновенным подтверждением и безопасной оплатой.",
    "site.experience.feature3.title": "Тактичные водители",
    "site.experience.feature3.body":
      "Профессионалы за рулём — для свадеб, событий и деловых поездок.",
    "site.experience.feature4.title": "Консьерж 24/7",
    "site.experience.feature4.body":
      "Мы на связи всегда: от первого вопроса до возврата автомобиля.",

    // ---- Collection ----
    "site.collection.kicker": "Коллекция",
    "site.collection.title": "Выберите свой автомобиль.",
    "site.collection.available": "в наличии",
    "site.collection.categoryLabel": "Категория",
    "site.collection.marqueLabel": "Марка",
    "site.collection.all": "Все",
    "site.collection.noMatch": "Под эти фильтры ничего не нашлось — попробуйте смягчить условия.",

    // ---- Modes ----
    "site.modes.kicker": "Два формата аренды",
    "site.modes.title": "Прибывайте так, как нравится вам.",
    "site.modes.selfDrive.title": "Сами за рулём.",
    "site.modes.selfDrive.body":
      "Полная свобода дороги. Проверенные права, возвратный залог, честный учёт пробега.",
    "site.modes.chauffeur.title": "Доверьтесь водителю.",
    "site.modes.chauffeur.body":
      "Личный водитель для свадеб, событий и деловых поездок. Просто откиньтесь на сиденье — и прибудьте красиво.",

    // ---- Stats ----
    "site.stats.marques": "Марок",
    "site.stats.vehicles": "Автомобилей",
    "site.stats.concierge": "Консьерж",
    "site.stats.insured": "Застраховано",

    // ---- Final CTA ----
    "site.finalCta.kicker": "Мы готовы, когда готовы вы",
    "site.finalCta.title": "Забронируйте свой автомобиль.",
    "site.finalCta.sub":
      "Выберите автомобиль и оформите бронь за считаные минуты — мгновенное подтверждение, безопасная оплата.",
    "site.finalCta.cta": "Смотреть автопарк",

    // ---- Bali story ----
    "site.baliStory.kicker": "Откройте Бали",
    "site.baliStory.title": "От Семиньяка до Убуда — в своём ритме.",
    "site.baliStory.lede":
      "Этот остров щедр к тем, кто выбирает красивую дорогу. Утро среди рисовых террас, день на серпантинах над Индийским океаном — и автомобиль, достойный каждого кадра.",
    "site.baliStory.body":
      "Приезжайте на свадьбу на утёсах Улувату безупречным. Ловите золотой час на побережье Чангу. Поднимитесь в Убуд — на ужин среди террас. Какую бы дорогу вы ни выбрали, автомобиль уже подготовлен, застрахован и ждёт.",
    "site.baliStory.caption": "Убуд · Центральный Бали",
    "site.baliStory.cta": "Выбрать автомобиль",

    // ---- How it works ----
    "site.howItWorks.kicker": "Просто и удобно",
    "site.howItWorks.title": "Как это работает",
    "site.howItWorks.step1.title": "Выберите автомобиль",
    "site.howItWorks.step1.body":
      "Просмотрите коллекцию, определитесь с маркой, категорией и датами поездки.",
    "site.howItWorks.step2.title": "Забронируйте и внесите депозит",
    "site.howItWorks.step2.body":
      "Пара минут онлайн: мгновенное подтверждение и возвратный депозит.",
    "site.howItWorks.step3.title": "За рулём — вы или наш водитель",
    "site.howItWorks.step3.body":
      "Ведите сами — или доверьте дорогу тактичному профессионалу.",

    // ---- Testimonials ----
    "site.testimonials.kicker": "Отзывы",
    "site.testimonials.title": "Что говорят наши гости",
    "site.testimonials.q1.text":
      "Bentley ждал нас у ворот виллы — безупречный, минута в минуту. С таким водителем каждый вечер в Семиньяке проходил легко и красиво.",
    "site.testimonials.q1.name": "Амара С.",
    "site.testimonials.q1.meta": "Сингапур",
    "site.testimonials.q2.text":
      "Неделю ездил на Range Rover вдоль южного побережья. Машина без единого нарекания, залог вернули полностью, а команда отвечала даже за полночь.",
    "site.testimonials.q2.name": "Джеймс У.",
    "site.testimonials.q2.meta": "Австралия",
    "site.testimonials.q3.text":
      "Mercedes на нашу свадьбу в Убуде подготовили до мельчайших деталей. Сдержанно, элегантно — по-настоящему роскошно.",
    "site.testimonials.q3.name": "Путри Р.",
    "site.testimonials.q3.meta": "Джакарта",

    // ---- FAQ ----
    "site.faq.kicker": "Вопросы и ответы",
    "site.faq.title": "Частые вопросы",
    "site.faq.q1.q": "Вы подаёте автомобиль к отелю или вилле?",
    "site.faq.q1.a":
      "Да. Подача и приём — у любого отеля, виллы или частного дома в Семиньяке, Чангу, Убуде, Нуса-Дуа и в аэропорту, в удобное вам время.",
    "site.faq.q2.q": "Что нужно, чтобы ездить самому?",
    "site.faq.q2.a":
      "Действующий паспорт и национальные права вместе с международным водительским удостоверением — либо индонезийские права. На время аренды удерживается возвратный залог.",
    "site.faq.q3.q": "Как устроены залог и страховка?",
    "site.faq.q3.a":
      "Залог закрепляет бронь и возвращается полностью после благополучного возврата автомобиля. Каждый автомобиль застрахован по полному пакету; условия покрытия мы озвучиваем до подтверждения брони.",
    "site.faq.q4.q": "Можно ли взять водителя на свадьбу или событие?",
    "site.faq.q4.a":
      "Конечно. Наши водители — тактичные, в строгой форме — работают на свадьбах, фотосъёмках и деловых мероприятиях. Есть гибкие почасовые пакеты и аренда на весь день.",
    "site.faq.q5.q": "Каковы условия отмены?",
    "site.faq.q5.a":
      "Планы меняются — мы понимаем. При отмене за 48 часов и более депозит возвращается полностью; если времени меньше, мы в первую очередь предложим перенести бронь.",

    // ---- About ----
    "site.about.kicker": "О Prestige Bali",
    "site.about.title": "Роскошь, созданная для этого острова.",
    "site.about.lede":
      "Prestige Bali — это исключительный автопарк, тактичная команда и забота в режиме 24/7. Чтобы каждая ваша поездка по острову была лёгкой.",
    "site.about.body1":
      "Каждый автомобиль коллекции мы отбираем сами: суперкары, представительские седаны, внедорожники и премиальные минивэны. Все они подготовлены, обслужены и полностью застрахованы — прежде чем попасть к вам. Ничего чужим рукам, ничего на волю случая.",
    "site.about.body2":
      "Предпочитаете ехать пассажиром? Наши водители обучены, безукоризненно одеты и знают остров как свои пять пальцев — от рассветного выезда к Улувату до тихого ожидания у вечернего приёма в Семиньяке.",
    "site.about.body3":
      "Команда консьержей на связи круглосуточно — от первого вашего сообщения до возврата автомобиля. Помощь всегда в одном сообщении от вас.",
    "site.about.stat1Value": "12+",
    "site.about.stat1Label": "Марок в коллекции",
    "site.about.stat2Value": "24/7",
    "site.about.stat2Label": "Консьерж на связи",
    "site.about.stat3Value": "100%",
    "site.about.stat3Label": "Автопарк застрахован",
    "site.about.ctaWhatsApp": "Написать консьержу",
    "site.about.ctaFleet": "Смотреть автопарк",

    // ---- Blog ----
    "site.blog.kicker": "Журнал",
    "site.blog.title": "Истории острова.",
    "site.blog.sub":
      "Заметки об автопарке, дорогах, ради которых стоит сесть за руль, и жизни Prestige Bali.",
    "site.blog.empty": "Новые истории уже в пути — загляните чуть позже.",
    "site.blog.backToBlog": "Назад в журнал",
    "site.blog.readMore": "Читать",
    "site.blog.notFoundTitle": "История не найдена",
    "site.blog.notFoundBody": "Возможно, эту историю перенесли или сняли с публикации.",

    // ---- Car detail ----
    "site.detail.back": "К коллекции",
    "site.detail.specifications": "Характеристики",
    "site.detail.rates": "Тарифы",
    "site.detail.contactPricing": "Уточните стоимость у нашей команды.",
    "site.detail.outOfStock": "Нет свободных авто",
    "site.detail.unit": "авто",
    "site.detail.units": "авто",
    "site.detail.disclaimer":
      "Цвет и конкретный автомобиль закрепляет наша команда ближе к дате — так мы гарантируем безупречное состояние каждой машины.",
  },
  zh: {
    // ---- Nav ----
    "site.nav.experience": "尊享服务",
    "site.nav.waysToRide": "用车方式",

    // ---- Hero ----
    "site.hero.kicker": "巴厘岛豪华租车",
    "site.hero.title1": "抵达，",
    "site.hero.title2": "亦是一门艺术。",
    "site.hero.sub":
      "超跑、豪华轿车、SUV 与高端 MPV，臻选成队。自驾，尽享驰骋之乐；专属司机，从容尊享。",
    "site.hero.ctaPrimary": "浏览车队",
    "site.hero.ctaSecondary": "用车方式",
    "site.hero.scroll": "下滑探索",

    // ---- USP strip ----
    "site.usp.deposit.title": "押金透明",
    "site.usp.deposit.body": "押金合理透明——下单时支付，还车后全额原路退还。",
    "site.usp.offers.title": "时令优惠",
    "site.usp.offers.body": "季节限定专属价——欢迎向礼宾团队索取当期优惠码。",
    "site.usp.offers.cta": "索取优惠码",
    "site.usp.delivery.title": "全岛免费送车",
    "site.usp.delivery.body": "无论别墅还是酒店，车辆送达巴厘岛任何角落。",

    // ---- Offers band ----
    "site.offers.kicker": "已有优惠码？",
    "site.offers.title": "预订时输入，即刻生效。",
    "site.offers.body":
      "时令优惠码由礼宾团队一对一发放——通过 WhatsApp 联系我们，当期优惠即刻奉上。",
    "site.offers.cta": "索取优惠码",
    "site.offers.card1.title": "时令优惠价",
    "site.offers.card1.body": "连租三天及以上，自驾或含司机均享更优价格。",
    "site.offers.card2.title": "提早预订",
    "site.offers.card2.body": "提前锁定行程，心仪座驾优先为您保留。",
    "site.offers.card3.title": "婚礼与庆典",
    "site.offers.card3.body": "婚礼、拍摄与各式庆典的专属司机套餐，按需定制。",

    // ---- Experience ----
    "site.experience.kicker": "为何选择 Prestige",
    "site.experience.title": "一场体验，而非一次交易。",
    "site.experience.feature1.title": "车况臻于完美",
    "site.experience.feature1.body": "每辆车交付前皆经精细美容、专业保养，并投保全险。",
    "site.experience.feature2.title": "预订轻而易举",
    "site.experience.feature2.body": "在线数分钟完成预订，即时确认，支付无忧。",
    "site.experience.feature3.title": "司机专业周到",
    "site.experience.feature3.body": "婚礼、活动、商务出行，皆有资深司机相伴。",
    "site.experience.feature4.title": "礼宾全天候",
    "site.experience.feature4.body": "从首次咨询到安全还车，专属团队时刻在线。",

    // ---- Collection ----
    "site.collection.kicker": "臻选车队",
    "site.collection.title": "遇见您的座驾。",
    "site.collection.available": "辆可选",
    "site.collection.categoryLabel": "车型",
    "site.collection.marqueLabel": "品牌",
    "site.collection.all": "全部",
    "site.collection.noMatch": "暂无符合条件的车辆，不妨放宽筛选试试。",

    // ---- Modes ----
    "site.modes.kicker": "两种用车方式",
    "site.modes.title": "以您喜欢的方式抵达。",
    "site.modes.selfDrive.title": "亲执方向盘。",
    "site.modes.selfDrive.body": "自在驰骋。驾照核验、押金可退、里程透明。",
    "site.modes.chauffeur.title": "交给我们来开。",
    "site.modes.chauffeur.body": "婚礼、活动与商务出行的专属司机。您只需安坐，优雅抵达。",

    // ---- Stats ----
    "site.stats.marques": "品牌",
    "site.stats.vehicles": "车辆",
    "site.stats.concierge": "礼宾服务",
    "site.stats.insured": "全额投保",

    // ---- Final CTA ----
    "site.finalCta.kicker": "随时恭候",
    "site.finalCta.title": "预订您的座驾。",
    "site.finalCta.sub": "浏览车队，数分钟完成预订——即时确认，支付无忧。",
    "site.finalCta.cta": "浏览车队",

    // ---- Bali story ----
    "site.baliStory.kicker": "探索巴厘岛",
    "site.baliStory.title": "从水明漾到乌布，随心而行。",
    "site.baliStory.lede":
      "这座岛屿，总是偏爱绕远路看风景的人。清晨穿行于层层梯田，午后驰骋在临海崖道——而您的座驾，本身就是风景的一部分。",
    "site.baliStory.body":
      "赴一场乌鲁瓦图的悬崖婚礼，衣冠楚楚而至；在苍古的海岸线上，追一场镀金的日落；或上行至乌布，在梯田间共进晚餐。无论行往何处，座驾早已备妥、投保，静候出发。",
    "site.baliStory.caption": "乌布 · 巴厘岛中部",
    "site.baliStory.cta": "遇见您的座驾",

    // ---- How it works ----
    "site.howItWorks.kicker": "简单三步",
    "site.howItWorks.title": "预订流程",
    "site.howItWorks.step1.title": "挑选座驾",
    "site.howItWorks.step1.body": "浏览车队，选定品牌、车型与用车日期。",
    "site.howItWorks.step2.title": "在线预订，支付定金",
    "site.howItWorks.step2.body": "数分钟完成，即时确认；押金安全无忧，可全额退还。",
    "site.howItWorks.step3.title": "自驾出发，或专人接驾",
    "site.howItWorks.step3.body": "亲自驾驭，或全程交由专业司机打理。",

    // ---- Testimonials ----
    "site.testimonials.kicker": "宾客之声",
    "site.testimonials.title": "他们如是说",
    "site.testimonials.q1.text":
      "宾利准时停在别墅门前，一尘不染。有这样的司机，水明漾的每个夜晚都优雅从容。",
    "site.testimonials.q1.name": "Amara S.",
    "site.testimonials.q1.meta": "新加坡",
    "site.testimonials.q2.text":
      "开着揽胜沿南部海岸自驾一周：车况无可挑剔，押金分毫不差地退还，深夜发消息也有人秒回。",
    "site.testimonials.q2.name": "James W.",
    "site.testimonials.q2.meta": "澳大利亚",
    "site.testimonials.q3.text":
      "乌布婚礼上的那辆奔驰，每个细节都替我们想到了。低调、优雅——是真正的奢华。",
    "site.testimonials.q3.name": "Putri R.",
    "site.testimonials.q3.meta": "雅加达",

    // ---- FAQ ----
    "site.faq.kicker": "常见问题",
    "site.faq.title": "您可能想了解",
    "site.faq.q1.q": "可以把车送到我的酒店或别墅吗？",
    "site.faq.q1.a":
      "当然。水明漾、苍古、乌布、努沙杜瓦及机场范围内的酒店、别墅或私宅，均可按您的行程送车与取车。",
    "site.faq.q2.q": "自驾需要哪些证件？",
    "site.faq.q2.a":
      "有效护照，加上本国驾照与国际驾照（IDP），或持印尼驾照即可。租期内会收取可退还押金，还车后全额退还。",
    "site.faq.q3.q": "押金和保险如何安排？",
    "site.faq.q3.a":
      "押金用于保障预订，车辆完好归还后即全额退还。每辆车均投保全险，保障范围与免赔额在您确认前都会一一说明。",
    "site.faq.q4.q": "婚礼或活动可以预订司机吗？",
    "site.faq.q4.a":
      "可以。我们的司机着装得体、举止专业，常年服务于婚礼、拍摄与商务场合，提供灵活的按时段或全日套餐。",
    "site.faq.q5.q": "如需取消怎么办？",
    "site.faq.q5.a":
      "计划有变，在所难免。用车前 48 小时以上取消，押金全额退还；不足 48 小时，我们也会优先为您协调改期。",

    // ---- About ----
    "site.about.kicker": "关于 Prestige Bali",
    "site.about.title": "为这座岛，臻选奢华。",
    "site.about.lede":
      "卓越车队、周到团队、全天候礼宾——Prestige Bali 让您在岛上的每一程都从容自在。",
    "site.about.body1":
      "车队中的每一辆，都由我们亲自甄选：超跑、行政轿车、SUV 与高端 MPV。交付之前，逐一精细养护、专业保养、投保全险。事必躬亲，不留侥幸。",
    "site.about.body2":
      "想省心出行？我们的司机训练有素、着装得体，对全岛了然于心——无论是黎明启程奔赴乌鲁瓦图，还是在水明漾的晚宴外静静守候。",
    "site.about.body3":
      "专属礼宾团队全天候在线，从您的第一条咨询到车辆安全归还，一路相伴。需要帮助时，一条消息足矣。",
    "site.about.stat1Value": "12+",
    "site.about.stat1Label": "臻选品牌",
    "site.about.stat2Value": "24/7",
    "site.about.stat2Label": "礼宾在线",
    "site.about.stat3Value": "100%",
    "site.about.stat3Label": "车队投保",
    "site.about.ctaWhatsApp": "联系礼宾团队",
    "site.about.ctaFleet": "浏览车队",

    // ---- Blog ----
    "site.blog.kicker": "岛屿手记",
    "site.blog.title": "来自岛上的故事。",
    "site.blog.sub": "关于车队、值得专程一驾的公路，以及 Prestige Bali 的日常点滴。",
    "site.blog.empty": "新的故事正在路上，敬请期待。",
    "site.blog.backToBlog": "返回手记",
    "site.blog.readMore": "阅读全文",
    "site.blog.notFoundTitle": "未找到这篇故事",
    "site.blog.notFoundBody": "它可能已被移动，或暂时下线了。",

    // ---- Car detail ----
    "site.detail.back": "返回车队",
    "site.detail.specifications": "规格参数",
    "site.detail.rates": "租金",
    "site.detail.contactPricing": "详情请垂询我们的团队。",
    "site.detail.outOfStock": "暂无可用车辆",
    "site.detail.unit": "辆",
    "site.detail.units": "辆",
    "site.detail.disclaimer":
      "具体颜色与车辆由团队在用车前统一调配——这也是我们保障每辆车完美车况的方式。",
  },
};
