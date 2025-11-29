import { Product, Venue, Pandita } from './types';

export const DATA_KABUPATEN = [
  "Denpasar", "Badung", "Gianyar", "Tabanan", "Bangli", "Klungkung", "Karangasem", "Buleleng", "Jembrana"
];

export const DATA_VENUE: Venue[] = [
  { 
    id: 301, 
    nama: "Griya Taksu", 
    tipe: "Venue", 
    kategori: "Pawiwahan", 
    harga: 15000000, 
    lokasi: "Gianyar", 
    alamat: "Jl. Raya Mas, Ubud", 
    kapasitas: "Max 500 Pax", 
    cateringPrice: 65000, 
    fasilitas: ["Wantilan Utama", "Area Kebun", "Ruang Ganti", "Parkir Luas"],
    deskripsi: "Venue estetik dengan nuansa Bali klasik yang kental. Harga sewa venue belum termasuk catering.", 
    image: "https://placehold.co/400x300/orange/white?text=Griya+Taksu",
    paket: [
      { name: "Sewa Venue Saja", price: 15000000, desc: "Hanya sewa tempat 8 jam" },
      { name: "Paket Dekorasi Standar", price: 25000000, desc: "Venue + Dekorasi gerbang & pelaminan" },
      { name: "Paket All In", price: 45000000, desc: "Venue + Dekorasi Full + Sound System" }
    ],
    opsiLokasi: ["Indoor Wantilan", "Outdoor Garden", "Semi-Outdoor"]
  },
  { 
    id: 302, 
    nama: "Griya Beng", 
    tipe: "Venue", 
    kategori: "Pawiwahan", 
    harga: 12000000, 
    lokasi: "Gianyar", 
    alamat: "Desa Beng, Gianyar", 
    kapasitas: "Max 300 Pax", 
    cateringPrice: 50000,
    fasilitas: ["Bale Daja", "Natah Luas", "Dapur Umum"],
    deskripsi: "Griya bersejarah dengan arsitektur tradisional. Suasana kekeluargaan yang hangat.", 
    image: "https://placehold.co/400x300/orange/white?text=Griya+Beng",
    paket: [
      { name: "Sewa Natah", price: 12000000, desc: "Area Natah & Bale Daja" },
      { name: "Paket Heritage", price: 20000000, desc: "Include Gamelan Rindik & Dekorasi Janur" }
    ],
    opsiLokasi: ["Natah Griya (Outdoor)", "Bale Daja (Indoor)"]
  },
  { 
    id: 303, 
    nama: "Taman Prakerti Bhuana", 
    tipe: "Venue", 
    kategori: "Resepsi", 
    harga: 25000000, 
    lokasi: "Gianyar", 
    alamat: "Beng, Gianyar", 
    kapasitas: "Max 1000 Pax", 
    cateringPrice: 85000, 
    fasilitas: ["Wantilan Agung", "Sound System", "Kursi Tiffany", "Katering Area"],
    deskripsi: "Lokasi luas untuk resepsi agung. Akses mudah dan parkir sangat memadai.", 
    image: "https://placehold.co/400x300/orange/white?text=Taman+Prakerti",
    paket: [
      { name: "Sewa Wantilan", price: 25000000, desc: "Wantilan Agung Full AC" },
      { name: "Paket Grand Reception", price: 55000000, desc: "Venue + Lighting + Sound 5000watt" }
    ],
    opsiLokasi: ["Indoor Wantilan Agung", "Halaman Depan"]
  },
  { 
    id: 304, 
    nama: "Griya Gede Denpasar", 
    tipe: "Venue", 
    kategori: "Upacara", 
    harga: 18000000, 
    lokasi: "Denpasar", 
    alamat: "Denpasar Timur", 
    kapasitas: "Max 400 Pax",
    cateringPrice: 75000,
    fasilitas: ["Bale Pawedan", "Area Resepsi Indoor"],
    deskripsi: "Pilihan tepat untuk krama Denpasar. Lokasi strategis di tengah kota.", 
    image: "https://placehold.co/400x300/orange/white?text=Griya+Denpasar",
    paket: [
      { name: "Reguler", price: 18000000, desc: "Fasilitas standar griya" },
      { name: "VIP", price: 30000000, desc: "Include AC Standing & Tenda VIP" }
    ],
    opsiLokasi: ["Indoor Hall", "Area Pura (Khusus Prosesi)"]
  }
];

export const DATA_BANTEN: Product[] = [
  { id: 1, nama: "Canang Sari (50 pcs)", tipe: 'Banten', kategori: "Harian", subKategori: "Sajen", harga: 25000, deskripsi: "Canang sari segar janur pilihan, bunga harum.", image: "https://images.unsplash.com/photo-1596401057633-5b7f16755498?auto=format&fit=crop&q=80&w=400&h=400" },
  { id: 20, nama: "Canang Ceper (25 pcs)", tipe: 'Banten', kategori: "Harian", subKategori: "Sajen", harga: 20000, deskripsi: "Canang dengan alas ceper (kotak), cocok untuk pelinggih.", image: "https://placehold.co/400x400/orange/white?text=Canang+Ceper" },
  { id: 21, nama: "Dupa Harum (1kg)", tipe: 'Banten', kategori: "Harian", subKategori: "Perlengkapan Upacara", harga: 35000, deskripsi: "Dupa herbal aroma cempaka/cendana, nyala 2 jam.", image: "https://placehold.co/400x400/orange/white?text=Dupa+Harum" },
  { id: 7, nama: "Banten Segehan (10 tanding)", tipe: 'Banten', kategori: "Harian", subKategori: "Sajen", harga: 15000, deskripsi: "Segehan putih kuning dan mancawarna untuk harian.", image: "https://placehold.co/400x400/orange/white?text=Segehan" },
  { id: 2, nama: "Pejati Lengkap", tipe: 'Banten', kategori: "Dewa Yadnya", subKategori: "Upakara", harga: 150000, deskripsi: "Lengkap dengan daksina, peras, sodan, tipat kelanan, penyeneng.", image: "https://images.unsplash.com/photo-1555447035-159496053723?auto=format&fit=crop&q=80&w=400&h=400" },
  { id: 22, nama: "Banten Saraswati", tipe: 'Banten', kategori: "Dewa Yadnya", subKategori: "Upakara", harga: 120000, deskripsi: "Khusus untuk hari raya Saraswati.", image: "https://placehold.co/400x400/orange/white?text=Saraswati" },
  { id: 23, nama: "Banten Tumpek Landep", tipe: 'Banten', kategori: "Dewa Yadnya", subKategori: "Upakara", harga: 135000, deskripsi: "Untuk upacara motor/mobil/pusaka.", image: "https://placehold.co/400x400/orange/white?text=Tumpek+Landep" },
  { id: 6, nama: "Gebogan Buah Mewah", tipe: 'Banten', kategori: "Dewa Yadnya", subKategori: "Sajen", harga: 500000, deskripsi: "Tinggi 1 meter, buah impor dan bunga segar.", image: "https://images.unsplash.com/photo-1621867623956-613d9406540b?auto=format&fit=crop&q=80&w=400&h=400" },
  { id: 101, nama: "Banten Mepandes (Potong Gigi)", tipe: 'Banten', kategori: "Manusa Yadnya", subKategori: "Upakara", harga: 2500000, deskripsi: "Paket Madya lengkap: Bale gading, tumpeng pitu, caru ayam putih.", image: "https://placehold.co/400x400/orange/white?text=Mepandes" },
  { id: 102, nama: "Banten Megedong-gedongan", tipe: 'Banten', kategori: "Manusa Yadnya", subKategori: "Upakara", harga: 450000, deskripsi: "Untuk upacara kehamilan 7 bulan.", image: "https://placehold.co/400x400/orange/white?text=Gedong-gedongan" },
  { id: 103, nama: "Paket Pawiwahan (Nganten)", tipe: 'Banten', kategori: "Manusa Yadnya", subKategori: "Upakara", harga: 3500000, deskripsi: "Paket Alit: Banten Byakaon, Prayascita, Natab, Sanggah Surya sederhana.", image: "https://placehold.co/400x400/orange/white?text=Pawiwahan" },
  { id: 3, nama: "Paket Otonan Alit", tipe: 'Banten', kategori: "Manusa Yadnya", subKategori: "Upakara", harga: 350000, deskripsi: "Lengkap peras pengambean, tumpeng, untuk 6 bulanan.", image: "https://images.unsplash.com/photo-1516669913107-1d22757540db?auto=format&fit=crop&q=80&w=400&h=400" },
  { id: 104, nama: "Paket Ngaben Alit (Kremasi)", tipe: 'Banten', kategori: "Pitra Yadnya", subKategori: "Upakara", harga: 5000000, deskripsi: "Paket lengkap untuk upacara Makinsan ring Geni / Ngaben Alit.", image: "https://placehold.co/400x400/orange/white?text=Ngaben+Alit" },
  { id: 105, nama: "Banten Pengulapan", tipe: 'Banten', kategori: "Pitra Yadnya", subKategori: "Upakara", harga: 250000, deskripsi: "Digunakan untuk memanggil sang atma/roh.", image: "https://placehold.co/400x400/orange/white?text=Pengulapan" },
  { id: 5, nama: "Banten Prayascita", tipe: 'Banten', kategori: "Penyucian", subKategori: "Upakara", harga: 75000, deskripsi: "Untuk pembersihan diri atau bangunan secara niskala.", image: "https://placehold.co/400x400/orange/white?text=Prayascita" },
  { id: 9, nama: "Banten Byakaon", tipe: 'Banten', kategori: "Penyucian", subKategori: "Upakara", harga: 50000, deskripsi: "Upacara pendahuluan untuk penyucian sifat buta.", image: "https://placehold.co/400x400/orange/white?text=Byakaon" },
  { id: 4, nama: "Caru Ayam Brumbun", tipe: 'Banten', kategori: "Bhuta Yadnya", subKategori: "Upakara", harga: 1200000, deskripsi: "Eka Sata lengkap dengan sanggah cucuk.", image: "https://images.unsplash.com/photo-1576487134372-e14f6b0051d9?auto=format&fit=crop&q=80&w=400&h=400" },
];

export const DATA_PANDITA: Pandita[] = [
  { id: 201, nama: "Ida Pedanda Gede Putra", tipe: "Pandita", harga: 0, griya: "Griya Gede Sanur", kabupaten: "Denpasar", lokasi: "Sanur, Denpasar Selatan", spesialisasi: "Piodalan, Pawiwahan", status: "Tersedia", image: "https://placehold.co/400x400/orange/white?text=Pedanda+Sanur", bio: "Ida Pedanda Gede Putra saking Griya Gede Sanur sampun madue pengalaman muput upacara yadnya ageng." },
  { id: 202, nama: "Ida Pedanda Wayan Buruan", tipe: "Pandita", harga: 0, griya: "Griya Manuaba", kabupaten: "Gianyar", lokasi: "Blahbatuh, Gianyar", spesialisasi: "Karya Agung, Melaspas", status: "Tersedia", image: "https://placehold.co/400x400/orange/white?text=Pedanda+Gianyar", bio: "Sulinggih saking Gianyar sane sering muput Karya Agung lan Melaspas bangunan suci." },
  { id: 203, nama: "Jero Mangku Dalem", tipe: "Pandita", harga: 0, griya: "Griya Agung Ubud", kabupaten: "Gianyar", lokasi: "Ubud, Gianyar", spesialisasi: "Manusa Yadnya", status: "Tersedia", image: "https://placehold.co/400x400/orange/white?text=Mangku+Ubud", bio: "Jero Mangku sane ahli ring upacara Manusa Yadnya sekadi Otonan lan Metatah." },
  { id: 204, nama: "Ida Rsi Bhujangga", tipe: "Pandita", harga: 0, griya: "Griya Tegal", kabupaten: "Tabanan", lokasi: "Kediri, Tabanan", spesialisasi: "Pitra Yadnya (Ngaben)", status: "Tersedia", image: "https://placehold.co/400x400/orange/white?text=Ida+Rsi", bio: "Khusus muput upacara Pitra Yadnya lan Atma Wedana." },
  { id: 205, nama: "Ida Pedanda Gede Karang", tipe: "Pandita", harga: 0, griya: "Griya Sidemen", kabupaten: "Karangasem", lokasi: "Sidemen, Karangasem", spesialisasi: "Memukur, Maligya", status: "Tersedia", image: "https://placehold.co/400x400/orange/white?text=Pedanda+Karang", bio: "Sulinggih senior saking Karangasem, spesialis upacara penyucian roh lan Maligya." },
  { id: 206, nama: "Jero Mangku Gede Pura", tipe: "Pandita", harga: 0, griya: "Pura Jagatnatha", kabupaten: "Denpasar", lokasi: "Denpasar Timur", spesialisasi: "Persembahyangan Umum", status: "Tersedia", image: "https://placehold.co/400x400/orange/white?text=Mangku+Jagatnatha", bio: "Pemangku Pura Jagatnatha, ngenterang persembahyangan umum lan tirta yatra." },
];