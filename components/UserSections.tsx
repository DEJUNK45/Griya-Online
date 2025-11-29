
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MapPin, CheckCircle, ChevronRight, ClipboardList, Settings, HelpCircle, Info, LogOut, SlidersHorizontal, History, X, ChevronDown, ChevronUp, Building, Filter, FileText, Download, Clock, AlertTriangle } from 'lucide-react';
import { DATA_BANTEN, DATA_VENUE, DATA_PANDITA } from '../constants';
import { Product, Venue, Pandita, User, CartItem, Order } from '../types';
import { formatIDR, getSearchHistory, addToSearchHistory, clearSearchHistory, getOrdersDB, generateInvoicePDF } from '../utils';

interface CatalogProps {
  addToCart: (item: Product) => void;
  setSelectedProduct: (item: Product) => void;
  initialCategory: string;
}

export const CatalogSection: React.FC<CatalogProps> = ({ addToCart, setSelectedProduct, initialCategory }) => {
  const categories = ["Semua", "Harian", "Manusa Yadnya", "Dewa Yadnya", "Pitra Yadnya", "Bhuta Yadnya"];
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "Semua");
  const [selectedSubCategory, setSelectedSubCategory] = useState("Semua");
  
  // Search States
  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [activePriceFilter, setActivePriceFilter] = useState({ min: 0, max: Infinity });

  // Load History
  useEffect(() => {
    setSearchHistory(getSearchHistory('griya_history_banten'));
  }, []);

  // Sync category if parent changes
  useEffect(() => {
    if(initialCategory && initialCategory !== "Semua") setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Reset SubCategory when Main Category changes
  useEffect(() => {
    setSelectedSubCategory("Semua");
  }, [selectedCategory]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSearchInputValue(term);
    setIsSearchFocused(false);
    if (term.trim()) {
      setSearchHistory(addToSearchHistory('griya_history_banten', term) || []);
    }
  };

  const applyFilters = () => {
    const min = parseInt(priceRange.min.replace(/\D/g, '')) || 0;
    const max = parseInt(priceRange.max.replace(/\D/g, '')) || Infinity;
    setActivePriceFilter({ min, max });
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setPriceRange({ min: '', max: '' });
    setActivePriceFilter({ min: 0, max: Infinity });
    setIsFilterOpen(false);
  };

  // 1. First pass: Filter by Main Category & Search Term (to determine available sub-categories)
  const baseFilteredData = DATA_BANTEN.filter(item => {
    const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "Semua" || item.kategori === selectedCategory;
    const matchPrice = item.harga >= activePriceFilter.min && item.harga <= activePriceFilter.max;
    return matchSearch && matchCat && matchPrice;
  });

  // 2. Extract available sub-categories from the current view
  const availableSubCategories = ["Semua", ...Array.from(new Set(baseFilteredData.map(item => item.subKategori).filter(Boolean)))];

  // 3. Final pass: Filter by Sub Category
  const finalFilteredData = baseFilteredData.filter(item => {
    if (selectedSubCategory === "Semua") return true;
    return item.subKategori === selectedSubCategory;
  });

  // Logic for Auto-Suggestions
  const suggestions = searchInputValue.trim() 
    ? DATA_BANTEN.filter(item => item.nama.toLowerCase().includes(searchInputValue.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="pb-24 px-4 pt-4 animate-fade-in relative">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center font-serif">
        <span className="bg-orange-600 w-1 h-6 mr-2 rounded-full"></span>
        Katalog Banten
      </h2>
      
      {/* Search Bar & Filter */}
      <div className="mb-4 space-y-3 relative z-20" ref={searchContainerRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              value={searchInputValue} 
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Cari banten..." 
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm shadow-sm"
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchInputValue)} 
            />
            {searchInputValue && (
              <button 
                onClick={() => { setSearchInputValue(""); setSearchTerm(""); setIsSearchFocused(true); }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)} 
            className={`px-3 rounded-xl border transition flex items-center justify-center ${activePriceFilter.max !== Infinity ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-white border-gray-200 text-gray-600'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Search Overlay (History & Suggestions) */}
        {isSearchFocused && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-30 animate-fade-in">
            {searchInputValue.trim() === "" ? (
              // History View
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 flex items-center"><History className="w-3 h-3 mr-1" /> Riwayat</span>
                  {searchHistory.length > 0 && <button onClick={() => setSearchHistory(clearSearchHistory('griya_history_banten'))} className="text-[10px] text-red-500 hover:underline">Hapus</button>}
                </div>
                {searchHistory.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((hist, idx) => (
                      <button key={idx} onClick={() => handleSearch(hist)} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-700 transition">
                        {hist}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">Belum ada riwayat pencarian.</p>
                )}
              </div>
            ) : (
              // Suggestions View
              <div>
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => handleSearch(item.nama)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 border-b border-gray-50 last:border-0 flex justify-between items-center"
                    >
                      <span>{item.nama}</span>
                      <span className="text-[10px] text-gray-400">{formatIDR(item.harga)}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">Tidak ada saran. Tekan enter untuk mencari.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition ${selectedCategory === cat ? 'bg-orange-600 text-white border-orange-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>{cat}</button>
          ))}
        </div>

        {/* Sub Categories (Shown only if more than 1 option exists besides "Semua") */}
        {availableSubCategories.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide pt-1 border-t border-dashed border-gray-200">
             <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase mr-1"><Filter className="w-3 h-3 mr-1"/> Filter:</div>
             {availableSubCategories.map((sub: any) => (
               <button 
                key={sub} 
                onClick={() => setSelectedSubCategory(sub)} 
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border whitespace-nowrap transition ${selectedSubCategory === sub ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}
              >
                {sub}
              </button>
             ))}
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3 min-h-[200px]">
        {finalFilteredData.length > 0 ? (
          finalFilteredData.map((item) => (
            <div key={item.id} onClick={() => setSelectedProduct(item)} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="h-28 bg-gray-200 relative overflow-hidden">
                <img src={item.image} alt={item.nama} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="bg-orange-600/90 text-white text-[9px] px-1.5 py-0.5 backdrop-blur-sm rounded-md shadow-sm">{item.kategori}</span>
                  {item.subKategori && <span className="text-[8px] text-white/90 font-medium bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-md border border-white/20">{item.subKategori}</span>}
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 text-sm mb-1 leading-snug">{item.nama}</h3>
                <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{item.deskripsi}</p>
                <div className="mt-auto pt-2 flex justify-between items-center border-t border-dashed border-gray-200">
                  <span className="text-orange-700 font-bold text-xs">{formatIDR(item.harga)}</span>
                  <button onClick={(e) => { e.stopPropagation(); addToCart(item); }} className="bg-orange-50 text-orange-600 p-1.5 rounded-lg hover:bg-orange-600 hover:text-white transition shadow-sm"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))
        ) : (
           <div className="col-span-2 text-center py-10 text-gray-400 text-sm italic flex flex-col items-center">
             <Info className="w-8 h-8 mb-2 opacity-50"/>
             Banten tidak ditemukan. <br/>Coba kata kunci atau filter lain.
           </div>
        )}
      </div>

      {/* Filter Modal (Bottom Sheet) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-5 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="font-bold text-gray-800 flex items-center"><SlidersHorizontal className="w-4 h-4 mr-2"/> Filter Produk</h3>
              <button onClick={() => setIsFilterOpen(false)}><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            
            <div className="mb-6">
              <label className="text-sm font-bold text-gray-700 mb-2 block">Rentang Harga</label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500">Rp</span>
                  <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({...priceRange, min: e.target.value})} className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-orange-500"/>
                </div>
                <span className="text-gray-400">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500">Rp</span>
                  <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: e.target.value})} className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-orange-500"/>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button onClick={resetFilters} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold text-sm hover:bg-gray-50">Reset</button>
              <button onClick={applyFilters} className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 shadow-md">Terapkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface VenueSectionProps {
  setSelectedVenueDetail: (item: Venue) => void;
}

export const VenueSection: React.FC<VenueSectionProps> = ({ setSelectedVenueDetail }) => {
  // Search States
  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    location: 'Semua'
  });
  const [activeFilters, setActiveFilters] = useState({
    minPrice: 0,
    maxPrice: Infinity,
    location: 'Semua'
  });

  const locations = ["Semua", ...Array.from(new Set(DATA_VENUE.map(v => v.lokasi)))];

  // Load History
  useEffect(() => {
    setSearchHistory(getSearchHistory('griya_history_venue'));
  }, []);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSearchInputValue(term);
    setIsSearchFocused(false);
    if (term.trim()) {
      setSearchHistory(addToSearchHistory('griya_history_venue', term) || []);
    }
  };

  const applyFilters = () => {
    const min = parseInt(filters.minPrice.replace(/\D/g, '')) || 0;
    const max = parseInt(filters.maxPrice.replace(/\D/g, '')) || Infinity;
    setActiveFilters({ minPrice: min, maxPrice: max, location: filters.location });
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', location: 'Semua' });
    setActiveFilters({ minPrice: 0, maxPrice: Infinity, location: 'Semua' });
    setIsFilterOpen(false);
  };

  const removeFilter = (key: 'location' | 'price') => {
    if (key === 'location') {
      setActiveFilters(prev => ({ ...prev, location: 'Semua' }));
      setFilters(prev => ({ ...prev, location: 'Semua' }));
    } else if (key === 'price') {
      setActiveFilters(prev => ({ ...prev, minPrice: 0, maxPrice: Infinity }));
      setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }));
    }
  };

  const isFilterActive = activeFilters.location !== 'Semua' || activeFilters.maxPrice !== Infinity || activeFilters.minPrice > 0;

  // Filter Logic
  const filteredVenue = DATA_VENUE.filter(venue => {
    const matchSearch = venue.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        venue.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLoc = activeFilters.location === 'Semua' || venue.lokasi === activeFilters.location;
    const matchPrice = venue.harga >= activeFilters.minPrice && venue.harga <= activeFilters.maxPrice;
    
    return matchSearch && matchLoc && matchPrice;
  });

  // Suggestions
  const suggestions = searchInputValue.trim()
    ? DATA_VENUE.filter(v => v.nama.toLowerCase().includes(searchInputValue.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="pb-24 px-4 pt-4 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center font-serif"><span className="bg-orange-600 w-1 h-6 mr-2 rounded-full"></span>Venue Upacara</h2>
      
      {/* Search & Filter Bar */}
      <div className="mb-4 relative z-20" ref={searchContainerRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
             <input 
                type="text" 
                placeholder="Cari Griya / Lokasi..." 
                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm shadow-sm" 
                value={searchInputValue} 
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchInputValue(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchInputValue)}
             />
             {searchInputValue && (
              <button onClick={() => { setSearchInputValue(""); setSearchTerm(""); setIsSearchFocused(true); }} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)} 
            className={`px-3 rounded-xl border transition flex items-center justify-center ${isFilterActive ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-white border-gray-200 text-gray-600'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Search Overlay */}
        {isSearchFocused && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-30 animate-fade-in">
            {searchInputValue.trim() === "" ? (
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 flex items-center"><History className="w-3 h-3 mr-1" /> Riwayat</span>
                  {searchHistory.length > 0 && <button onClick={() => setSearchHistory(clearSearchHistory('griya_history_venue'))} className="text-[10px] text-red-500 hover:underline">Hapus</button>}
                </div>
                {searchHistory.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((hist, idx) => (
                      <button key={idx} onClick={() => handleSearch(hist)} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-700 transition">
                        {hist}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">Belum ada riwayat pencarian.</p>
                )}
              </div>
            ) : (
              <div>
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => handleSearch(item.nama)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 border-b border-gray-50 last:border-0 flex justify-between items-center"
                    >
                      <span className="font-medium">{item.nama}</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{item.lokasi}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">Tidak ada saran. Tekan enter untuk mencari.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {(activeFilters.location !== 'Semua' || activeFilters.minPrice > 0 || activeFilters.maxPrice !== Infinity) && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {activeFilters.location !== 'Semua' && (
            <button onClick={() => removeFilter('location')} className="flex items-center text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full border border-orange-200 font-medium whitespace-nowrap">
              Lokasi: {activeFilters.location} <X className="w-3 h-3 ml-1"/>
            </button>
          )}
          {(activeFilters.minPrice > 0 || activeFilters.maxPrice !== Infinity) && (
            <button onClick={() => removeFilter('price')} className="flex items-center text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full border border-orange-200 font-medium whitespace-nowrap">
              Harga: {activeFilters.minPrice > 0 ? formatIDR(activeFilters.minPrice) : '0'} - {activeFilters.maxPrice !== Infinity ? formatIDR(activeFilters.maxPrice) : 'Max'} <X className="w-3 h-3 ml-1"/>
            </button>
          )}
          <button onClick={resetFilters} className="text-[10px] text-gray-500 underline ml-1">Reset</button>
        </div>
      )}
      
      {/* Venue List */}
      <div className="space-y-4">
        {filteredVenue.length > 0 ? (
          filteredVenue.map((venue) => (
            <div key={venue.id} onClick={() => setSelectedVenueDetail(venue)} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="h-40 bg-gray-200 relative">
                <img src={venue.image} alt={venue.nama} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-orange-800 shadow-sm flex items-center backdrop-blur-sm"><CheckCircle className="w-3 h-3 mr-1 text-green-600"/> {venue.kapasitas}</div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                  <h3 className="text-white font-bold text-lg leading-none font-serif">{venue.nama}</h3>
                  <p className="text-white/90 text-xs flex items-center mt-1"><MapPin className="w-3 h-3 mr-1"/> {venue.lokasi}</p>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                 <div><p className="text-[10px] text-gray-500 mb-1">Mulai dari</p><p className="text-orange-700 font-bold text-sm">{formatIDR(venue.harga)}</p></div>
                 <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-700 transition shadow-md">Pesan Sekarang</button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm flex flex-col items-center">
             <Building className="w-10 h-10 mb-2 opacity-30"/>
             Venue tidak ditemukan dengan filter ini.
          </div>
        )}
      </div>

      {/* Venue Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-5 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="font-bold text-gray-800 flex items-center"><SlidersHorizontal className="w-4 h-4 mr-2"/> Filter Venue</h3>
              <button onClick={() => setIsFilterOpen(false)}><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-700 mb-2 block">Lokasi</label>
              <div className="relative">
                <select 
                  value={filters.location} 
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl appearance-none text-sm outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none"/>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-gray-700 mb-2 block">Rentang Harga Sewa</label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500">Rp</span>
                  <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-orange-500"/>
                </div>
                <span className="text-gray-400">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500">Rp</span>
                  <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-orange-500"/>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button onClick={resetFilters} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold text-sm hover:bg-gray-50">Reset</button>
              <button onClick={applyFilters} className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 shadow-md">Terapkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PanditaSectionProps {
  addToCart: (item: Pandita) => void;
  setSelectedPanditaDetail: (item: Pandita) => void;
  cart: CartItem[];
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const PanditaSection: React.FC<PanditaSectionProps> = ({ addToCart, setSelectedPanditaDetail, cart, user, setUser }) => {
  const [panditaSearchTerm, setPanditaSearchTerm] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const filteredPandita = DATA_PANDITA.filter(pandita => pandita.nama.toLowerCase().includes(panditaSearchTerm.toLowerCase()) || pandita.griya.toLowerCase().includes(panditaSearchTerm.toLowerCase()));
  const sortedPandita = [...filteredPandita].sort((a, b) => {
    const userLoc = user?.kabupaten;
    if (a.kabupaten === userLoc && b.kabupaten !== userLoc) return -1;
    if (a.kabupaten !== userLoc && b.kabupaten === userLoc) return 1;
    return 0;
  });

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const mockDetected = "Denpasar";
          if(user) { setUser({ ...user, kabupaten: mockDetected }); }
          alert(`Lokasi berhasil dideteksi: ${mockDetected}.`);
        },
        () => { setIsLocating(false); alert("Gagal mendeteksi lokasi."); }
      );
    } else { alert("Browser tidak mendukung geolokasi."); }
  };

  return (
    <div className="pb-24 px-4 pt-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
         <div className="flex justify-between items-center mb-3">
           <div className="flex items-center text-sm font-bold text-gray-800"><MapPin className="w-4 h-4 mr-2 text-orange-600" />Lokasi: <span className="text-orange-700 ml-1">{user?.kabupaten || "Belum diset"}</span></div>
           <button onClick={handleDetectLocation} disabled={isLocating} className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg font-medium flex items-center hover:bg-orange-200 transition">{isLocating ? 'Mendeteksi...' : '📍 Lokasi Saya'}</button>
         </div>
         <div className="relative"><Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" /><input type="text" placeholder="Cari Pandita / Griya..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" value={panditaSearchTerm} onChange={(e) => setPanditaSearchTerm(e.target.value)} /></div>
      </div>
      <div className="space-y-4">
        {sortedPandita.length === 0 ? (<div className="text-center py-10 text-gray-400">Pandita tidak ditemukan.</div>) : (sortedPandita.map((pandita) => {
            const isInCart = cart.some(c => c.id === pandita.id);
            return (
              <div key={pandita.id} onClick={() => setSelectedPanditaDetail(pandita)} className={`bg-white rounded-xl shadow-sm p-4 border-2 transition-all relative cursor-pointer hover:shadow-md ${isInCart ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-transparent'}`}>
                {pandita.kabupaten === user?.kabupaten && <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-sm"><MapPin className="w-3 h-3 mr-1" /> Terdekat</span>}
                <div className="flex items-start space-x-3">
                  <img src={pandita.image} alt={pandita.nama} className="w-14 h-14 rounded-full object-cover border-2 border-orange-100" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm font-serif">{pandita.nama}</h3>
                    <div className="text-xs text-gray-600 flex flex-col mt-1"><span className="font-medium text-orange-800">{pandita.griya}</span><span className="flex items-center text-gray-400 mt-0.5"><MapPin className="w-3 h-3 mr-1" /> {pandita.lokasi}</span></div>
                    <div className="mt-2 flex flex-wrap gap-1"><span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-600">{pandita.spesialisasi}</span></div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end items-center border-t border-gray-100 pt-2">
                  {isInCart ? (<button className="w-full py-2 rounded-lg text-xs font-bold bg-green-600 text-white flex justify-center items-center cursor-default shadow-sm" onClick={(e) => e.stopPropagation()}><CheckCircle className="w-3 h-3 mr-1" />Sudah di Keranjang</button>) : (<button onClick={(e) => { e.stopPropagation(); addToCart(pandita); }} className="w-full py-2 rounded-lg text-xs font-bold transition flex justify-center items-center bg-gray-100 text-gray-700 hover:bg-orange-600 hover:text-white"><Plus className="w-3 h-3 mr-1" /> Undang Beliau</button>)}
                </div>
              </div>
            );
          }))}
      </div>
    </div>
  );
};

interface ProfilProps {
  user: User | null;
  handleLogout: () => void;
}

export const ProfilSection: React.FC<ProfilProps> = ({ user, handleLogout }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (showHistory && user) {
      const allOrders = getOrdersDB();
      // Filter orders for current user by phone or name
      const myOrders = allOrders.filter(o => o.phone === user.phone || o.pemesan === user.name);
      setUserOrders(myOrders);
    }
  }, [showHistory, user]);

  const handleDownloadInvoice = (order: Order) => {
    // Reconstruct User object if needed for PDF function context
    const orderUser: User = {
      name: order.pemesan,
      phone: order.phone,
      kabupaten: order.location || user?.kabupaten || "Bali",
      role: 'user'
    };
    
    // Ensure we have cart items to display in invoice
    if (order.cartItems) {
      generateInvoicePDF(order, order.cartItems, orderUser);
    } else {
      alert("Detail item tidak ditemukan, tidak dapat mengunduh invoice.");
    }
  };

  return (
    <div className="pb-24 px-4 pt-8 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100 relative overflow-hidden mb-4">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-orange-100 to-white -z-0"></div>
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto border-4 border-white shadow-md mb-3 relative z-10 overflow-hidden flex items-center justify-center">
             <div className="bg-orange-200 text-orange-600 font-bold text-2xl w-full h-full flex items-center justify-center">{user?.name ? user.name.charAt(0).toUpperCase() : "?"}</div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 font-serif">{user?.name}</h2>
        <p className="text-sm text-gray-500 mb-2">{user?.phone}</p>
        <span className="inline-block bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">{user?.kabupaten}</span>
      </div>
      <div className="space-y-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <button onClick={() => setShowHistory(true)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 transition">
             <div className="flex items-center text-gray-700">
               <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3"><ClipboardList className="w-5 h-5"/></div>
               <span className="text-sm font-medium">Riwayat Pesanan</span>
             </div>
             <ChevronRight className="w-4 h-4 text-gray-400" />
           </button>
           <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100"><div className="flex items-center text-gray-700"><div className="bg-green-100 p-2 rounded-lg text-green-600 mr-3"><MapPin className="w-5 h-5"/></div><span className="text-sm font-medium">Daftar Alamat</span></div><ChevronRight className="w-4 h-4 text-gray-400" /></button>
           <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50"><div className="flex items-center text-gray-700"><div className="bg-purple-100 p-2 rounded-lg text-purple-600 mr-3"><Settings className="w-5 h-5"/></div><span className="text-sm font-medium">Edit Profil</span></div><ChevronRight className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100"><div className="flex items-center text-gray-700"><div className="bg-yellow-100 p-2 rounded-lg text-yellow-600 mr-3"><HelpCircle className="w-5 h-5"/></div><span className="text-sm font-medium">Pusat Bantuan</span></div><ChevronRight className="w-4 h-4 text-gray-400" /></button>
           <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50"><div className="flex items-center text-gray-700"><div className="bg-gray-100 p-2 rounded-lg text-gray-600 mr-3"><Info className="w-5 h-5"/></div><span className="text-sm font-medium">Tentang Aplikasi</span></div><ChevronRight className="w-4 h-4 text-gray-400" /></button>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center justify-center p-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition font-bold text-sm mt-4 shadow-sm"><LogOut className="w-5 h-5 mr-2" /> Keluar Akun</button>
      </div>

      {/* Order History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl animate-slide-up">
            <div className="p-4 border-b flex justify-between items-center bg-orange-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800 flex items-center font-serif">
                <ClipboardList className="w-5 h-5 mr-2 text-orange-600" /> Riwayat Pesanan
              </h2>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-orange-200 rounded-full transition"><X className="w-6 h-6 text-gray-500" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {userOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                  <ClipboardList className="w-12 h-12 mb-2 opacity-30"/>
                  <p className="text-sm">Belum ada riwayat pesanan.</p>
                </div>
              ) : (
                userOrders.map((order, idx) => {
                  const isPaid = order.status === 'LUNAS';
                  return (
                    <div key={idx} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                           <div className="flex items-center">
                             <span className="font-bold text-gray-800 text-sm mr-2">{order.id}</span>
                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                               {order.status}
                             </span>
                           </div>
                           <p className="text-xs text-gray-500 mt-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> {order.date}</p>
                        </div>
                        <span className="font-bold text-orange-700 text-sm">{formatIDR(order.total)}</span>
                      </div>
                      
                      <div className="bg-gray-50 p-2 rounded-lg mb-3">
                         <p className="text-xs text-gray-600 line-clamp-2">{order.items?.join(', ')}</p>
                      </div>

                      <div className="flex justify-between items-center">
                         {isPaid ? (
                           <button 
                             onClick={() => handleDownloadInvoice(order)}
                             className="flex items-center text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg hover:bg-green-200 transition"
                           >
                             <Download className="w-3 h-3 mr-1.5" /> Download Invoice
                           </button>
                         ) : (
                           <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                             <AlertTriangle className="w-3 h-3 mr-1" /> Menunggu Konfirmasi
                           </div>
                         )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
