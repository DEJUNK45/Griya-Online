
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, Home, UserCircle, Search, Building, LayoutDashboard, Box, ClipboardList, LogOut } from 'lucide-react';
import { User, CartItem, Order, Product, Venue, Pandita } from './types';
import { getOrdersDB, saveOrderToDB } from './utils';
import { AuthModal } from './components/AuthModal';
import { CartModal } from './components/CartModal';
import { CatalogSection, VenueSection, PanditaSection, ProfilSection } from './components/UserSections';
import { AdminDashboard, AdminProducts } from './components/AdminSections';
import { ProductDetailModal, VenueDetailModal, PanditaDetailModal } from './components/DetailModals';
import { GriyaBantenLogo } from './components/Logo';

export default function GriyaBantenApp() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Cart & Orders
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<(Product | Venue | Pandita) | null>(null);
  
  // Navigation
  const [activeTab, setActiveTab] = useState('home');
  const [showNotification, setShowNotification] = useState(false);

  // Selection States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVenueDetail, setSelectedVenueDetail] = useState<Venue | null>(null);
  const [selectedPanditaDetail, setSelectedPanditaDetail] = useState<Pandita | null>(null);

  // Admin Data
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);

  // Search States
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    setAdminOrders(getOrdersDB());
  }, []);

  useEffect(() => {
    if (user && pendingCartItem) {
      addToCartLogic(pendingCartItem);
      setPendingCartItem(null);
      setTimeout(() => alert(`Selamat datang ${user.name}, item telah ditambahkan ke keranjang.`), 500);
    }
  }, [user, pendingCartItem]);

  const handleLogin = (e: React.FormEvent, formData: any) => {
    e.preventDefault();
    processAuth(formData.name, formData.phone, formData.kabupaten);
  };

  const handleRegister = (e: React.FormEvent, formData: any) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.kabupaten) {
      alert("Mohon lengkapi semua data termasuk lokasi.");
      return;
    }
    processAuth(formData.name, formData.phone, formData.kabupaten);
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      processAuth("User Google", "081-Google-Auth", "Denpasar");
      setIsGoogleLoading(false);
    }, 1500);
  };

  const processAuth = (name: string, phone: string, kabupaten: string) => {
    const isAdmin = name.trim().toLowerCase() === "admin";
    setUser({
      name: isAdmin ? "Admin Griya" : name,
      phone: phone || "08123456789",
      kabupaten: kabupaten || "Denpasar",
      role: isAdmin ? 'admin' : 'user'
    });
    if (isAdmin) {
      setActiveTab('dashboard');
      setAdminOrders(getOrdersDB());
    }
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setAuthMode('login');
    setActiveTab('home');
  };

  const addToCart = (product: Product | Venue | Pandita) => {
    if (!user) {
      setPendingCartItem(product);
      setShowAuthModal(true);
      return;
    }
    addToCartLogic(product);
  };

  const addToCartLogic = (item: Product | Venue | Pandita) => {
    const productId = (item as any).uniqueId || item.id;
    const existingItem = cart.find((c) => (c.uniqueId || c.id) === productId);

    if (item.tipe === "Pandita") {
      if (existingItem) {
        alert("Beliau sudah ada di keranjang Anda.");
        return;
      }
      setCart([...cart, { ...item, qty: 1 } as CartItem]);
    } else if (item.tipe === "Venue") {
      if (existingItem) {
        alert("Konfigurasi venue ini sudah ada di keranjang.");
        return;
      }
      setCart([...cart, { ...item, qty: 1 } as CartItem]);
    } else {
      // Product / Banten
      if (existingItem) {
        setCart(cart.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        ));
      } else {
        setCart([...cart, { ...item, qty: 1 } as CartItem]);
      }
    }
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
    setSelectedProduct(null);
    setSelectedPanditaDetail(null);
    setSelectedVenueDetail(null);
  };

  const removeFromCart = (id: number | string) => {
    setCart(cart.filter(item => (item.uniqueId || item.id) !== id));
  };

  const updateQty = (id: number | string, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (!item || item.tipe === "Pandita" || item.tipe === "Venue") return;
    const newCart = cart.map(c => {
      if (c.id === id) return { ...c, qty: Math.max(0, c.qty + delta) };
      return c;
    }).filter(c => c.qty > 0);
    setCart(newCart);
  };

  // Called when the user finalizes the invoice in the modal
  const handleProcessOrder = (finalOrder: Order) => {
    saveOrderToDB(finalOrder);
    setAdminOrders(prev => [finalOrder, ...prev]);
    setCart([]);
    setIsCartOpen(false);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedList = adminOrders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setAdminOrders(updatedList);
    localStorage.setItem('griya_orders', JSON.stringify(updatedList));
  };

  const switchTab = (tab: string, category?: string) => {
    setActiveTab(tab);
    if(category) setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-orange-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1 rounded-full shadow-sm">
              <GriyaBantenLogo className="w-6 h-6" colorClass="text-orange-700" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg font-serif leading-none">Griya Banten</h1>
              <span className="text-[10px] text-orange-200">
                {user?.role === 'admin' ? 'Admin Panel' : user ? `Halo, ${user.name.split(' ')[0]}` : 'Online & Terpercaya'}
              </span>
            </div>
          </div>
          {(user?.role === 'user' || !user) && (
            <div className="flex items-center space-x-4">
              {!user && (
                <button 
                  onClick={() => setShowAuthModal(true)} 
                  className="text-xs bg-orange-800/50 px-3 py-1.5 rounded-full font-medium hover:bg-orange-800 transition"
                >
                  Masuk
                </button>
              )}
              <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </div>
            </div>
          )}
          {user?.role === 'admin' && (
            <button onClick={handleLogout} className="text-xs bg-red-600 px-3 py-1 rounded hover:bg-red-700 font-bold shadow-sm">Logout</button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pb-safe">
        {(user?.role === 'user' || !user) && (
          <>
            {activeTab === 'home' && (
              <div className="pb-24 animate-fade-in">
                <div className="relative bg-orange-100 h-72 flex items-center justify-center overflow-hidden mb-6 rounded-b-[40px] shadow-sm">
                  <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/batik-rambutan.png')]"></div>
                  <div className="text-center z-10 px-6 mt-[-20px]">
                    {user && (
                      <div className="inline-block bg-orange-200 text-orange-800 text-[10px] font-bold px-3 py-1 rounded-full mb-3 shadow-sm">
                        Om Swastyastu, {user.name.split(' ')[0]}
                      </div>
                    )}
                    <h2 className="text-3xl font-serif font-bold text-orange-900 mb-2 leading-tight">Keperluan Yadnya <br/> Terlengkap di Bali</h2>
                    <p className="text-orange-800 text-xs mb-5 max-w-xs mx-auto">Dari Otonan, Ngaben, hingga Venue Pawiwahan.</p>
                    <div className="flex justify-center space-x-3">
                      <button onClick={() => setActiveTab('katalog')} className="bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg hover:bg-orange-700 transition transform active:scale-95">Pesan Banten</button>
                      <button onClick={() => setActiveTab('venue')} className="bg-white text-orange-700 border border-orange-200 px-5 py-2.5 rounded-full text-sm font-medium shadow-md hover:bg-orange-50 transition transform active:scale-95">Cari Venue</button>
                    </div>
                  </div>
                </div>
                <div className="px-4 mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
                    <span className="w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
                    Pilih Kebutuhan
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: "Nganten", icon: "💍", cat: "Manusa Yadnya" },
                      { name: "Potong Gigi", icon: "😬", cat: "Manusa Yadnya" },
                      { name: "Otonan", icon: "👶", cat: "Manusa Yadnya" },
                      { name: "Piodalan", icon: "🙏", cat: "Dewa Yadnya" }
                    ].map((cat, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => switchTab('katalog', cat.cat)} 
                        className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition"
                      >
                        <span className="text-xl mb-1">{cat.icon}</span>
                        <span className="text-[10px] font-medium text-gray-600">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Promo Banner */}
                <div className="px-4 mb-8">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                     <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                     <div className="relative z-10">
                       <h4 className="font-bold text-lg mb-1">Paket Ngaben Alit</h4>
                       <p className="text-xs text-white/90 mb-3">Solusi upacara pitra yadnya yang ringkas dan terjangkau.</p>
                       <button onClick={() => switchTab('katalog', 'Pitra Yadnya')} className="bg-white text-orange-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">Lihat Paket</button>
                     </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'katalog' && (
              <CatalogSection 
                addToCart={addToCart} 
                setSelectedProduct={setSelectedProduct} 
                initialCategory={selectedCategory}
              />
            )}
            
            {activeTab === 'venue' && (
              <VenueSection 
                setSelectedVenueDetail={setSelectedVenueDetail} 
              />
            )}
            
            {activeTab === 'pandita' && (
              <PanditaSection 
                addToCart={addToCart} 
                setSelectedPanditaDetail={setSelectedPanditaDetail} 
                cart={cart} 
                user={user} 
                setUser={setUser}
              />
            )}
            
            {activeTab === 'profil' && (
              <ProfilSection user={user} handleLogout={handleLogout} />
            )}
          </>
        )}

        {user?.role === 'admin' && (
          <>
            {activeTab === 'dashboard' && <AdminDashboard adminOrders={adminOrders} onUpdateStatus={handleUpdateOrderStatus} />}
            {activeTab === 'orders' && <AdminDashboard adminOrders={adminOrders} onUpdateStatus={handleUpdateOrderStatus} />} 
            {activeTab === 'admin-products' && <AdminProducts />}
          </>
        )}
      </div>

      {/* Navigation Bar */}
      {user?.role === 'admin' ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 pb-safe z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-md mx-auto flex justify-around items-center text-xs text-gray-600">
            <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center transition ${activeTab === 'dashboard' ? 'text-orange-600 font-bold' : 'hover:text-orange-500'}`}><LayoutDashboard className="w-6 h-6 mb-1" /> Dashboard</button>
            <button onClick={() => setActiveTab('admin-products')} className={`flex flex-col items-center transition ${activeTab === 'admin-products' ? 'text-orange-600 font-bold' : 'hover:text-orange-500'}`}><Box className="w-6 h-6 mb-1" /> Produk</button>
            <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center transition ${activeTab === 'orders' ? 'text-orange-600 font-bold' : 'hover:text-orange-500'}`}><ClipboardList className="w-6 h-6 mb-1" /> Pesanan</button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 pb-safe z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-md mx-auto flex justify-around items-center text-xs text-gray-600">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center transition ${activeTab === 'home' ? 'text-orange-600 font-bold' : 'hover:text-orange-500'}`}><Home className="w-6 h-6 mb-1" /> Beranda</button>
            <button onClick={() => setActiveTab('katalog')} className={`flex flex-col items-center transition ${activeTab === 'katalog' ? 'text-orange-600 font-bold' : 'hover:text-orange-500'}`}><Search className="w-6 h-6 mb-1" /> Banten</button>
            <button onClick={() => setActiveTab('venue')} className={`flex flex-col items-center transition ${activeTab === 'venue' ? 'text-orange-600 font-bold' : 'hover:text-orange-500'}`}><Building className="w-6 h-6 mb-1" /> Venue</button>
            <button onClick={() => setActiveTab('pandita')} className={`flex flex-col items-center transition ${activeTab === 'pandita' ? 'text-orange-600 font-bold' : 'hover:text-orange-500'}`}><Users className="w-6 h-6 mb-1" /> Pandita</button>
            <button onClick={() => { if(user) {setActiveTab('profil')} else {setShowAuthModal(true)} }} className={`flex flex-col items-center transition ${activeTab === 'profil' ? 'text-orange-600 font-bold' : 'hover:text-orange-500'}`}><UserCircle className="w-6 h-6 mb-1" /> Akun</button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CartModal 
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        updateQty={updateQty}
        removeFromCart={removeFromCart}
        user={user}
        onProcessOrder={handleProcessOrder}
        setShowAuthModal={setShowAuthModal}
      />
      <ProductDetailModal selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />
      <VenueDetailModal selectedVenueDetail={selectedVenueDetail} setSelectedVenueDetail={setSelectedVenueDetail} addToCart={addToCart} />
      <PanditaDetailModal selectedPanditaDetail={selectedPanditaDetail} setSelectedPanditaDetail={setSelectedPanditaDetail} addToCart={addToCart} />
      <AuthModal 
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        authMode={authMode}
        setAuthMode={setAuthMode}
        handleGoogleLogin={handleGoogleLogin}
        isGoogleLoading={isGoogleLoading}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
      />
      
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white px-5 py-3 rounded-full shadow-xl text-sm flex items-center z-[60] animate-slide-up border border-gray-700">
          <ShoppingBag className="w-4 h-4 mr-2 text-orange-400" />
          <span className="font-medium">Berhasil masuk keranjang!</span>
        </div>
      )}
    </div>
  );
}
