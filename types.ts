
export interface Product {
  id: number;
  nama: string;
  kategori: string;
  subKategori?: string; // New field for sub-categorization
  harga: number;
  deskripsi: string;
  image: string;
  tipe: 'Banten';
}

export interface VenuePackage {
  name: string;
  price: number;
  desc: string;
}

export interface Venue {
  id: number;
  nama: string;
  tipe: 'Venue';
  kategori: string;
  harga: number;
  lokasi: string;
  alamat: string;
  kapasitas: string;
  cateringPrice: number;
  fasilitas: string[];
  deskripsi: string;
  image: string;
  paket: VenuePackage[];
  opsiLokasi: string[];
  // Cart specific
  selectedPackage?: VenuePackage;
  selectedLocation?: string;
  guestCount?: number;
  cateringPricePerPax?: number;
  uniqueId?: string;
}

export interface Pandita {
  id: number;
  nama: string;
  tipe: 'Pandita';
  harga: number;
  griya: string;
  kabupaten: string;
  lokasi: string;
  spesialisasi: string;
  status: string;
  image: string;
  bio: string;
}

export interface CartItem {
  id: number | string;
  nama: string;
  harga: number;
  qty: number;
  tipe: 'Banten' | 'Venue' | 'Pandita';
  image?: string;
  // Venue specifics
  uniqueId?: string;
  selectedPackage?: VenuePackage;
  selectedLocation?: string;
  guestCount?: number;
  cateringPricePerPax?: number;
  // Pandita specifics
  griya?: string;
}

export interface User {
  name: string;
  phone: string;
  kabupaten: string;
  role: 'user' | 'admin';
}

export interface Order {
  id: string;
  pemesan: string;
  phone: string;
  location?: string; // Added for invoice address
  total: number;
  status: string;
  items: string[];
  cartItems?: CartItem[]; // Added to allow admin to re-generate invoice
  date: string;
  eventDate: string;
  eventTime: string;
  paymentMethod?: string;
  hasProof?: boolean;
}
