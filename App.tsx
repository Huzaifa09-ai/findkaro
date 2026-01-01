import React, { useState, useEffect, useCallback, createContext, useContext, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Store as StoreIcon, Search, MapPin, User as UserIcon, Heart, ChevronLeft, 
  Plus, Package, Bell, LogOut, Trash2, CheckCircle, RefreshCw, Phone, Navigation, Eye, 
  EyeOff, Home as HomeIcon, Camera, Settings, ChevronRight, X, PlusCircle, Image as ImageIcon, 
  Sparkles, Zap, ShieldCheck, CreditCard, Check, Crown, Gift, LayoutGrid, Filter, ArrowRight, 
  Info, Database, Bot, MessageCircle, AlertCircle, Clock, History, Lock, UserCheck, CreditCard as PaymentIcon,
  TrendingUp, BarChart3, SlidersHorizontal, Calendar, DollarSign, Wallet, Send, Tag, Layers, Music, Music2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { User, Store, Product, UserRole, StockStatus, SearchInsight, ApprovalStatus, Order, OrderStatus, AppNotification, PlanType, Plan } from './types';
import { SOUND_URLS, MOCK_STORES, MOCK_PRODUCTS, PK_CITIES, GLOBAL_ITEM_LIBRARY, CURRENCY, SUPPORT_NUMBER, ADMIN_EMAIL, ADMIN_PASSWORD, PLANS } from './constants';

// --- Gemini API Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Types for Chat ---
interface Message {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

// --- Context ---
interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  view: 'WELCOME' | 'AUTH' | 'DASHBOARD';
  setView: (view: 'WELCOME' | 'AUTH' | 'DASHBOARD') => void;
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  insights: SearchInsight[];
  setInsights: React.Dispatch<React.SetStateAction<SearchInsight[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  playSound: (type: keyof typeof SOUND_URLS) => void;
  logout: () => void;
  chats: Record<string, Message[]>;
  sendChatMessage: (chatId: string, message: Message) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// --- Sub-components (Defined above App for clean module evaluation) ---

const Button = ({ children, onClick, variant = 'primary', className = '', isLoading = false, icon: Icon, disabled = false }: any) => {
  const { playSound } = useAppContext();
  const handleClick = (e: any) => {
    playSound('tap');
    if (onClick) onClick(e);
  };
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-black',
    shopper: 'bg-[#0047AB] text-white hover:bg-[#003580]',
    merchant: 'bg-[#01411C] text-white hover:bg-[#002b12]',
    outline: 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50',
    ghost: 'text-slate-500 hover:text-slate-900',
    danger: 'bg-red-500 text-white',
  };
  return (
    <motion.button 
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }} 
      onClick={handleClick} 
      disabled={isLoading || disabled} 
      className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium tracking-tight text-xs transition-all duration-200 ${variants[variant as keyof typeof variants]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <> {Icon && <Icon className="w-4 h-4" />} {children} </>}
    </motion.button>
  );
};

const ChatModal = ({ isOpen, onClose, store, otherPartyName, otherPartyId }: { isOpen: boolean, onClose: () => void, store: Store, otherPartyName: string, otherPartyId: string }) => {
  const { user, chats, sendChatMessage, playSound } = useAppContext();
  const [text, setText] = useState('');
  
  const chatId = useMemo(() => {
    if (!user) return 'guest_chat';
    const ids = [user.id, otherPartyId].sort();
    return `${ids[0]}_${ids[1]}`;
  }, [user, otherPartyId]);

  const messages = chats[chatId] || [];

  const handleSend = () => {
    if (!text.trim() || !user) return;
    const newMessage: Message = {
      senderId: user.id,
      senderName: user.name,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    sendChatMessage(chatId, newMessage);
    setText('');
    playSound('tap');
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-white w-full max-w-md h-[70vh] rounded-[32px] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        <header className="p-4 bg-white border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-semibold text-slate-600 text-xs uppercase">{otherPartyName[0]}</div>
            <div>
              <p className="font-semibold text-slate-900 text-xs">{otherPartyName}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[9px] font-medium text-slate-400 tracking-wide uppercase">Active now</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 mb-3">
                <MessageCircle className="w-5 h-5 text-slate-300" />
              </div>
              <p className="font-medium text-slate-400 text-[10px] uppercase tracking-widest">Start a conversation</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <motion.div initial={{ opacity: 0, x: m.senderId === user?.id ? 10 : -10 }} animate={{ opacity: 1, x: 0 }} key={idx} className={`flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl ${m.senderId === user?.id ? 'bg-slate-900 text-white rounded-br-none shadow-md' : 'bg-white text-slate-700 rounded-bl-none shadow-sm border border-slate-100'}`}>
                  <p className="text-[11px] font-medium leading-relaxed">{m.text}</p>
                  <p className={`text-[8px] mt-1.5 font-bold uppercase ${m.senderId === user?.id ? 'text-white/40' : 'text-slate-300'}`}>{m.timestamp}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="p-3 bg-white border-t border-slate-50">
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
            <input 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Write a message..." 
              className="flex-1 bg-transparent px-3 py-1 font-medium text-slate-800 placeholder:text-slate-400 text-[11px] focus:outline-none" 
            />
            <button onClick={handleSend} className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition-all"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AuthScreen = ({ role, onBack, onLogin }: any) => {
  const { setStores, setRole } = useAppContext();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('Grocery');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('FREE');
  const [waitingArea, setWaitingArea] = useState(false);

  const isMerchant = role === 'OWNER';
  const btnVariant = isMerchant ? 'merchant' : 'shopper';

  const filteredCities = useMemo(() => Object.keys(PK_CITIES).filter(c => c.toLowerCase().includes(citySearch.toLowerCase())), [citySearch]);

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!email.includes('@')) { setError('Enter a valid email'); return; }
      if (email === ADMIN_EMAIL) { setRole('ADMIN'); setStep(2); return; }
      setStep(2);
    } else if (step === 2) {
      if (email === ADMIN_EMAIL && password !== ADMIN_PASSWORD) { setError('Incorrect Admin PIN'); return; }
      if (password.length < 2) { setError('PIN is required'); return; }
      setStep(3);
    } else if (step === 3) {
      if (password !== confirmPassword) { setError('PINs do not match'); return; }
      if (role === 'ADMIN') { handleFinalAuth(); return; }
      if (!isMerchant) { handleFinalAuth(); return; }
      setStep(4);
    } else if (step === 4) {
      if (!storeName) { setError('Business name required'); return; }
      setStep(5);
    } else if (step === 5) {
      if (!area || !location) { setError('Location details required'); return; }
      setStep(6);
    } else if (step === 6) {
      handleFinalAuth();
    }
  };

  const handleFinalAuth = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    if (isMerchant) {
      setWaitingArea(true);
      setLoading(false);
    } else {
      let userId = '';
      try {
        userId = 'u_' + btoa(email).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_').slice(0, 12);
      } catch (e) {
        userId = Math.random().toString(36).substr(2, 9);
      }
      onLogin({ id: userId, name: name || email.split('@')[0], email, role, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` });
    }
  };

  const finalizeOwnerRequest = () => {
    let userId = '';
    try {
      userId = 'u_' + btoa(email).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_').slice(0, 12);
    } catch (e) {
      userId = Math.random().toString(36).substr(2, 9);
    }
    const storeId = 'store_' + userId;
    // FREE plan auto-approved for immediate feedback for user
    const isAutoApproved = selectedPlan === 'FREE'; 
    setStores(prev => [...prev, {
      id: storeId, ownerId: userId, name: storeName, urduName: storeName, address: `${location}, ${area}, ${city}`,
      urduAddress: 'پتہ', distance: '0.2 km', rating: 5.0, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
      phone: `03${Math.floor(100000000 + Math.random() * 900000000)}`, isOnline: true, type: storeType, city, area, 
      approvalStatus: isAutoApproved ? 'APPROVED' : 'PENDING_PAYMENT',
      selectedPlan
    }]);
    onLogin({ id: userId, name: name || email.split('@')[0], email, role: 'OWNER', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`, storeId });
  };

  if (waitingArea) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-12 text-center bg-white islamic-pattern relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-screen bg-slate-50 -skew-x-12 translate-x-20 pointer-events-none" />
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100"><CheckCircle className="w-7 h-7" /></div>
        <h2 className="text-lg font-bold text-slate-800 mb-2 uppercase tracking-tight">Console Created</h2>
        <p className="text-slate-500 font-medium mb-12 leading-relaxed text-[10px] max-w-xs">Your secure business workstation for <b>{storeName}</b> is ready. Finalize to start managing shelf stock.</p>
        <div className="w-full space-y-3 relative z-10">
          <Button variant="merchant" className="w-full py-4 text-xs shadow-xl" onClick={finalizeOwnerRequest}>Start Operations</Button>
          <button onClick={() => setWaitingArea(false)} className="text-slate-400 font-bold uppercase text-[8px] tracking-[0.2em] hover:text-slate-900 transition-colors">Edit Store Profile</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col bg-white relative overflow-hidden">
      <div className="p-6 flex items-center justify-between relative z-20 border-b border-slate-50">
        <button onClick={() => step > 1 ? setStep(step - 1) : onBack()} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 border border-slate-100 hover:text-slate-900 transition-all"><ChevronLeft className="w-5 h-5" /></button>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-full border border-slate-100">Step {step}/{isMerchant ? '6' : '3'}</span>
      </div>
      
      <div className="flex-1 px-8 pt-10 overflow-y-auto no-scrollbar relative z-10 pb-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="space-y-8">
              <div className="space-y-1">
                <h2 className={`text-xl font-bold text-slate-900 tracking-tight`}>{isMerchant ? 'Merchant Hub' : 'Shopper Entry'}</h2>
                <p className="text-slate-400 font-medium text-[10px]">Enter your primary email address</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-1">Email ID</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. hello@domain.com" className="w-full py-3 px-5 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-800 placeholder:text-slate-300 text-xs focus:bg-white focus:ring-2 focus:ring-slate-100 focus:outline-none transition-all shadow-sm" />
                </div>
                {error && <p className="text-[9px] text-red-500 font-semibold ml-1 uppercase tracking-tight">{error}</p>}
                <Button variant={btnVariant} className="w-full shadow-md" onClick={handleNext}>Confirm Email</Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="space-y-8">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Secure Access</h2>
                <p className="text-slate-400 font-medium text-[10px]">Set your master security PIN</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-1">Master PIN</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="w-full py-3 px-5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 placeholder:text-slate-300 text-base tracking-[0.8em] text-center focus:bg-white focus:ring-2 focus:ring-slate-100 focus:outline-none transition-all shadow-sm" />
                </div>
                {error && <p className="text-[9px] text-red-500 font-semibold ml-1 uppercase">{error}</p>}
                <Button variant={btnVariant} className="w-full shadow-md" onClick={handleNext}>Verify PIN</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="space-y-8">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Identity</h2>
                <p className="text-slate-400 font-medium text-[10px]">Tell us your full legal name</p>
              </div>
              <div className="space-y-5">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full py-3 px-5 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-800 placeholder:text-slate-300 text-xs focus:bg-white focus:ring-2 focus:ring-slate-100 focus:outline-none transition-all shadow-sm" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter Security PIN" className="w-full py-3 px-5 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-800 placeholder:text-slate-300 text-xs focus:bg-white focus:ring-2 focus:ring-slate-100 focus:outline-none transition-all shadow-sm" />
                {error && <p className="text-[9px] text-red-500 font-semibold ml-1 uppercase">{error}</p>}
                <Button variant={btnVariant} className="w-full shadow-md" onClick={handleNext}>{isMerchant ? 'Next: Business' : 'Launch Finder'}</Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="space-y-8">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Business Profile</h2>
                <p className="text-slate-400 font-medium text-[10px]">Set your store's brand name</p>
              </div>
              <div className="space-y-6">
                <input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Brand / Shop Name" className="w-full py-3 px-5 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-800 placeholder:text-slate-300 text-xs focus:bg-white focus:ring-2 focus:ring-slate-100 focus:outline-none transition-all shadow-sm" />
                <div className="grid grid-cols-2 gap-3">
                  {['Grocery', 'Fresh Produce', 'Dairy', 'Beverages'].map(t => (
                    <button key={t} onClick={() => setStoreType(t)} className={`py-3 rounded-xl font-bold text-[8px] uppercase tracking-wider border transition-all ${t === storeType ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]' : 'bg-white border-slate-100 text-slate-400'}`}>{t}</button>
                  ))}
                </div>
                {error && <p className="text-[9px] text-red-500 font-semibold ml-1 uppercase">{error}</p>}
                <Button variant="merchant" className="w-full shadow-md" onClick={handleNext}>Next Step</Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Store Location</h2>
                <p className="text-slate-400 font-medium text-[10px]">Where is your shelf located?</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input placeholder="City..." value={citySearch} onChange={(e) => setCitySearch(e.target.value)} className="w-full py-3 pl-10 pr-5 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-xs focus:bg-white focus:outline-none transition-all shadow-sm" />
                </div>
                <div className="h-24 overflow-y-auto no-scrollbar space-y-1.5 px-0.5">
                  {filteredCities.map(c => (
                    <button key={c} onClick={() => setCity(c)} className={`w-full p-2.5 text-left rounded-lg text-[9px] font-bold uppercase tracking-wide transition-all ${city === c ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-50'}`}>{c}</button>
                  ))}
                </div>
                {city && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {PK_CITIES[city].map(a => (
                      <button key={a} onClick={() => setArea(a)} className={`px-4 py-1.5 rounded-full text-[7px] font-bold uppercase border transition-all ${area === a ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}>{a}</button>
                    ))}
                  </div>
                )}
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Full Address" className="w-full py-3 px-5 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-800 placeholder:text-slate-300 text-xs focus:bg-white focus:outline-none transition-all shadow-sm" />
                {error && <p className="text-[9px] text-red-500 font-semibold ml-1 uppercase">{error}</p>}
                <Button variant="merchant" className="w-full" onClick={handleNext}>Pick Tier Plan</Button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="space-y-8 pb-10">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tier Selection</h2>
                <p className="text-slate-400 font-medium text-[10px]">Choose your business growth scale</p>
              </div>
              <div className="space-y-3">
                {PLANS.map(p => (
                  <button key={p.id} onClick={() => setSelectedPlan(p.id)} className={`w-full p-3.5 rounded-xl border transition-all flex justify-between items-center ${selectedPlan === p.id ? 'border-slate-900 bg-slate-50/50 ring-1 ring-slate-900 shadow-md' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: p.color }} />
                      <div className="text-left">
                        <p className="font-bold text-[11px] text-slate-900 uppercase tracking-tight">{p.name}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">{CURRENCY} {p.price}/mo</p>
                      </div>
                    </div>
                    {selectedPlan === p.id && <div className="w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center text-white"><Check className="w-3 h-3 stroke-[3px]" /></div>}
                  </button>
                ))}
              </div>
              <Button variant="merchant" className="w-full shadow-xl mt-4" onClick={handleNext} isLoading={loading}>Launch Hub</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const OwnerDashboard = () => {
  const { products, setProducts, user, logout, stores, setRole, setView, playSound, setStores, chats } = useAppContext();
  const [activeTab, setActiveTab] = useState<'inventory' | 'chats' | 'profile'>('inventory');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const [keywordQuery, setKeywordQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [filterQty, setFilterQty] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const myStore = stores.find(s => s.ownerId === user?.id || s.id === user?.storeId);

  const myChats = useMemo(() => Object.entries(chats).filter(([id]) => id.includes(user?.id || '')), [chats, user]);

  const stats = useMemo(() => {
    const storeProducts = products.filter(p => p.storeId === myStore?.id);
    const lowStock = storeProducts.filter(p => p.quantity > 0 && p.quantity < 20).length;
    const outOfStock = storeProducts.filter(p => p.quantity === 0).length;
    const totalValue = storeProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    return { total: storeProducts.length, lowStock, outOfStock, totalValue };
  }, [products, myStore]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.storeId === myStore?.id && 
      p.name.toLowerCase().includes(keywordQuery.toLowerCase()) &&
      p.category.toLowerCase().includes(categoryQuery.toLowerCase()) &&
      p.quantity >= filterQty[0] && 
      p.quantity <= filterQty[1]
    );
  }, [products, myStore, keywordQuery, categoryQuery, filterQty]);

  if (!myStore || myStore.approvalStatus !== 'APPROVED') {
    return (
      <div className="h-full flex flex-col p-12 items-center justify-center text-center space-y-10 bg-white relative overflow-hidden">
        <div className="w-16 h-16 bg-slate-50 rounded-[24px] shadow-xl flex items-center justify-center text-slate-800 border border-slate-100 relative">
          <Wallet className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg"><Sparkles className="w-4 h-4" /></div>
        </div>
        <div className="space-y-2 z-10">
          <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none uppercase">Activation Pending</h2>
          <p className="text-slate-400 font-semibold text-[9px] uppercase tracking-wider leading-relaxed">Tier: {myStore?.selectedPlan}<br/>Pay {PLANS.find(p => p.id === myStore?.selectedPlan)?.price} PKR</p>
        </div>
        <div className="p-6 bg-slate-50/50 rounded-2xl w-full border border-slate-100 space-y-2">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Support Payment ID</p>
           <p className="text-xl font-bold text-slate-900 tracking-tighter">{SUPPORT_NUMBER}</p>
        </div>
        <div className="w-full space-y-3 z-10">
          <Button variant="merchant" className="w-full shadow-lg" onClick={() => {
               setStores(prev => prev.map(s => s.id === myStore.id ? { ...s, approvalStatus: 'PENDING_APPROVAL' } : s));
               playSound('success');
          }}>Submit Verification</Button>
          <button onClick={logout} className="px-8 py-3 bg-slate-100 text-slate-400 font-bold uppercase text-[8px] tracking-widest rounded-full hover:bg-slate-200 transition-all">Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F9FBFF] overflow-hidden relative font-outfit">
      <header className="p-4 pt-10 flex justify-between items-center bg-white border-b border-slate-100 shadow-sm relative overflow-hidden">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase leading-none">Console</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <p className="text-[#01411C] text-[8px] font-bold uppercase tracking-[0.2em]">{myStore.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNotifications(!showNotifications)} className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center relative text-slate-400 border border-slate-100 hover:text-slate-900 transition-all">
            <Bell className="w-4 h-4" />
            {stats.outOfStock > 0 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />}
          </button>
          <button onClick={() => setIsLibraryOpen(true)} className="w-8 h-8 bg-[#01411C] text-white rounded-lg shadow-md flex items-center justify-center active:scale-90 transition-all"><Plus className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 p-4 bg-white border-b border-slate-50">
        <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Items</p>
          <p className="text-base font-bold text-slate-900 tracking-tighter leading-none">{stats.total}</p>
        </div>
        <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Low Stock</p>
          <p className="text-base font-bold text-red-500 tracking-tighter leading-none">{stats.lowStock}</p>
        </div>
        <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Out Stock</p>
          <p className="text-base font-bold text-red-700 tracking-tighter leading-none">{stats.outOfStock}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative z-10 p-4 space-y-4">
        {activeTab === 'inventory' && (
          <>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input value={keywordQuery} onChange={(e) => setKeywordQuery(e.target.value)} placeholder="Search shelf..." className="w-full py-2.5 pl-9 pr-4 bg-white border border-slate-100 rounded-xl font-medium text-[11px] focus:ring-2 focus:ring-slate-100 focus:outline-none transition-all" />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${showFilters ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 shadow-sm'}`}>
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white p-4 rounded-xl shadow-xl overflow-hidden space-y-4 border border-slate-100">
                    <div className="space-y-2">
                      <label className="text-[8px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2"><Layers className="w-3 h-3" /> Category Filter</label>
                      <div className="relative">
                         <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                         <input value={categoryQuery} onChange={(e) => setCategoryQuery(e.target.value)} placeholder="Filter by category..." className="w-full py-2 pl-8 pr-3 bg-slate-50 border border-slate-100 rounded-lg font-medium text-[10px] focus:bg-white focus:outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pb-20">
              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-medium text-[9px] uppercase tracking-widest opacity-60">No matching stock found</div>
              ) : (
                filteredProducts.map(p => (
                  <motion.div layout key={p.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-50 flex-shrink-0">
                      <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-semibold text-slate-800 text-[11px] truncate tracking-tight uppercase">{p.name}</p>
                      <div className="flex items-center gap-1.5">
                         <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[7px] font-bold uppercase rounded-md tracking-wider">{p.category}</span>
                         <p className="text-[8px] text-slate-400 font-semibold tracking-tight">Qty: <span className={p.quantity < 20 ? 'text-red-500' : 'text-emerald-600'}>{p.quantity}</span></p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900 text-[11px] leading-none">{CURRENCY} {p.price}</p>
                      <button onClick={() => {
                        setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, inStock: !prod.inStock } : prod));
                        playSound('notify');
                      }} className={`mt-1.5 px-2 py-0.5 rounded-md text-[7px] font-bold uppercase text-white shadow-sm border-2 border-white ${p.inStock ? 'bg-emerald-500' : 'bg-red-400'}`}>
                        {p.inStock ? 'LIVE' : 'HIDDEN'}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
        
        {activeTab === 'chats' && (
          <div className="flex-1 space-y-4">
             <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest px-1">Customer Inbox</h3>
             <div className="flex-1 overflow-y-auto space-y-2">
                {myChats.map(([chatId, msgs]) => (
                   <div key={chatId} className="p-3 bg-white rounded-xl border border-slate-100 flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">?</div>
                      <div className="flex-1">
                         <p className="text-[11px] font-bold text-slate-800">{msgs[msgs.length-1].senderName}</p>
                         <p className="text-[9px] text-slate-400 truncate italic">{msgs[msgs.length-1].text}</p>
                      </div>
                   </div>
                ))}
                {myChats.length === 0 && <div className="text-center py-20 text-[10px] uppercase text-slate-300 font-bold tracking-widest">No Active Chats</div>}
             </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="flex-1 space-y-6 flex flex-col items-center pt-8">
             <img src={user?.avatar} className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg" />
             <div className="text-center space-y-1">
                <p className="text-base font-bold text-slate-900 uppercase tracking-tight">{user?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{user?.email}</p>
             </div>
             <Button variant="danger" className="w-full mt-auto mb-4" onClick={logout} icon={LogOut}>Exit Session</Button>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-10 z-50">
        <NavBtn icon={LayoutGrid} label="Shelf" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} color="#01411C" />
        <NavBtn icon={MessageCircle} label="Inbox" active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} color="#01411C" />
        <NavBtn icon={UserIcon} label="Hub" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} color="#01411C" />
      </nav>

      <ProductLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} storeType={myStore.type} onAdd={(item: any) => setProducts(p => [{ id: Math.random().toString(36).substr(2, 9), ...item, inStock: true, stockStatus: 'IN_STOCK', storeId: myStore.id, quantity: 100 }, ...p])} />
    </div>
  );
};

const NavBtn = ({ icon: Icon, label, active, onClick, color }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
    <div className={`p-1.5 rounded-lg transition-all duration-300 ${active ? 'bg-slate-50 shadow-sm ring-1 ring-slate-100' : 'hover:bg-slate-50'}`}>
      <Icon className={`w-4 h-4 ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} style={active ? { color } : {}} />
    </div>
    <span className="text-[7px] font-bold uppercase tracking-[0.15em]">{label}</span>
  </button>
);

const ShopperDashboard = ({ onStoreClick }: any) => {
  const { stores, products, user, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const chips = ['All', 'Grains, Flour & Rice', 'Pulses & Beans', 'Spices & Masala', 'Cooking Oils & Fats', 'Dairy & Eggs', 'Bakery & Bread', 'Biscuits & Snacks'];

  const filteredStores = useMemo(() => {
    return stores.filter(s => s.approvalStatus === 'APPROVED' && (
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.area?.toLowerCase().includes(query.toLowerCase())
    ));
  }, [stores, query]);

  return (
    <div className="h-full flex flex-col bg-[#F9FBFF] relative overflow-hidden font-outfit">
      <div className="flex-1 overflow-y-auto p-5 pt-12 no-scrollbar pb-24 relative z-10">
        {activeTab === 'home' && (
          <div className="space-y-8">
            <header className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0047AB] rounded-xl flex items-center justify-center shadow-lg text-white relative overflow-hidden ring-1 ring-[#0047AB]/10">
                  <div className="absolute inset-0 diagonal-stripes opacity-10" />
                  <ShoppingBag className="w-5 h-5 relative z-10" />
                </div>
                <div><h1 className="text-base font-bold text-slate-900 tracking-tight uppercase leading-none">FindKaro</h1><p className="text-[8px] font-bold text-[#0047AB] uppercase tracking-[0.4em] mt-1">Live Stock Finder</p></div>
              </div>
              <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400 border border-slate-100 hover:bg-slate-50 transition-all"><Bell className="w-4 h-4" /></button>
            </header>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-none uppercase overflow-hidden">
                <motion.span initial={{ y: 30 }} animate={{ y: 0 }} className="block">Shop Real</motion.span>
                <motion.span initial={{ y: 30 }} animate={{ y: 0 }} transition={{ delay: 0.1 }} className="block text-[#FF9F1C]">Time Stock.</motion.span>
              </h2>
              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search shop name or location..." className="w-full py-3.5 pl-11 pr-5 bg-white border border-slate-100 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-300 shadow-sm focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all" />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {chips.map(c => (
                    <button key={c} onClick={() => setCategoryFilter(c)} className={`px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${categoryFilter === c ? 'bg-[#0047AB] border-[#0047AB] text-white shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-3 uppercase px-1">Nearby Verified Hubs <span className="px-2 py-0.5 bg-blue-50 text-[#0047AB] text-[7px] rounded-full border border-blue-100 font-bold uppercase">Live</span></h3>
              <div className="space-y-4">
                {filteredStores.length > 0 ? filteredStores.map(s => {
                    const storeStock = products.filter(p => p.storeId === s.id && p.inStock).length;
                    return (
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} key={s.id} onClick={() => onStoreClick(s)} className="bg-white p-3.5 rounded-[24px] flex gap-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 truck-art-pattern opacity-5" />
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-700 ring-2 ring-slate-50">
                          <img src={s.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-1">
                          <h4 className="font-bold text-slate-900 text-base tracking-tight uppercase leading-none group-hover:text-[#0047AB] transition-colors">{s.name}</h4>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#0047AB]" /> {s.area}, {s.city}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[7px] font-bold uppercase shadow-sm">{storeStock} Live SKU</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                }) : (
                  <div className="py-20 text-center opacity-40">
                     <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                     <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">No stores found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'profile' && (
           <div className="space-y-10 flex flex-col items-center pt-10">
              <img src={user?.avatar} className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl" />
              <div className="text-center space-y-1">
                 <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">{user?.name}</h2>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.email}</p>
              </div>
              <Button variant="danger" className="w-full mt-10" onClick={logout} icon={LogOut}>Sign Out</Button>
           </div>
        )}
      </div>
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-12 z-50">
        <NavBtn icon={HomeIcon} label="Find" active={activeTab === 'home'} onClick={() => setActiveTab('home')} color="#0047AB" />
        <NavBtn icon={UserIcon} label="Me" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} color="#0047AB" />
      </nav>
    </div>
  );
};

const ProductLibraryModal = ({ isOpen, onClose, storeType, onAdd }: any) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  if (!isOpen) return null;
  const library = GLOBAL_ITEM_LIBRARY[storeType] || GLOBAL_ITEM_LIBRARY['Grocery'];
  
  const categories = ['All', ...new Set(library.map(i => i.category))];
  const filteredLibrary = library.filter(i => 
    (activeCategory === 'All' || i.category === activeCategory) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center p-4">
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="bg-white w-full max-w-md rounded-[32px] p-5 flex flex-col gap-4 max-h-[85vh] shadow-2xl relative overflow-hidden border border-slate-100">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#01411C]" />
        <div className="flex justify-between items-center px-1">
          <div><h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase leading-none">Catalog</h3><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Items</p></div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-900 transition-colors shadow-sm"><X className="w-4 h-4" /></button>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Quick find item..." className="w-full py-2.5 pl-9 pr-4 bg-slate-50 border border-slate-100 rounded-xl font-medium text-[11px] focus:bg-white focus:outline-none" />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 border border-slate-100'}`}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pb-10">
          {filteredLibrary.map((item: any, idx: number) => (
            <motion.button whileTap={{scale: 0.98}} key={idx} onClick={() => { onAdd(item); onClose(); }} className="w-full p-3 bg-white border border-slate-100 hover:border-slate-300 rounded-xl flex items-center justify-between group transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover" />
                </div>
                <div className="text-left space-y-0.5">
                  <p className="font-bold text-slate-800 text-[10px] truncate w-32 uppercase tracking-tight leading-none">{item.name}</p>
                  <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wide">{item.category}</p>
                </div>
              </div>
              <p className="font-bold text-slate-900 text-[11px] tracking-tight">{CURRENCY} {item.price}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const StoreDetail = ({ store, onBack }: any) => {
  const { products } = useAppContext();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [itemQuery, setItemQuery] = useState('');
  
  const storeProducts = products.filter(p => p.storeId === store.id && p.inStock && p.name.toLowerCase().includes(itemQuery.toLowerCase()));
  
  const getStatusColor = (status: StockStatus) => {
    switch (status) {
      case 'IN_STOCK': return 'bg-emerald-500';
      case 'LOW_STOCK': return 'bg-orange-500';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 180 }} className="fixed inset-0 z-[60] bg-white flex flex-col font-outfit">
      <div className="relative h-[300px] flex-shrink-0 overflow-hidden bg-slate-900">
        <img src={store.image} className="w-full h-full object-cover scale-110 blur-sm opacity-20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-[32px] overflow-hidden shadow-2xl mb-4 ring-4 ring-white">
                <img src={store.image} className="w-full h-full object-cover" />
            </motion.div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold leading-none tracking-tight text-white mb-4 uppercase">{store.name}</h2>
            </div>
            
            <div className="flex gap-2 w-full max-w-xs">
               <motion.button whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} onClick={() => setIsChatOpen(true)} className="flex-1 bg-white text-slate-900 py-3 rounded-xl font-bold text-[8px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl">
                  <MessageCircle className="w-4 h-4" /> Chat
               </motion.button>
               <motion.button whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} onClick={() => window.location.href = `tel:${store.phone}`} className="flex-1 bg-[#0047AB] text-white py-3 rounded-xl font-bold text-[8px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl">
                  <Phone className="w-4 h-4" /> Call
               </motion.button>
            </div>
        </div>
        <button onClick={onBack} className="absolute top-10 left-6 w-8 h-8 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-xl text-white border border-white/30 hover:bg-white hover:text-slate-900 transition-all"><ChevronLeft className="w-5 h-5" /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 no-scrollbar pb-32 bg-white rounded-t-[36px] -mt-8 relative z-10 shadow-2xl ring-1 ring-slate-100">
        <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[7px] tracking-[0.2em] bg-slate-50 w-fit px-4 py-2 rounded-full border border-slate-100">
          <MapPin className="w-3 h-3 text-[#0047AB]" /> {store.area}, {store.city}
        </div>
        
        <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center justify-between uppercase">Live Inventory <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{storeProducts.length} SKU</span></h3>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input value={itemQuery} onChange={(e) => setItemQuery(e.target.value)} placeholder="Search shop stock..." className="w-full py-2 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl font-medium text-[11px] focus:bg-white focus:outline-none transition-all" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                {storeProducts.map(p => (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={p.id} className="bg-white p-2.5 rounded-[20px] shadow-sm flex flex-col gap-2 border border-slate-100 transition-all duration-300 group">
                    <div className="aspect-square rounded-xl overflow-hidden relative shadow-inner bg-slate-50">
                      <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className={`absolute top-1.5 left-1.5 px-1 py-0.5 rounded-md text-[6px] font-bold uppercase text-white shadow-xl ${getStatusColor(p.stockStatus)}`}>{p.stockStatus.replace('_', ' ')}</div>
                    </div>
                    <div className="px-0.5 space-y-1">
                      <div className="space-y-0.5">
                          <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[6px] font-bold uppercase rounded-md tracking-wider">{p.category}</span>
                          <h4 className="font-bold text-[10px] leading-tight text-slate-900 truncate uppercase tracking-tight pt-1">{p.name}</h4>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                          <span className="text-[#0047AB] font-bold text-[11px] tracking-tight">{CURRENCY} {p.price}</span>
                          <div className="w-5 h-5 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 hover:text-white hover:bg-[#0047AB] transition-all cursor-pointer"><PlusCircle className="w-3 h-3" /></div>
                      </div>
                    </div>
                </motion.div>
                ))}
            </div>
        </div>
      </div>
      <AnimatePresence>
        {isChatOpen && <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} store={store} otherPartyName="Store Support" otherPartyId={store.ownerId} />}
      </AnimatePresence>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const { stores, setStores, logout, playSound } = useAppContext();
  const [filter, setFilter] = useState<ApprovalStatus | 'ALL'>('ALL');

  const filteredStores = stores.filter(s => filter === 'ALL' || s.approvalStatus === filter);

  const stats = {
    total: stores.length,
    pending: stores.filter(s => s.approvalStatus === 'PENDING_APPROVAL').length,
    approved: stores.filter(s => s.approvalStatus === 'APPROVED').length,
  };

  const updateStatus = (storeId: string, status: ApprovalStatus) => {
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, approvalStatus: status } : s));
    playSound('success');
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden font-outfit">
      <header className="p-6 pt-12 bg-white border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Admin Control</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">System Management</p>
        </div>
        <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Stores</p>
          <p className="text-lg font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending</p>
          <p className="text-lg font-bold text-amber-500">{stats.pending}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Live</p>
          <p className="text-lg font-bold text-emerald-500">{stats.approved}</p>
        </div>
      </div>

      <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {(['ALL', 'PENDING_PAYMENT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'] as const).map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all ${filter === f ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-10">
        {filteredStores.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex gap-4">
              <img src={s.image} className="w-12 h-12 rounded-xl object-cover" alt={s.name} />
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">{s.name}</h4>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">{s.city} • {s.selectedPlan}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[7px] font-bold uppercase ${
                    s.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 
                    s.approvalStatus === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-600' : 
                    s.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {s.approvalStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
            {s.approvalStatus !== 'APPROVED' && (
              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <Button variant="merchant" className="flex-1 py-2 text-[8px]" onClick={() => updateStatus(s.id, 'APPROVED')} icon={CheckCircle}>Approve</Button>
                <Button variant="danger" className="flex-1 py-2 text-[8px]" onClick={() => updateStatus(s.id, 'REJECTED')} icon={X}>Reject</Button>
              </div>
            )}
          </div>
        ))}
        {filteredStores.length === 0 && <div className="text-center py-20 text-[10px] uppercase text-slate-300 font-bold tracking-widest">No matching requests</div>}
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('fk_user');
      return raw ? JSON.parse(raw) as User : null;
    } catch (e) {
      return null;
    }
  });
  const [role, setRole] = useState<UserRole | null>(() => user?.role || null);
  const [view, setView] = useState<'WELCOME' | 'AUTH' | 'DASHBOARD'>('WELCOME');
  const [stores, setStores] = useState<Store[]>(() => {
    try {
      const raw = localStorage.getItem('fk_stores');
      return raw ? JSON.parse(raw) as Store[] : MOCK_STORES;
    } catch (e) { return MOCK_STORES; }
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const raw = localStorage.getItem('fk_products');
      return raw ? JSON.parse(raw) as Product[] : MOCK_PRODUCTS;
    } catch (e) { return MOCK_PRODUCTS; }
  });
  const [insights, setInsights] = useState<SearchInsight[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const raw = localStorage.getItem('fk_notifications');
      return raw ? JSON.parse(raw) as AppNotification[] : [];
    } catch (e) { return []; }
  });
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [chats, setChats] = useState<Record<string, Message[]>>(() => {
    try {
      const raw = localStorage.getItem('fk_chats');
      return raw ? JSON.parse(raw) as Record<string, Message[]> : {};
    } catch (e) { return {}; }
  });
  const [bgMusicPlaying, setBgMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const playSound = useCallback((type: keyof typeof SOUND_URLS) => { 
    new Audio(SOUND_URLS[type]).play().catch(() => {}); 
  }, []);

  // Background music effect
  useEffect(() => {
    if (view === 'WELCOME' && bgMusicPlaying) {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/123/ambient-background.mp3');
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current?.pause();
    }
  }, [view, bgMusicPlaying]);

  // persist user to localStorage so user remains signed in across reloads
  useEffect(() => {
    try {
      if (user) localStorage.setItem('fk_user', JSON.stringify(user));
      else localStorage.removeItem('fk_user');
    } catch (e) {}
  }, [user]);

  // persist stores/products/chats/notifications
  useEffect(() => {
    try { localStorage.setItem('fk_stores', JSON.stringify(stores)); } catch (e) {}
  }, [stores]);
  useEffect(() => {
    try { localStorage.setItem('fk_products', JSON.stringify(products)); } catch (e) {}
  }, [products]);
  useEffect(() => {
    try { localStorage.setItem('fk_chats', JSON.stringify(chats)); } catch (e) {}
  }, [chats]);
  useEffect(() => {
    try { localStorage.setItem('fk_notifications', JSON.stringify(notifications)); } catch (e) {}
  }, [notifications]);

  const logout = () => { setUser(null); setRole(null); setView('WELCOME'); setSelectedStore(null); try { localStorage.removeItem('fk_user'); } catch (e) {} };

  const sendChatMessage = (chatId: string, message: Message) => {
    setChats(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message]
    }));
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, role, setRole, view, setView, stores, setStores, products, setProducts, 
      insights, setInsights, notifications, setNotifications, playSound, logout, chats, sendChatMessage 
    }}>
      <div className="relative w-full max-w-md h-screen mx-auto bg-white shadow-2xl overflow-hidden flex flex-col font-outfit">
        {/* Always-visible Sign-In button when no user is authenticated */}
        {!user && (
          <div className="absolute top-4 right-4 z-50">
            <button onClick={() => setView('AUTH')} className="px-3 py-2 rounded-full bg-slate-900 text-white text-xs font-bold">Sign In</button>
          </div>
        )}
        <AnimatePresence mode="wait">
          {view === 'WELCOME' && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col p-14 bg-white islamic-pattern relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-screen bg-slate-50 -skew-x-12 translate-x-16" />
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 relative z-10">
                <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} className="w-48 h-48 bg-slate-900 rounded-[48px] flex items-center justify-center shadow-2xl relative overflow-hidden ring-[10px] ring-slate-100 group">
                   <div className="absolute inset-0 diagonal-stripes opacity-10" />
                   <ShoppingBag className="w-14 h-14 text-white relative z-10 group-hover:scale-110 transition-transform" />
                </motion.div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tighter leading-none uppercase">Find<span className="text-[#FF9F1C]">Karo</span></h1>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Real-time Inventory Hub</p>
                </div>
                <button onClick={() => setBgMusicPlaying(!bgMusicPlaying)} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold uppercase text-slate-400 hover:text-slate-900 transition-all">
                  {bgMusicPlaying ? <Music2 className="w-3 h-3 text-blue-500 animate-pulse" /> : <Music className="w-3 h-3" />}
                  {bgMusicPlaying ? 'Audio On' : 'Audio Off'}
                </button>
              </div>
              <div className="space-y-4 pb-12 z-10">
                <Button variant="shopper" className="w-full py-4 text-xs shadow-xl" onClick={() => { setRole('USER'); setView('AUTH'); }}>Find Local Stock</Button>
                {user?.role === 'OWNER' ? (
                  <div className="space-y-2">
                    <Button variant="merchant" className="w-full py-4 text-xs shadow-xl" onClick={() => { setView('DASHBOARD'); }}>Open Merchant Center</Button>
                    <Button variant="outline" className="w-full py-3 text-xs uppercase font-bold tracking-widest text-[9px]" onClick={logout}>Sign Out</Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full py-4 text-xs border-[2px] uppercase font-bold tracking-widest text-[9px]" onClick={() => { setRole('OWNER'); setView('AUTH'); }}>Merchant Workspace</Button>
                )}
              </div>
            </motion.div>
          )}
          {view === 'AUTH' && <AuthScreen role={role} onBack={() => setView('WELCOME')} onLogin={(u: any) => { setUser(u); setRole(u.role); setView('DASHBOARD'); }} />}
          {view === 'DASHBOARD' && user && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
              {user.role === 'USER' ? (
                <>
                  <ShopperDashboard onStoreClick={setSelectedStore} />
                  <AnimatePresence>
                    {selectedStore && <StoreDetail store={selectedStore} onBack={() => setSelectedStore(null)} />}
                  </AnimatePresence>
                </>
              ) : (user.role === 'ADMIN' ? <AdminDashboard /> : <OwnerDashboard />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}

export default App;