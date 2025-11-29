
import React, { useState } from 'react';
import { ClipboardList, DollarSign, Plus, CheckCircle, Clock, FileText, Send } from 'lucide-react';
import { Order, CartItem, User } from '../types';
import { DATA_BANTEN } from '../constants';
import { formatIDR, generateInvoicePDF } from '../utils';

interface AdminDashboardProps {
  adminOrders: Order[];
  onUpdateStatus?: (orderId: string, newStatus: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminOrders, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const pendingOrders = adminOrders.filter(o => o.status === 'Menunggu Verifikasi Admin' || o.status === 'Baru');
  const historyOrders = adminOrders.filter(o => o.status !== 'Menunggu Verifikasi Admin' && o.status !== 'Baru');

  const displayedOrders = activeTab === 'pending' ? pendingOrders : historyOrders;

  const handleVerify = (orderId: string) => {
    const order = adminOrders.find(o => o.id === orderId);
    if (!order) return;

    if (confirm("Konfirmasi pembayaran valid? Status akan diubah menjadi LUNAS, Invoice akan diunduh, dan WhatsApp User akan dibuka.")) {
      // 1. Update Status
      onUpdateStatus?.(orderId, 'LUNAS');

      // 2. Generate PDF with LUNAS status immediately (simulate updated object)
      const updatedOrder = { ...order, status: 'LUNAS' };
      
      if (updatedOrder.cartItems) {
        const mockUser: User = {
          name: updatedOrder.pemesan,
          phone: updatedOrder.phone,
          kabupaten: updatedOrder.location || "Bali",
          role: 'user'
        };
        generateInvoicePDF(updatedOrder, updatedOrder.cartItems, mockUser);
      }

      // 3. Open WhatsApp to User
      let phone = updatedOrder.phone.replace(/\D/g, '');
      if (phone.startsWith('0')) phone = '62' + phone.substring(1);
      
      const message = `*Om Swastyastu ${updatedOrder.pemesan},*\n\nPembayaran untuk pesanan #${updatedOrder.id} telah kami terima dan verifikasi (LUNAS).\n\nBerikut kami lampirkan Invoice LUNAS.\n\nSuksma telah berbelanja di Griya Banten Online.`;
      
      setTimeout(() => {
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      }, 1000);
    }
  };

  const handleSendInvoice = (order: Order) => {
    if (!order.cartItems || order.cartItems.length === 0) {
      alert("Data item keranjang tidak ditemukan untuk order ini. Tidak dapat generate PDF.");
      return;
    }

    // Mock User object from Order data for PDF generation
    const mockUser: User = {
      name: order.pemesan,
      phone: order.phone,
      kabupaten: order.location || "Bali",
      role: 'user'
    };

    // 1. Generate PDF
    generateInvoicePDF(order, order.cartItems, mockUser);

    // 2. Open WA Link
    const message = `*Om Swastyastu ${order.pemesan},*\n\nBerikut kami kirimkan kembali Invoice LUNAS untuk pesanan #${order.id}.\n\nSuksma.`;
    
    // Normalize phone number (remove leading 0 or 62, add 62)
    let phone = order.phone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.substring(1);
    
    setTimeout(() => {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }, 1000);
  };

  return (
    <div className="pb-24 px-4 pt-6 bg-gray-50 min-h-screen animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-serif">Dashboard Admin</h2>
        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-bold shadow-sm">Admin Mode</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-500 mb-2">
            <ClipboardList className="w-5 h-5 mr-2" />
            <span className="text-xs font-bold">Perlu Verifikasi</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{pendingOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center text-gray-500 mb-2">
            <DollarSign className="w-5 h-5 mr-2" />
            <span className="text-xs font-bold">Total Omset</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatIDR(adminOrders.reduce((acc, curr) => acc + (curr.total || 0), 0))}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
         <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('pending')} 
              className={`flex-1 py-3 text-sm font-bold transition ${activeTab === 'pending' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Verifikasi ({pendingOrders.length})
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`flex-1 py-3 text-sm font-bold transition ${activeTab === 'history' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Riwayat Pesanan
            </button>
         </div>

         {/* Order List */}
         <div className="divide-y divide-gray-100">
          {displayedOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Tidak ada data.</div>
          ) : (
            displayedOrders.map((order, idx) => (
              <div key={idx} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{order.pemesan}</p>
                    <p className="text-[10px] text-gray-500 font-mono">#{order.id} • {order.date}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${order.status === 'LUNAS' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {order.status}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 mb-3 line-clamp-2 bg-gray-50 p-2 rounded border border-gray-100">
                  {order.items?.join(', ')}
                </p>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-bold text-gray-800">{formatIDR(order.total)}</span>
                  
                  {/* Actions based on Status */}
                  <div className="flex space-x-2">
                    {order.status === 'Menunggu Verifikasi Admin' && (
                       <button 
                         onClick={() => handleVerify(order.id)}
                         className="flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-green-700 transition"
                       >
                         <CheckCircle className="w-3 h-3 mr-1" /> Verifikasi & Kirim Invoice
                       </button>
                    )}
                    {order.status === 'LUNAS' && (
                       <button 
                         onClick={() => handleSendInvoice(order)}
                         className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100 transition"
                       >
                         <FileText className="w-3 h-3 mr-1" /> Kirim Ulang Invoice
                       </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
         </div>
      </div>
    </div>
  );
};

export const AdminProducts = () => (
  <div className="pb-24 px-4 pt-6 bg-gray-50 min-h-screen animate-fade-in">
     <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-gray-800 font-serif">Kelola Produk</h2><button className="bg-orange-600 text-white p-2 rounded-lg shadow-md hover:bg-orange-700 transition"><Plus className="w-5 h-5" /></button></div>
    <div className="space-y-3">
      {DATA_BANTEN.map(item => (
        <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center space-x-3 border border-gray-100"><img src={item.image} alt="" className="w-12 h-12 rounded bg-gray-200 object-cover" /><div className="flex-1"><p className="font-bold text-sm text-gray-800">{item.nama}</p><p className="text-xs text-gray-500">{formatIDR(item.harga)}</p></div><button className="text-gray-400 hover:text-orange-600 transition"><ClipboardList className="w-4 h-4"/></button></div>
      ))}
    </div>
  </div>
);
