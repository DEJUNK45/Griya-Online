
import React, { useState, useRef } from 'react';
import { ShoppingBag, X, Plus, Minus, Building, Trash2, Calendar, Clock, Info, CheckCircle, ArrowLeft, CreditCard, Upload, Copy, FileText, Download, Send, AlertTriangle } from 'lucide-react';
import { CartItem, User, Order } from '../types';
import { formatIDR, generateInvoicePDF } from '../utils';
import { GriyaBantenLogo } from './Logo';

interface CartModalProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cart: CartItem[];
  updateQty: (id: string | number, delta: number) => void;
  removeFromCart: (id: string | number) => void;
  user: User | null;
  onProcessOrder: (order: Order) => void;
  setShowAuthModal: (show: boolean) => void;
}

const BANK_ACCOUNTS = [
  { name: "BCA", number: "7725-1234-5678", holder: "Griya Banten Online" },
  { name: "BPD Bali", number: "010-02-02-12345-6", holder: "Griya Banten Online" }
];

export const CartModal: React.FC<CartModalProps> = ({ isCartOpen, setIsCartOpen, cart, updateQty, removeFromCart, user, onProcessOrder, setShowAuthModal }) => {
  // Checkout Steps: 'cart' -> 'payment' -> 'success'
  const [step, setStep] = useState<'cart' | 'payment' | 'success'>('cart');
  
  // Order Details
  const [orderDate, setOrderDate] = useState("");
  const [orderTime, setOrderTime] = useState("");
  const [tempOrderId, setTempOrderId] = useState("");
  
  // Payment Proof
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isCartOpen) {
      // Reset state when modal opens
      setStep('cart');
      setProofFile(null);
      setPreviewUrl(null);
      // We don't reset date/time to let user continue
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const panditaInCart = cart.filter(item => item.tipe === "Pandita");
  const venueInCart = cart.filter(item => item.tipe === "Venue"); 
  const bantenInCart = cart.filter(item => item.tipe !== "Pandita" && item.tipe !== "Venue");
  const totalBanten = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0);

  const handleNextStep = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (cart.length === 0) return;
    if (!orderDate || !orderTime) {
      alert("Mohon lengkapi tanggal dan jam upacara.");
      return;
    }
    setTempOrderId(`ORD-${Date.now().toString().slice(-6)}`);
    setStep('payment');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFinalizeAndDownload = () => {
    if (!proofFile) {
      alert("Mohon upload bukti transfer terlebih dahulu.");
      return;
    }

    const finalOrder: Order = {
      id: tempOrderId,
      pemesan: user!.name,
      phone: user!.phone,
      location: user!.kabupaten,
      total: totalBanten,
      status: 'Menunggu Verifikasi Admin', // Set Pending Status
      items: cart.map(c => c.nama),
      cartItems: cart, // Save full items for admin regeneration
      date: new Date().toLocaleDateString('id-ID'),
      eventDate: orderDate,
      eventTime: orderTime,
      paymentMethod: 'Transfer Bank',
      hasProof: true
    };

    // 1. Generate PDF (Will act as a Pending Receipt)
    generateInvoicePDF(finalOrder, cart, user!);

    // 2. Construct WhatsApp Message
    const nomorWA = "6281234567890";
    let message = `*Om Swastyastu, Konfirmasi Pembayaran Griya Banten.*\n`;
    message += `No. Pesanan: #${tempOrderId}\n`;
    message += `Pemesan: ${user!.name}\n`;
    message += `Status Pembayaran: *MENUNGGU VERIFIKASI* (Bukti Terlampir)\n`;
    message += `Total: ${formatIDR(totalBanten)}\n`;
    message += `\n*File Bukti Pesanan (PDF) telah saya lampirkan pada chat ini.*\n`;
    message += `\nMohon dicek bukti transfernya. Suksma.`;

    // 3. Open WhatsApp after a short delay
    setTimeout(() => {
       window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(message)}`, '_blank');
    }, 1000);
    
    // 4. Update App State & Show Success
    onProcessOrder(finalOrder);
    setStep('success');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("No Rekening disalin!");
  };

  // Helper to render Venue breakdown
  const renderVenueBreakdown = (item: CartItem, isInvoiceView = false) => {
    const pkgPrice = item.selectedPackage?.price || 0;
    const catTotal = (item.guestCount || 0) * (item.cateringPricePerPax || 0);
    
    return (
      <div className={`mt-1 space-y-1 ${isInvoiceView ? 'text-[10px] text-gray-500 ml-4' : 'text-xs text-gray-600'}`}>
        <div className="flex justify-between">
          <span>• Paket: {item.selectedPackage?.name}</span>
          <span className="font-medium">{formatIDR(pkgPrice)}</span>
        </div>
        {item.guestCount && item.guestCount > 0 && (
          <div className="flex justify-between">
            <span>• Catering ({item.guestCount} pax)</span>
            <span className="font-medium">{formatIDR(catTotal)}</span>
          </div>
        )}
        {!isInvoiceView && item.selectedLocation && (
          <div className="text-[10px] text-orange-600 italic mt-0.5">
            Lokasi: {item.selectedLocation}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md h-[95vh] sm:h-auto sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl animate-slide-up">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-orange-50 rounded-t-2xl">
          <div className="flex items-center">
            {step === 'payment' && (
              <button onClick={() => setStep('cart')} className="mr-3 p-1 hover:bg-orange-100 rounded-full transition">
                <ArrowLeft className="w-5 h-5 text-gray-600"/>
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-800 flex items-center font-serif">
              {step === 'cart' ? (
                <><ShoppingBag className="w-5 h-5 mr-2 text-orange-600" /> Keranjang Yadnya</>
              ) : step === 'payment' ? (
                <><CreditCard className="w-5 h-5 mr-2 text-orange-600" /> Upload Bukti</>
              ) : (
                <><CheckCircle className="w-5 h-5 mr-2 text-green-600" /> Menunggu Verifikasi</>
              )}
            </h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-orange-200 rounded-full transition"><X className="w-6 h-6 text-gray-500" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* STEP 1: CART VIEW */}
          {step === 'cart' && (
            <>
              {bantenInCart.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wide">Banten & Upakara</h3>
                  <div className="space-y-3">
                    {bantenInCart.map((item) => (
                      <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{item.nama}</p>
                            <p className="text-xs text-gray-500">{formatIDR(item.harga)} / pcs</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                            <span className="w-4 text-center text-sm font-bold">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-200"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-200 pt-2 text-xs">
                           <span className="text-gray-500">Subtotal:</span>
                           <span className="font-bold text-gray-800">{formatIDR(item.harga * item.qty)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {venueInCart.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wide mt-2">Venue / Lokasi</h3>
                  <div className="space-y-3">
                    {venueInCart.map((item) => (
                      <div key={item.uniqueId || item.id} className="bg-blue-50 p-3 rounded-lg border border-blue-100 relative">
                        <button onClick={() => removeFromCart(item.uniqueId || item.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 mr-2"><Building className="w-3 h-3"/></div>
                          <p className="font-bold text-blue-900 text-sm">{item.nama.split('(')[0]}</p>
                        </div>
                        
                        {/* Detailed Breakdown */}
                        {renderVenueBreakdown(item)}

                        <div className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2 text-xs">
                          <span className="text-blue-600 font-medium">Subtotal Venue:</span>
                          <span className="font-bold text-blue-800 text-sm">{formatIDR(item.harga)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {panditaInCart.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wide mt-2">Sulinggih / Pandita</h3>
                  <div className="space-y-3">
                    {panditaInCart.map((item) => (
                      <div key={item.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={item.image!} className="w-10 h-10 rounded-full object-cover border border-yellow-200" alt="" />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.nama}</p>
                            <p className="text-[10px] text-gray-500">{item.griya}</p>
                            <p className="text-[10px] text-orange-600 font-bold italic mt-0.5">Biaya: Dana Punia (Sukarela)</p>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {cart.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Keranjang kosong.</div>}
              
              {cart.length > 0 && (
                <div className="pt-4 mt-2 border-t border-dashed border-gray-200">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">Rencana Upacara</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Tanggal <span className="text-red-500">*</span></label>
                      <input type="date" required className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white" value={orderDate} onChange={(e) => setOrderDate(e.target.value)}/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> Jam <span className="text-red-500">*</span></label>
                      <input type="time" required className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white" value={orderTime} onChange={(e) => setOrderTime(e.target.value)}/>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-[10px] text-yellow-800 space-y-1">
                    <p className="flex items-start"><Info className="w-3 h-3 mr-1.5 mt-0.5 shrink-0 text-yellow-600"/> <strong>PENTING:</strong> Harga total belum termasuk <strong>Sesari/Daksinan</strong> untuk Pandita.</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: INVOICE & PAYMENT VIEW */}
          {step === 'payment' && (
            <div className="animate-fade-in space-y-5">
              {/* Payment Instructions */}
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-orange-800 mb-2 text-sm flex items-center"><FileText className="w-4 h-4 mr-2"/> Petunjuk Konfirmasi</h3>
                <ol className="list-decimal list-inside text-xs text-gray-700 space-y-1.5 ml-1">
                  <li>Transfer <strong>total tagihan</strong> ke rekening di bawah.</li>
                  <li><strong>Upload bukti</strong> transfer pada form.</li>
                  <li>Klik tombol <strong>Kirim Bukti & Konfirmasi</strong>.</li>
                  <li>Anda akan mengunduh <strong>Bukti Pesanan (Pending)</strong>.</li>
                  <li>Invoice LUNAS akan dikirim setelah <strong>Diverifikasi Admin</strong>.</li>
                </ol>
              </div>

              {/* Total Summary */}
              <div className="bg-white border rounded-xl p-4 shadow-sm flex justify-between items-center">
                 <div>
                   <span className="text-xs text-gray-500 block">Total Pembayaran</span>
                   <span className="font-bold text-lg text-gray-800 font-mono">#{tempOrderId}</span>
                 </div>
                 <div className="text-right">
                   <span className="font-bold text-xl text-orange-600">{formatIDR(totalBanten)}</span>
                 </div>
              </div>

              {/* Bank Transfer Info */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center"><Building className="w-4 h-4 mr-2"/> Transfer ke Rekening</h3>
                <div className="space-y-2">
                  {BANK_ACCOUNTS.map((bank, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-blue-900">{bank.name}</p>
                        <p className="text-sm text-blue-800 font-mono tracking-wide">{bank.number}</p>
                        <p className="text-[10px] text-blue-600 uppercase">{bank.holder}</p>
                      </div>
                      <button onClick={() => copyToClipboard(bank.number)} className="p-2 bg-white rounded-lg text-blue-600 hover:text-blue-800 shadow-sm border border-blue-100">
                        <Copy className="w-4 h-4"/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Proof */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center"><Upload className="w-4 h-4 mr-2"/> Upload Bukti Pembayaran</h3>
                <div 
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition h-32 relative overflow-hidden ${proofFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50 hover:border-orange-300'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover absolute inset-0 opacity-80" />
                  ) : (
                    <>
                      <div className="bg-gray-100 p-2 rounded-full mb-2"><Upload className="w-5 h-5 text-gray-400" /></div>
                      <p className="text-xs text-gray-500 text-center">Tap untuk upload foto struk/bukti transfer</p>
                    </>
                  )}
                  {previewUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-xs backdrop-blur-[2px]">
                      <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Foto Terpilih</span>
                    </div>
                  )}
                </div>
                {proofFile && <p className="text-[10px] text-green-600 mt-2 flex items-center justify-center font-medium"><CheckCircle className="w-3 h-3 mr-1"/> {proofFile.name}</p>}
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS VIEW */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-4">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center animate-scale-up">
                <AlertTriangle className="w-10 h-10 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Bukti Terkirim!</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">File Bukti Pesanan (PDF) telah diunduh.</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl text-sm border border-orange-200 mt-4 max-w-sm text-left">
                <p className="font-bold text-orange-800 mb-2">Status: Menunggu Verifikasi</p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  1. Admin akan mengecek bukti pembayaran Anda.<br/>
                  2. <strong>Invoice LUNAS</strong> akan dikirimkan setelah validasi.<br/>
                  3. Mohon lampirkan PDF Bukti Pesanan di WhatsApp.
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        {step !== 'success' && (
          <div className="p-4 border-t bg-white safe-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {step === 'cart' ? (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end"><div><p className="text-xs text-gray-500">Total Estimasi</p><h2 className="text-xl font-bold text-gray-800">{formatIDR(totalBanten)}</h2></div></div>
                <button onClick={handleNextStep} className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-orange-700 flex justify-center items-center space-x-2 transition transform active:scale-95 text-sm">
                  <span>Lanjut Pembayaran</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleFinalizeAndDownload} 
                disabled={!proofFile}
                className={`w-full font-bold py-3.5 rounded-xl shadow-lg flex justify-center items-center space-x-2 transition transform active:scale-95 text-sm ${proofFile ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <Send className="w-5 h-5" />
                <span>Kirim Bukti & Konfirmasi</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
