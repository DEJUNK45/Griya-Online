import React, { useState, useEffect } from 'react';
import { X, Plus, Info, CheckCircle, MapPin, Building, Utensils } from 'lucide-react';
import { Product, Pandita, Venue, VenuePackage } from '../types';
import { formatIDR } from '../utils';

interface ProductDetailProps {
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  addToCart: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailProps> = ({ selectedProduct, setSelectedProduct, addToCart }) => {
  if (!selectedProduct) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-scale-up">
        <button onClick={() => setSelectedProduct(null)} className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition z-10"><X className="w-5 h-5" /></button>
        <div className="h-64 bg-gray-200 relative overflow-hidden">
          <img src={selectedProduct.image} alt={selectedProduct.nama} className="w-full h-full object-cover transform hover:scale-105 transition duration-700" />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
            <span className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">{selectedProduct.kategori}</span>
          </div>
        </div>
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight font-serif">{selectedProduct.nama}</h2>
          <p className="text-orange-700 font-bold text-lg mb-4">{formatIDR(selectedProduct.harga)}</p>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-5"><h3 className="text-xs font-bold text-orange-800 mb-1 uppercase">Deskripsi / Kelengkapan</h3><p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.deskripsi}</p></div>
          <button onClick={() => addToCart(selectedProduct)} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-orange-700 flex justify-center items-center space-x-2 transition active:scale-95"><Plus className="w-5 h-5" /><span>Tambah ke Keranjang</span></button>
        </div>
      </div>
    </div>
  );
};

interface PanditaDetailProps {
  selectedPanditaDetail: Pandita | null;
  setSelectedPanditaDetail: (p: Pandita | null) => void;
  addToCart: (p: Pandita) => void;
}

export const PanditaDetailModal: React.FC<PanditaDetailProps> = ({ selectedPanditaDetail, setSelectedPanditaDetail, addToCart }) => {
  if (!selectedPanditaDetail) return null;
  const pandita = selectedPanditaDetail;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-scale-up">
        <button onClick={() => setSelectedPanditaDetail(null)} className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-700 rounded-full p-1 transition z-10 shadow-sm"><X className="w-5 h-5" /></button>
        <div className="p-6 pb-0 flex flex-col items-center text-center">
           <div className="w-24 h-24 rounded-full p-1 bg-white border-4 border-orange-100 shadow-md mb-4 relative"><img src={pandita.image} alt={pandita.nama} className="w-full h-full object-cover rounded-full" /><span className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></span></div>
           <h2 className="text-xl font-bold text-gray-800 leading-tight font-serif">{pandita.nama}</h2>
           <p className="text-orange-700 font-medium text-sm mt-1">{pandita.griya}</p>
           <div className="flex items-center text-gray-500 text-xs mt-2 bg-gray-50 px-3 py-1 rounded-full"><MapPin className="w-3 h-3 mr-1" /> {pandita.lokasi}</div>
        </div>
        <div className="p-6">
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6"><h3 className="text-xs font-bold text-orange-800 mb-2 uppercase flex items-center"><Info className="w-3 h-3 mr-1" /> Profil & Keahlian</h3><p className="text-sm text-gray-700 leading-relaxed italic">"{pandita.bio}"</p></div>
          <button onClick={() => addToCart(pandita)} className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-orange-700 flex justify-center items-center space-x-2 transition active:scale-95"><Plus className="w-5 h-5" /><span>Undang Beliau (Dana Punia)</span></button>
        </div>
      </div>
    </div>
  );
};

interface VenueDetailProps {
  selectedVenueDetail: Venue | null;
  setSelectedVenueDetail: (v: Venue | null) => void;
  addToCart: (v: Venue) => void;
}

export const VenueDetailModal: React.FC<VenueDetailProps> = ({ selectedVenueDetail, setSelectedVenueDetail, addToCart }) => {
  const [selectedPackage, setSelectedPackage] = useState<VenuePackage | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(100);

  useEffect(() => {
    if (selectedVenueDetail) {
      setSelectedPackage(selectedVenueDetail.paket?.[0] || null);
      setSelectedLocation(selectedVenueDetail.opsiLokasi?.[0] || null);
      setGuestCount(100);
    }
  }, [selectedVenueDetail]);

  if (!selectedVenueDetail) return null;
  const venue = selectedVenueDetail;
  const cateringTotal = guestCount * venue.cateringPrice;
  const grandTotal = (selectedPackage?.price || venue.harga) + cateringTotal;

  const handleBooking = () => {
    const finalItem: any = {
      ...venue,
      nama: `${venue.nama} (${guestCount} pax)`,
      harga: grandTotal,
      selectedPackage,
      selectedLocation,
      guestCount,
      cateringPricePerPax: venue.cateringPrice,
      uniqueId: `${venue.id}-${selectedPackage?.name}-${guestCount}` 
    };
    addToCart(finalItem);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="h-40 bg-gray-200 relative shrink-0">
          <button onClick={() => setSelectedVenueDetail(null)} className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition z-10"><X className="w-5 h-5" /></button>
          <img src={venue.image} alt={venue.nama} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
            <h2 className="text-xl font-serif font-bold text-white leading-tight">{venue.nama}</h2>
            <p className="text-white/80 text-xs flex items-center mt-1"><MapPin className="w-3 h-3 mr-1"/> {venue.lokasi}</p>
          </div>
        </div>
        <div className="p-5 overflow-y-auto">
           <div className="mb-5">
             <h3 className="font-bold text-sm text-gray-700 mb-2">1. Pilih Paket Utama</h3>
             <div className="space-y-2">
               {venue.paket && venue.paket.map((pkg, idx) => (
                 <div key={idx} onClick={() => setSelectedPackage(pkg)} className={`p-3 rounded-xl border-2 cursor-pointer transition flex justify-between items-center ${selectedPackage?.name === pkg.name ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}>
                   <div><p className={`text-sm font-bold ${selectedPackage?.name === pkg.name ? 'text-orange-800' : 'text-gray-700'}`}>{pkg.name}</p><p className="text-[10px] text-gray-500 line-clamp-1">{pkg.desc}</p></div>
                   <div className="text-right"><p className="text-xs font-bold text-orange-600">{formatIDR(pkg.price)}</p>{selectedPackage?.name === pkg.name && <div className="text-orange-600 flex justify-end mt-1"><CheckCircle className="w-4 h-4"/></div>}</div>
                 </div>
               ))}
             </div>
           </div>
           <div className="mb-5 bg-blue-50 p-3 rounded-xl border border-blue-100">
             <h3 className="font-bold text-sm text-blue-800 mb-2 flex items-center"><Utensils className="w-4 h-4 mr-2"/> 2. Jumlah Tamu & Catering</h3>
             <div className="flex items-center justify-between mb-2">
               <span className="text-xs text-blue-600">Estimasi Tamu (Pax)</span>
               <div className="flex items-center bg-white rounded-lg border border-blue-200 overflow-hidden">
                 <button onClick={() => setGuestCount(Math.max(50, guestCount - 10))} className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold">-</button>
                 <input type="number" value={guestCount} onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)} className="w-16 text-center text-sm font-bold outline-none py-1 text-blue-900" />
                 <button onClick={() => setGuestCount(guestCount + 10)} className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold">+</button>
               </div>
             </div>
             <div className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2"><span className="text-[10px] text-blue-500">Harga Catering: {formatIDR(venue.cateringPrice)} /pax</span><span className="text-sm font-bold text-blue-800">Total: {formatIDR(cateringTotal)}</span></div>
           </div>
           <div className="mb-4">
             <h3 className="font-bold text-sm text-gray-700 mb-2">3. Preferensi Lokasi</h3>
             <div className="flex flex-wrap gap-2">{venue.opsiLokasi && venue.opsiLokasi.map((loc, idx) => (<button key={idx} onClick={() => setSelectedLocation(loc)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selectedLocation === loc ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>{loc}</button>))}</div>
           </div>
        </div>
        <div className="p-4 border-t bg-white mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-bottom">
          <div className="flex justify-between items-end mb-3"><div><span className="text-xs text-gray-500 block">Total Estimasi (Paket + Catering)</span><span className="text-xl font-bold text-orange-700">{formatIDR(grandTotal)}</span></div></div>
          <button onClick={handleBooking} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-orange-700 flex justify-center items-center space-x-2 transition active:scale-95"><Building className="w-5 h-5" /><span>Booking Venue</span></button>
        </div>
      </div>
    </div>
  );
};