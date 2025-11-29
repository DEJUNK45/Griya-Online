import React from 'react';
import { X, Loader } from 'lucide-react';
import { DATA_KABUPATEN } from '../constants';
import { GriyaBantenLogo } from './Logo';

interface AuthModalProps {
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  handleGoogleLogin: () => void;
  isGoogleLoading: boolean;
  handleLogin: (e: React.FormEvent, data: any) => void;
  handleRegister: (e: React.FormEvent, data: any) => void;
  formData?: any;
  setFormData?: (data: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  showAuthModal, setShowAuthModal, authMode, setAuthMode, handleGoogleLogin, isGoogleLoading, handleLogin, handleRegister
}) => {
  const [formData, setFormData] = React.useState({ name: '', phone: '', kabupaten: 'Denpasar' });
  
  // Reset form when modal opens/closes or mode changes
  React.useEffect(() => {
    if(showAuthModal) setFormData({ name: '', phone: '', kabupaten: 'Denpasar' });
  }, [showAuthModal, authMode]);

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-scale-up">
        <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-600"></div>
        <div className="text-center mb-6">
          <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border border-orange-100 shadow-sm">
            <GriyaBantenLogo className="w-10 h-10" colorClass="text-orange-600" />
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-800">Masuk untuk Melanjutkan</h1>
          <p className="text-gray-500 text-xs mt-1">Data Anda diperlukan untuk proses pemesanan.</p>
        </div>
        <button onClick={handleGoogleLogin} disabled={isGoogleLoading} className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 mb-4 transition relative">
          {isGoogleLoading ? (<Loader className="w-5 h-5 animate-spin text-orange-600" />) : (<><img src="https://img.icons8.com/color/48/google-logo.png" className="w-5 h-5" alt="G" /><span>Masuk dengan Google</span></>)}
        </button>
        <div className="relative flex py-2 items-center mb-4"><div className="flex-grow border-t border-gray-200"></div><span className="flex-shrink-0 mx-4 text-gray-400 text-xs">ATAU MANUAL</span><div className="flex-grow border-t border-gray-200"></div></div>
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${authMode === 'login' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`} onClick={() => setAuthMode('login')}>Masuk</button>
          <button className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${authMode === 'register' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`} onClick={() => setAuthMode('register')}>Daftar</button>
        </div>
        <form onSubmit={(e) => authMode === 'login' ? handleLogin(e, formData) : handleRegister(e, formData)} className="space-y-3">
          {authMode === 'register' && <div><input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" placeholder="Nama Lengkap" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}/></div>}
          {authMode === 'login' && <div><input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" placeholder="Username / 'Admin' untuk Admin Mode" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}/></div>}
          <div><input type="tel" required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" placeholder="Nomor WhatsApp" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}/></div>
          {authMode === 'register' && <div><select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-sm" value={formData.kabupaten} onChange={(e) => setFormData({...formData, kabupaten: e.target.value})}>{DATA_KABUPATEN.map(kab => (<option key={kab} value={kab}>{kab}</option>))}</select></div>}
          <button type="submit" className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-orange-700 transition mt-2">{authMode === 'login' ? 'Masuk' : 'Buat Akun'}</button>
        </form>
      </div>
    </div>
  );
};