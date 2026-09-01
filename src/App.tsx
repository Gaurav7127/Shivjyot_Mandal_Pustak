import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Download, Share2, ArrowLeft, Home, List, PieChart, Trash2, X, Check, Globe, AlertCircle, CheckCircle, CreditCard, LogOut } from 'lucide-react';
import { subscribeToVarganis, subscribeToExpenses, saveVargani, saveExpense, updateVargani, updateExpense, deleteVargani, deleteExpense, getNextReceiptNo, formatCurrency, numberToEnglishWords, numberToMarathiWords, toMarathiDigits } from './store';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Vargani, Expense } from './types';
import { format } from 'date-fns';
import { toBlob, toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';

type View = 'home' | 'entries' | 'reports' | 'vargani_form' | 'expense_form' | 'receipt';
type Lang = 'mr' | 'en';

const translations = {
  mandalName: { en: 'शिवज्योत गणेशोत्सव मंडळ, सातारा', mr: 'शिवज्योत गणेशोत्सव मंडळ, सातारा' },
  mandalSub: { en: 'सार्वजनिक गणेशोत्सव २०२६ • वर्ष २८', mr: 'सार्वजनिक गणेशोत्सव २०२६ • वर्ष २८' },
  homeTitle: { en: 'Home', mr: 'मुख्यपृष्ठ' },
  entriesTitle: { en: 'Entries', mr: 'नोंदी' },
  reportsTitle: { en: 'Reports', mr: 'अहवाल' },
  addIncome: { en: 'Add Income', mr: 'उत्पन्न जोडा' },
  addExpense: { en: 'Add Expense', mr: 'खर्च जोडा' },
  all: { en: 'All', mr: 'सर्व' },
  income: { en: 'Income', mr: 'जमा' },
  expenses: { en: 'Expenses', mr: 'खर्च' },
  goods: { en: 'Goods', mr: 'वस्तू' },
  pending: { en: 'Pending', mr: 'प्रलंबित' },
  noEntries: { en: 'No entries found.', mr: 'कोणतीही नोंद नाही.' },
  netBalance: { en: 'Net Balance', mr: 'एकूण शिल्लक' },
  netInHandVargani: { en: 'Net Vargani Collected (In-Hand)', mr: 'एकूण जमा वर्गणी (हस्तगत)' },
  advanceGiven: { en: 'Advance Given to Vendors', mr: 'कंत्राटदारांना दिलेली आगाऊ रक्कम' },
  advanceGivenShort: { en: 'Advance Given', mr: 'आगाऊ खर्च (दिलेला)' },
  balanceAfterAdvance: { en: 'Balance after Advance', mr: 'आगाऊ वजा शिल्लक' },
  totalCollected: { en: 'Total Collected', mr: 'एकूण जमा' },
  totalSpent: { en: 'Total Spent (Paid)', mr: 'एकूण खर्च (दिलेला)' },
  leaderboard: { en: 'Volunteer Leaderboard', mr: 'स्वयंसेवक यादी' },
  noData: { en: 'No data yet', mr: 'कोणताही डेटा नाही' },
  newVargani: { en: 'New Vargani Receipt', mr: 'नवीन वर्गणी पावती' },
  donorName: { en: 'Donor Name *', mr: 'देणगीदाराचे नाव *' },
  mobile: { en: 'Mobile', mr: 'मोबाईल' },
  address: { en: 'Address', mr: 'पत्ता' },
  isGoods: { en: 'Is this donation in kind (Goods)?', mr: 'ही देणगी वस्तू स्वरूपात आहे का?' },
  amount: { en: 'Amount *', mr: 'रक्कम *' },
  paymentMode: { en: 'Payment Mode', mr: 'पेमेंट मोड' },
  cash: { en: 'Cash', mr: 'रोख' },
  upi: { en: 'UPI (GPay/PhonePe)', mr: 'युपीआय' },
  cheque: { en: 'Cheque', mr: 'चेक' },
  isPending: { en: 'Is this payment pending?', mr: 'ही देणगी प्रलंबित आहे का?' },
  volunteerName: { en: 'Volunteer Name *', mr: 'स्वयंसेवकाचे नाव *' },
  cancel: { en: 'Cancel', mr: 'रद्द करा' },
  generateReceipt: { en: 'Generate Receipt', mr: 'पावती तयार करा' },
  newExpense: { en: 'New Expense', mr: 'नवीन खर्च नोंद' },
  expenseTitle: { en: 'Expense / Vendor Title *', mr: 'खर्चाचे नाव / कंत्राटदार *' },
  category: { en: 'Category', mr: 'वर्ग' },
  advanceAmount: { en: 'Advance / Paid Amount *', mr: 'दिलेली आगाऊ रक्कम *' },
  remainingAmount: { en: 'Remaining / Pending Amount', mr: 'बाकी / प्रलंबित रक्कम' },
  totalBillAmount: { en: 'Total Estimated / Bill Amount', mr: 'एकूण खर्चाची रक्कम' },
  notes: { en: 'Notes / Contact Info', mr: 'नोंदी / संपर्क तपशील' },
  saveExpense: { en: 'Save Expense', mr: 'खर्च जतन करा' },
  deleteTitle: { en: 'Delete Entry', mr: 'नोंद हटवा' },
  deleteConfirm: { en: 'Are you sure? This will be permanently deleted and cannot be undone.', mr: 'तुम्हाला खात्री आहे का? हा डेटा कायमचा हटवला जाईल.' },
  yesDelete: { en: 'Yes, Delete', mr: 'होय, हटवा' },
  pendingPayable: { en: 'Pending to Pay', mr: 'देणे बाकी' },
  pendingReceivable: { en: 'Pending to Receive', mr: 'येणे बाकी' },
  totalCommitted: { en: 'Total Budgeted Expense', mr: 'एकूण अंदाजित खर्च' },
  settleDue: { en: 'Pay Remaining', mr: 'बाकी भरा' },
  markReceived: { en: 'Mark Received', mr: 'जमा झाली' },
  paid: { en: 'Paid', mr: 'दिले' },
  remaining: { en: 'Remaining', mr: 'बाकी' },
  loginTitle: { en: 'Mandal Login', mr: 'मंडळ लॉगिन' },
  loginId: { en: 'Organization ID', mr: 'संस्थेचा आयडी' },
  password: { en: 'Password', mr: 'पासवर्ड' },
  loginBtn: { en: 'Login', mr: 'लॉगिन करा' },
  loginErr: { en: 'Invalid ID or Password', mr: 'चुकीचा आयडी किंवा पासवर्ड' },
};

const t = (key: keyof typeof translations, lang: Lang) => translations[key][lang];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('mandal_auth') === 'true');
  useEffect(() => { if (isAuthenticated && !auth.currentUser) { signInAnonymously(auth).catch(console.error); } }, [isAuthenticated]);
  const [currentView, setCurrentView] = useState<View>('home');
  const [varganis, setVarganis] = useState<Vargani[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Vargani | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  
  // Custom Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'vargani' | 'expense', id: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubV = subscribeToVarganis(setVarganis);
    const unsubE = subscribeToExpenses(setExpenses);
    return () => {
      unsubV();
      unsubE();
    };
  }, [isAuthenticated]);


  // Settlement Modal State for Pending Expense
  const [settleExpenseItem, setSettleExpenseItem] = useState<Expense | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>('');

  useEffect(() => {
    
    
  }, []);

  const navigateTo = (view: View) => setCurrentView(view);

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'vargani') {
      deleteVargani(deleteConfirm.id);
      
    } else {
      deleteExpense(deleteConfirm.id);
      
    }
    setDeleteConfirm(null);
  };

  const handleMarkVarganiReceived = (id: string) => {
    const v = varganis.find(item => item.id === id);
    if (!v) return;
    const updated = { ...v, isPending: false };
    updateVargani(updated);
    
  };

  const handleOpenSettleExpense = (exp: Expense) => {
    setSettleExpenseItem(exp);
    setSettleAmount((exp.remainingAmount || 0).toString());
  };

  const handleConfirmSettleExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleExpenseItem) return;
    const pay = Number(settleAmount);
    if (isNaN(pay) || pay <= 0) return;

    const currentAdvance = settleExpenseItem.advanceAmount ?? settleExpenseItem.amount;
    const currentRemaining = settleExpenseItem.remainingAmount ?? 0;
    const newAdvance = currentAdvance + pay;
    const newRemaining = Math.max(0, currentRemaining - pay);
    const newTotal = settleExpenseItem.totalAmount || (currentAdvance + currentRemaining);

    const updated: Expense = {
      ...settleExpenseItem,
      amount: newAdvance,
      advanceAmount: newAdvance,
      remainingAmount: newRemaining,
      totalAmount: newTotal
    };

    updateExpense(updated);
    
    setSettleExpenseItem(null);
    setSettleAmount('');
  };

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('mandal_lang', l);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mandal_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={async () => { await signInAnonymously(auth); setIsAuthenticated(true); sessionStorage.setItem('mandal_auth', 'true'); }} lang={lang} setLang={handleSetLang} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#FAF9F6] font-sans text-[#1A1A1A] overflow-hidden relative">
      {/* Global Header */}
      <header className="bg-[#800000] text-white p-3 flex justify-between items-center shadow-lg border-b-4 border-[#FF9933] flex-none">
        <div className="flex items-center gap-3">
           {['vargani_form', 'expense_form', 'receipt'].includes(currentView) && (
              <button onClick={() => navigateTo('home')} className="hover:text-amber-200"><ArrowLeft size={20} /></button>
           )}
           <div className="bg-[#FF9933] p-1 rounded-full">
             <div className="w-8 h-8 flex items-center justify-center font-bold text-[#800000] text-xl">ॐ</div>
           </div>
           <div>
             <h1 className="text-lg font-bold tracking-tight">Mandal Pavti Pustak </h1>
             <p className="text-[9px] tracking-widest opacity-90 uppercase">|| गणपती बाप्पा मोरया ||</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={handleLogout}
             className="flex items-center justify-center bg-white/10 hover:bg-white/20 p-2 rounded-full transition text-xs font-bold border border-white/20"
             title="Logout"
           >
             <LogOut size={16} />
           </button>
        </div>
      </header>

      {/* Main Container - Mobile Centric Layout */}
      <main className="flex-1 overflow-hidden flex flex-col relative w-full max-w-md mx-auto bg-white shadow-xl border-x border-gray-100">
        <div className="flex-1 overflow-y-auto relative">
          {currentView === 'home' && <HomeView navigateTo={navigateTo} lang={lang} />}
          {currentView === 'entries' && (
            <EntriesView 
              varganis={varganis} 
              expenses={expenses} 
              onDelete={(type, id) => setDeleteConfirm({ type, id })} 
              onViewReceipt={(v) => { setSelectedReceipt(v); navigateTo('receipt'); }} 
              onMarkVarganiReceived={handleMarkVarganiReceived}
              onOpenSettleExpense={handleOpenSettleExpense}
              lang={lang} 
            />
          )}
          {currentView === 'reports' && <ReportsView varganis={varganis} expenses={expenses} lang={lang} />}
          {currentView === 'vargani_form' && (
            <VarganiForm 
              onSave={(v) => { saveVargani(v);  setSelectedReceipt(v); navigateTo('receipt'); }}
              onCancel={() => navigateTo('home')}
              lang={lang}
            />
          )}
          {currentView === 'expense_form' && (
            <ExpenseForm 
              onSave={(e) => { saveExpense(e);  navigateTo('entries'); }}
              onCancel={() => navigateTo('home')}
              lang={lang}
            />
          )}
          {currentView === 'receipt' && selectedReceipt && (
            <ReceiptView receipt={selectedReceipt} onBack={() => navigateTo('home')} lang={lang} />
          )}
        </div>

        {/* Bottom Navigation */}
        {['home', 'entries', 'reports'].includes(currentView) && (
          <nav className="flex-none bg-white border-t border-gray-200 flex justify-around p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-20">
            <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center p-2 transition ${currentView==='home'?'text-[#800000] scale-110':'text-gray-400 hover:text-gray-600'}`}>
              <Home size={22} />
              <span className="text-[10px] font-bold mt-1">{t('homeTitle', lang)}</span>
            </button>
            <button onClick={() => setCurrentView('entries')} className={`flex flex-col items-center p-2 transition ${currentView==='entries'?'text-[#800000] scale-110':'text-gray-400 hover:text-gray-600'}`}>
              <List size={22} />
              <span className="text-[10px] font-bold mt-1">{t('entriesTitle', lang)}</span>
            </button>
            <button onClick={() => setCurrentView('reports')} className={`flex flex-col items-center p-2 transition ${currentView==='reports'?'text-[#800000] scale-110':'text-gray-400 hover:text-gray-600'}`}>
              <PieChart size={22} />
              <span className="text-[10px] font-bold mt-1">{t('reportsTitle', lang)}</span>
            </button>
          </nav>
        )}
      </main>
      
      {/* Settle Expense Due Modal */}
      {settleExpenseItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-sm border-t-4 border-[#800000]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-[#800000] flex items-center gap-1.5">
                <CreditCard size={18} />
                {lang === 'mr' ? 'बाकी खर्चाचे पेमेंट करा' : 'Settle Expense Due'}
              </h3>
              <button onClick={() => setSettleExpenseItem(null)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-orange-50/70 p-3 rounded-lg border border-orange-100 mb-4 text-xs space-y-1">
              <p className="font-bold text-gray-800 text-sm">{settleExpenseItem.title}</p>
              <div className="flex justify-between text-gray-600 pt-1">
                <span>{lang === 'mr' ? 'एकूण बिल:' : 'Total Bill:'}</span>
                <span className="font-bold">{formatCurrency(settleExpenseItem.totalAmount || ((settleExpenseItem.advanceAmount ?? settleExpenseItem.amount) + (settleExpenseItem.remainingAmount ?? 0)))}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{lang === 'mr' ? 'आतापर्यंत दिलेले:' : 'Paid so far:'}</span>
                <span className="font-bold text-green-700">{formatCurrency(settleExpenseItem.advanceAmount ?? settleExpenseItem.amount)}</span>
              </div>
              <div className="flex justify-between text-red-600 font-bold border-t border-orange-200/60 pt-1">
                <span>{lang === 'mr' ? 'देणे बाकी शिल्लक:' : 'Remaining Due:'}</span>
                <span>{formatCurrency(settleExpenseItem.remainingAmount || 0)}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmSettleExpense} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {lang === 'mr' ? 'आता भरायची रक्कम (₹) *' : 'Amount paying now (₹) *'}
                </label>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  max={settleExpenseItem.remainingAmount || 999999}
                  value={settleAmount} 
                  onChange={e => setSettleAmount(e.target.value)} 
                  className="w-full border-2 border-[#800000] rounded-lg p-2.5 text-base font-black text-[#800000] outline-none"
                  placeholder="Enter amount"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  {lang === 'mr' ? 'तुम्ही पूर्ण किंवा अंशतः (हप्ता) रक्कम भरू शकता.' : 'You can pay the full remaining due or a partial amount.'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSettleExpenseItem(null)} 
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  {t('cancel', lang)}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-[#800000] text-white rounded-lg text-xs font-bold hover:bg-red-900 transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check size={16} />
                  {lang === 'mr' ? 'पेमेंट नोंदवा' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-red-600">{t('deleteTitle', lang)}</h3>
                <button onClick={() => setDeleteConfirm(null)} className="text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
             </div>
             <p className="text-sm text-gray-600 mb-6">{t('deleteConfirm', lang)}</p>
             <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition">{t('cancel', lang)}</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-md">{t('yesDelete', lang)}</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeView({ navigateTo, lang }: { navigateTo: (v: View) => void, lang: Lang }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 relative">
      <div className="absolute top-0 left-0 w-full h-32 bg-[#FF9933] opacity-10 rounded-b-[100px]"></div>
      
      <div className="text-center space-y-4 relative z-10 w-full mb-12">
        <div className="w-24 h-24 bg-[#FF9933] rounded-full mx-auto flex items-center justify-center text-[#800000] text-5xl font-bold mb-6 shadow-xl border-4 border-white">ॐ</div>
        <h1 className="text-3xl font-black text-[#800000] uppercase tracking-tight leading-tight">{t('mandalName', lang as Lang)}</h1>
        <p className="text-gray-500 font-bold tracking-widest text-xs uppercase">{t('mandalSub', lang as Lang)}</p>
      </div>
      
      <div className="w-full space-y-4 relative z-10">
        <button onClick={() => navigateTo('vargani_form')} className="w-full bg-[#FF9933] text-white py-4 rounded-xl text-sm font-bold shadow-lg hover:bg-orange-600 transition flex items-center justify-center gap-2">
          <PlusCircle size={20} />
          {t('addIncome', lang)}
        </button>
        <button onClick={() => navigateTo('expense_form')} className="w-full bg-white border-2 border-[#800000] text-[#800000] py-4 rounded-xl text-sm font-bold shadow-sm hover:bg-red-50 transition flex items-center justify-center gap-2">
          <MinusCircle size={20} />
          {t('addExpense', lang)}
        </button>
      </div>
    </div>
  );
}

function EntriesView({ 
  varganis, 
  expenses, 
  onDelete, 
  onViewReceipt, 
  onMarkVarganiReceived,
  onOpenSettleExpense,
  lang 
}: { 
  varganis: Vargani[], 
  expenses: Expense[], 
  onDelete: (type: 'vargani'|'expense', id: string)=>void, 
  onViewReceipt: (v: Vargani)=>void, 
  onMarkVarganiReceived: (id: string) => void,
  onOpenSettleExpense: (e: Expense) => void,
  lang: Lang 
}) {
  const tabs = ['All', 'Income', 'Expenses', 'Goods', 'Pending'] as const;
  const tabKeys = { All: 'all', Income: 'income', Expenses: 'expenses', Goods: 'goods', Pending: 'pending' } as const;
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('All');

  const allItems = [
    ...varganis.map(v => ({ ...v, _type: 'vargani' as const, ts: parseInt(v.id) })),
    ...expenses.map(e => ({ ...e, _type: 'expense' as const, ts: parseInt(e.id) }))
  ].sort((a, b) => b.ts - a.ts);

  let displayItems = [];
  if (activeTab === 'All') displayItems = allItems;
  else if (activeTab === 'Income') displayItems = allItems.filter(i => i._type === 'vargani' && !i.isGoods && !i.isPending);
  else if (activeTab === 'Expenses') displayItems = allItems.filter(i => i._type === 'expense');
  else if (activeTab === 'Goods') displayItems = allItems.filter(i => i._type === 'vargani' && i.isGoods);
  else if (activeTab === 'Pending') displayItems = allItems.filter(i => (i._type === 'vargani' && i.isPending) || (i._type === 'expense' && ((i as Expense).remainingAmount ?? 0) > 0));

  const totalPendingReceivable = varganis.filter(v => v.isPending).reduce((sum, v) => sum + v.amount, 0);
  const totalPendingPayable = expenses.reduce((sum, e) => sum + (e.remainingAmount || 0), 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
       {/* Tabs Horizontal Scroll */}
       <div className="flex overflow-x-auto gap-2 p-3 bg-white border-b flex-none no-scrollbar shadow-sm">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors border ${activeTab === tab ? 'bg-[#800000] text-white border-[#800000]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {t(tabKeys[tab], lang)}
              {tab === 'Pending' && (varganis.some(v => v.isPending) || expenses.some(e => (e.remainingAmount || 0) > 0)) && (
                <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {varganis.filter(v => v.isPending).length + expenses.filter(e => (e.remainingAmount || 0) > 0).length}
                </span>
              )}
            </button>
          ))}
       </div>

       {/* Pending Banner summary when in Pending tab */}
       {activeTab === 'Pending' && (totalPendingPayable > 0 || totalPendingReceivable > 0) && (
         <div className="grid grid-cols-2 gap-2 p-3 pb-0">
           <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-center">
             <p className="text-[10px] font-bold text-red-700 uppercase">{t('pendingPayable', lang)} (खर्च)</p>
             <p className="text-sm font-black text-red-600">{formatCurrency(totalPendingPayable)}</p>
           </div>
           <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center">
             <p className="text-[10px] font-bold text-amber-800 uppercase">{t('pendingReceivable', lang)} (वर्गणी)</p>
             <p className="text-sm font-black text-amber-700">{formatCurrency(totalPendingReceivable)}</p>
           </div>
         </div>
       )}

       {/* List */}
       <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
         {displayItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 opacity-50">
               <List size={40} className="mb-2 text-gray-400" />
               <p className="text-center text-gray-500 text-xs">{t('noEntries', lang)}</p>
            </div>
         )}
         <AnimatePresence>
         {displayItems.map(item => {
           const isVargani = item._type === 'vargani';
           const varganiItem = isVargani ? (item as Vargani) : null;
           const expenseItem = !isVargani ? (item as Expense) : null;
           const hasExpenseRemaining = expenseItem && (expenseItem.remainingAmount || 0) > 0;
           const isPendingVargani = varganiItem && varganiItem.isPending;

           return (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.2 }}
              onClick={() => isVargani && onViewReceipt(varganiItem!)} 
              className={`bg-white p-3.5 rounded-xl border shadow-sm flex flex-col gap-2 transition-colors ${
                isVargani ? 'cursor-pointer hover:border-[#FF9933] border-gray-200' : 'border-gray-200'
              } ${hasExpenseRemaining || isPendingVargani ? 'border-amber-200 bg-amber-50/20' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-bold text-gray-900">
                      {isVargani ? varganiItem!.donorName : expenseItem!.title}
                    </p>
                    {isVargani && varganiItem!.isGoods && (
                      <span className="text-[#FF9933] font-bold bg-orange-50 border border-orange-200 text-[9px] px-1.5 py-0.5 rounded">
                        {t('goods', lang)}
                      </span>
                    )}
                    {isPendingVargani && (
                      <span className="text-amber-800 font-bold bg-amber-100 border border-amber-300 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <AlertCircle size={10} />
                        {lang === 'mr' ? 'वर्गणी बाकी' : 'Donation Pending'}
                      </span>
                    )}
                    {hasExpenseRemaining && (
                      <span className="text-red-700 font-bold bg-red-100 border border-red-300 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <AlertCircle size={10} />
                        {lang === 'mr' ? `बाकी: ₹${toMarathiDigits(expenseItem!.remainingAmount!)}` : `Due: ₹${expenseItem!.remainingAmount}`}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 flex-wrap">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{isVargani ? `MB ${((varganiItem!.receiptNo || '').split('-').pop())}` : expenseItem!.category}</span>
                    {expenseItem && expenseItem.notes && (
                      <>
                        <span>•</span>
                        <span className="italic text-gray-400 max-w-[120px] truncate">{expenseItem.notes}</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={`text-sm font-black tracking-tight ${isVargani ? 'text-green-600' : 'text-red-600'}`}>
                      {isVargani ? '+' : '-'}{formatCurrency(item.amount)}
                    </span>
                    {!isVargani && hasExpenseRemaining && (
                      <p className="text-[9px] font-bold text-gray-400">
                        {lang === 'mr' ? 'एकूण' : 'Total'} {formatCurrency(expenseItem!.totalAmount || (expenseItem!.amount + (expenseItem!.remainingAmount || 0)))}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item._type, item.id); }} 
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                  >
                     <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Quick Action bar for Pending items in list */}
              {(isPendingVargani || hasExpenseRemaining) && (
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-1 text-xs">
                  {isPendingVargani && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] text-amber-800 font-medium">
                        {lang === 'mr' ? 'स्वयंसेवक:' : 'Volunteer:'} <strong className="text-gray-700">{varganiItem!.volunteerName}</strong>
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onMarkVarganiReceived(varganiItem!.id); }}
                        className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm transition"
                      >
                        <CheckCircle size={12} />
                        {t('markReceived', lang)}
                      </button>
                    </div>
                  )}

                  {hasExpenseRemaining && (
                    <div className="flex items-center justify-between w-full bg-red-50/70 p-2 rounded border border-red-100">
                      <div className="text-[10px]">
                        <span className="text-gray-600">{lang === 'mr' ? 'दिले:' : 'Paid:'} <strong>{formatCurrency(expenseItem!.advanceAmount ?? expenseItem!.amount)}</strong></span>
                        <span className="mx-1 text-gray-400">|</span>
                        <span className="text-red-700 font-bold">{lang === 'mr' ? 'बाकी:' : 'Due:'} <strong>{formatCurrency(expenseItem!.remainingAmount!)}</strong></span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onOpenSettleExpense(expenseItem!); }}
                        className="bg-[#800000] hover:bg-red-900 text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm transition"
                      >
                        <CreditCard size={12} />
                        {t('settleDue', lang)}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
           );
         })}
         </AnimatePresence>
       </div>
    </div>
  )
}

function ReportsView({ varganis, expenses, lang }: { varganis: Vargani[], expenses: Expense[], lang: Lang }) {
  // Only calculate Vargani Collected amount for net in-hand
  const totalCollected = varganis.filter(v => !v.isGoods && !v.isPending).reduce((sum, v) => sum + v.amount, 0);
  // Dedicated calculation for Advance Given to vendors
  const totalAdvanceGiven = expenses.reduce((sum, e) => sum + (e.advanceAmount ?? e.amount), 0);
  const balanceAfterAdvance = totalCollected - totalAdvanceGiven;

  const totalPendingExpenses = expenses.reduce((sum, e) => sum + (e.remainingAmount || 0), 0);
  const totalPendingVarganis = varganis.filter(v => v.isPending).reduce((sum, v) => sum + v.amount, 0);
  const totalCommittedExpenses = expenses.reduce((sum, e) => sum + (e.totalAmount || ((e.advanceAmount ?? e.amount) + (e.remainingAmount || 0))), 0);

  const volunteerTotals = varganis.filter(v => !v.isPending).reduce((acc, v) => {
    acc[v.volunteerName] = (acc[v.volunteerName] || 0) + v.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const leaderboard = Object.entries(volunteerTotals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto bg-gray-50">
       <div className="grid grid-cols-2 gap-3">
         {/* Main Net In-Hand Card - Only Vargani Collected Amount */}
         <div className="col-span-2 bg-[#800000] p-5 rounded-xl border border-red-900 shadow-md text-white text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
           <p className="text-[10px] opacity-80 mb-1 uppercase tracking-wider">{t('netInHandVargani', lang)}</p>
           <p className="text-4xl font-black">{formatCurrency(totalCollected)}</p>
           <p className="text-[10px] opacity-75 mt-1">{lang === 'mr' ? '(एकूण जमा झालेली वर्गणी रक्कम)' : '(Total Vargani Collected in Hand)'}</p>
         </div>

         {/* Separate Dedicated Card for Advance Given */}
         <div className="col-span-2 bg-gradient-to-r from-orange-500 to-amber-600 p-4 rounded-xl border border-orange-600 shadow-sm text-white flex items-center justify-between">
           <div>
             <p className="text-[10px] uppercase font-bold opacity-90">{t('advanceGiven', lang)}</p>
             <p className="text-2xl font-black">{formatCurrency(totalAdvanceGiven)}</p>
             <p className="text-[9px] opacity-85">{lang === 'mr' ? '(कंत्राटदारांना खर्चासाठी दिलेली आगाऊ रक्कम)' : '(Total Advance Paid for Expenses)'}</p>
           </div>
           <div className="bg-white/20 p-2.5 rounded-full">
             <MinusCircle size={24} className="text-white" />
           </div>
         </div>

         <div className="bg-white p-3 rounded-xl border border-red-100 bg-red-50/40 text-center">
           <p className="text-[10px] text-red-800 font-bold mb-0.5 uppercase">{t('pendingPayable', lang)}</p>
           <p className="text-base font-black text-red-600">{formatCurrency(totalPendingExpenses)}</p>
           <p className="text-[8px] text-gray-500">{lang === 'mr' ? 'कंत्राटदारांना द्यायची बाकी' : 'Due to Vendors'}</p>
         </div>
         <div className="bg-white p-3 rounded-xl border border-amber-100 bg-amber-50/40 text-center">
           <p className="text-[10px] text-amber-800 font-bold mb-0.5 uppercase">{t('pendingReceivable', lang)}</p>
           <p className="text-base font-black text-amber-700">{formatCurrency(totalPendingVarganis)}</p>
           <p className="text-[8px] text-gray-500">{lang === 'mr' ? 'येणे बाकी देणग्या' : 'Pending Donations'}</p>
         </div>
       </div>

       {/* Overall Budget & Cash Breakdown Overview */}
       <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-xs space-y-2">
         <h3 className="font-bold text-[#800000] border-b pb-1 text-[11px] uppercase tracking-wider">
           {lang === 'mr' ? 'एकूण हिशोब व रोख सारांश' : 'Financial Summary'}
         </h3>
         <div className="flex justify-between text-gray-600">
           <span>{lang === 'mr' ? 'एकूण जमा वर्गणी (Vargani Collected):' : 'Total Vargani Collected:'}</span>
           <span className="font-bold text-green-700">{formatCurrency(totalCollected)}</span>
         </div>
         <div className="flex justify-between text-gray-600">
           <span>{lang === 'mr' ? 'कंत्राटदारांना दिलेली आगाऊ रक्कम:' : 'Advance Paid to Vendors:'}</span>
           <span className="font-bold text-orange-600">{formatCurrency(totalAdvanceGiven)}</span>
         </div>
         <div className="flex justify-between text-gray-600 bg-gray-50 p-1.5 rounded">
           <span>{lang === 'mr' ? 'आगाऊ खर्च वजा जाता शिल्लक रोख:' : 'Cash Left after Advance:'}</span>
           <span className="font-bold text-gray-900">{formatCurrency(balanceAfterAdvance)}</span>
         </div>
         <div className="flex justify-between text-gray-600 border-t pt-1.5">
           <span>{lang === 'mr' ? 'एकूण अंदाजित खर्च (Total Budgeted):' : 'Total Budgeted Expense:'}</span>
           <span className="font-bold text-gray-800">{formatCurrency(totalCommittedExpenses)}</span>
         </div>
         <div className="flex justify-between text-gray-600 font-bold">
           <span>{lang === 'mr' ? 'देणे बाकी रक्कम (Pending Dues):' : 'Pending Dues to Pay:'}</span>
           <span className="text-red-700">{formatCurrency(totalPendingExpenses)}</span>
         </div>
       </div>

       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
          <h2 className="text-xs font-bold text-[#800000] uppercase mb-3 flex justify-between border-b pb-2">{t('leaderboard', lang)}</h2>
          <div className="space-y-1">
            {leaderboard.map(([name, amount], idx) => (
              <div key={name} className="flex justify-between items-center text-xs p-2.5 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#800000] flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                  <span className="font-bold text-gray-800">{name}</span>
                </div>
                <span className="font-black text-green-700">{formatCurrency(amount)}</span>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="text-gray-400 text-xs text-center py-6">{t('noData', lang)}</p>}
          </div>
       </div>
    </div>
  )
}

function VarganiForm({ onSave, onCancel, lang }: { onSave: (v: Vargani) => void, onCancel: () => void, lang: Lang }) {
  const [formData, setFormData] = useState({
    titlePrefix: 'Shri' as 'Shri' | 'Shrimati' | 'Kum' | 'Ms',
    donorName: '', mobile: '', address: '', amount: '',
    paymentMode: 'Cash' as 'Cash'|'UPI'|'Cheque', volunteerName: '',
    isGoods: false, isPending: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.donorName || !formData.amount || !formData.volunteerName) return;
    const nextNo = await getNextReceiptNo();
    onSave({
      id: Date.now().toString(),
      receiptNo: nextNo,
      date: format(new Date(), 'dd/MM/yyyy'),
      ...formData,
      amount: Number(formData.amount)
    });
  };

  return (
    <div className="p-4">
      <div className="bg-white border-2 border-[#FF9933] rounded-xl shadow-xl flex flex-col overflow-hidden relative p-5">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#FF9933] opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #FF9933 10px, #FF9933 20px)' }}></div>
        <div className="text-center mb-5">
          <h3 className="text-[#800000] font-serif text-xl font-black">E-Receipt</h3>
          <p className="text-[9px] uppercase tracking-[2px] text-gray-500 font-bold">{t('newVargani', lang)}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[#800000] mb-1">{t('donorName', lang)}</label>
            <div className="flex gap-2">
              <select value={formData.titlePrefix} onChange={e => setFormData({...formData, titlePrefix: e.target.value as any})} className="w-1/3 border rounded p-2 text-xs bg-gray-50 font-bold outline-none focus:border-[#FF9933]">
                <option value="Shri">{lang === 'mr' ? 'श्री.' : 'Shri.'}</option>
                <option value="Shrimati">{lang === 'mr' ? 'श्रीमती' : 'Smt.'}</option>
                <option value="Kum">{lang === 'mr' ? 'कु.' : 'Kum.'}</option>
                <option value="Ms">{lang === 'mr' ? 'मेसर्स' : 'M/s.'}</option>
              </select>
              <input required type="text" value={formData.donorName} onChange={e => setFormData({...formData, donorName: e.target.value})} className="w-2/3 border rounded p-2 text-xs bg-gray-50 font-bold outline-none focus:border-[#FF9933]" placeholder="" />
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[#800000] mb-1">{t('mobile', lang)}</label>
            <input type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full border rounded p-2 text-xs outline-none focus:border-[#FF9933]" placeholder="" />
          </div>
          
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[#800000] mb-1">{t('address', lang)}</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border rounded p-2 text-xs outline-none focus:border-[#FF9933]" placeholder={lang === 'mr' ? 'उदा. रविवार पेठ, सातारा' : 'e.g. Raviwar Peth, Satara'} />
          </div>
          
          <div className="col-span-2 flex items-center gap-3 p-2 bg-orange-50 border border-orange-100 rounded mt-1">
             <input type="checkbox" id="isGoods" checked={formData.isGoods} onChange={e => setFormData({...formData, isGoods: e.target.checked})} className="accent-[#FF9933] w-4 h-4" />
             <label htmlFor="isGoods" className="text-[10px] font-bold text-[#800000] leading-none">{t('isGoods', lang)}</label>
          </div>
          
          <div className="relative col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-[#800000] mb-1">{t('amount', lang)}</label>
            <div className="flex items-center">
              <span className="absolute left-3 text-gray-400 font-bold">₹</span>
              <input required type="number" min="1" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border rounded p-2 pl-7 text-sm font-black text-[#800000] outline-none focus:border-[#FF9933]" placeholder="501" />
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-[#800000] mb-1">{t('paymentMode', lang)}</label>
            <select value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value as any})} className="w-full border rounded p-2 text-xs bg-gray-50 outline-none focus:border-[#FF9933]">
              <option value="Cash">{t('cash', lang)}</option>
              <option value="UPI">{t('upi', lang)}</option>
              <option value="Cheque">{t('cheque', lang)}</option>
            </select>
          </div>
          
          <div className="col-span-2 flex items-center gap-3 p-2 bg-red-50 border border-red-100 rounded mt-1">
             <input type="checkbox" id="isPending" checked={formData.isPending} onChange={e => setFormData({...formData, isPending: e.target.checked})} className="accent-red-600 w-4 h-4" />
             <label htmlFor="isPending" className="text-[10px] font-bold text-red-800 leading-none">{t('isPending', lang)}</label>
          </div>

          <div className="col-span-2 mt-2">
            <label className="block text-[10px] font-bold text-[#800000] mb-1">{t('volunteerName', lang)}</label>
            <input required type="text" value={formData.volunteerName} onChange={e => setFormData({...formData, volunteerName: e.target.value})} className="w-full border rounded p-2 text-xs outline-none focus:border-[#FF9933]" placeholder="" />
          </div>

          <div className="col-span-2 pt-4 flex gap-2">
            <button type="button" onClick={onCancel} className="w-1/3 py-3 border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition">{t('cancel', lang)}</button>
            <button type="submit" className="w-2/3 py-3 bg-[#FF9933] text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition shadow-md">{t('generateReceipt', lang)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExpenseForm({ onSave, onCancel, lang }: { onSave: (e: Expense) => void, onCancel: () => void, lang: Lang }) {
  const categories = ["Idol", "Mandap & Lighting", "Sound", "Prasad", "Procession", "Decoration", "Other"];
  const translatedCategories: Record<string, string> = {
    "Idol": "मूर्ती", 
    "Mandap & Lighting": "मंडप आणि रोषणाई", 
    "Sound": "ध्वनी / डीजे", 
    "Prasad": "प्रसाद", 
    "Procession": "मिरवणूक", 
    "Decoration": "सजावट / देखावा",
    "Other": "इतर"
  };

  const [formData, setFormData] = useState({ 
    title: '', 
    category: categories[0], 
    advanceAmount: '', 
    remainingAmount: '', 
    notes: '' 
  });

  const advanceNum = Number(formData.advanceAmount || 0);
  const remainingNum = Number(formData.remainingAmount || 0);
  const totalCalculated = advanceNum + remainingNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || (!formData.advanceAmount && !formData.remainingAmount)) return;
    
    onSave({
      id: Date.now().toString(),
      date: format(new Date(), 'dd/MM/yyyy'),
      title: formData.title,
      category: formData.category,
      amount: advanceNum, // actual amount spent from treasury right now
      advanceAmount: advanceNum,
      remainingAmount: remainingNum,
      totalAmount: totalCalculated,
      notes: formData.notes
    });
  };

  return (
    <div className="p-4">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md">
        <div className="border-b pb-3 mb-4">
          <h2 className="text-sm font-black text-[#800000] uppercase">{t('newExpense', lang)}</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {lang === 'mr' ? 'आगाऊ दिलेली रक्कम आणि शिल्लक बाकी नोंदवा.' : 'Record advance paid and any pending balance to vendor.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold block text-gray-700 mb-1">{t('expenseTitle', lang)}</label>
            <input 
              required 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full border rounded-lg p-2.5 text-xs outline-none focus:border-[#800000]" 
              placeholder={lang === 'mr' ? 'उदा. मांडव काम, डीजे ॲडव्हान्स, इत्यादी' : 'e.g. Mandap Setup, Sound advance'} 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold block text-gray-700 mb-1">{t('category', lang)}</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              className="w-full border rounded-lg p-2 text-xs outline-none focus:border-[#800000] bg-gray-50"
            >
              {categories.map(c => <option key={c} value={c}>{lang === 'mr' ? translatedCategories[c] : c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold block text-[#800000] mb-1">
                {t('advanceAmount', lang)}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-gray-400 font-bold text-xs">₹</span>
                <input 
                  required 
                  type="number" 
                  min="0" 
                  value={formData.advanceAmount} 
                  onChange={e => setFormData({...formData, advanceAmount: e.target.value})} 
                  className="w-full border-2 border-red-200 focus:border-[#800000] rounded-lg p-2 pl-6 text-xs font-black text-red-600 outline-none" 
                  placeholder="2000" 
                />
              </div>
              <p className="text-[9px] text-gray-400 mt-0.5">{lang === 'mr' ? 'आता रोख दिलेली रक्कम' : 'Cash paid now'}</p>
            </div>

            <div>
              <label className="text-[10px] font-bold block text-amber-800 mb-1">
                {t('remainingAmount', lang)}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-gray-400 font-bold text-xs">₹</span>
                <input 
                  type="number" 
                  min="0" 
                  value={formData.remainingAmount} 
                  onChange={e => setFormData({...formData, remainingAmount: e.target.value})} 
                  className="w-full border-2 border-amber-200 focus:border-amber-500 rounded-lg p-2 pl-6 text-xs font-black text-amber-800 outline-none" 
                  placeholder="5000" 
                />
              </div>
              <p className="text-[9px] text-gray-400 mt-0.5">{lang === 'mr' ? 'नंतर द्यायची बाकी (Pending)' : 'Remaining to pay'}</p>
            </div>
          </div>

          {/* Real-time Calculation Summary Badge */}
          {(advanceNum > 0 || remainingNum > 0) && (
            <div className={`p-3 rounded-lg border text-xs ${remainingNum > 0 ? 'bg-amber-50/80 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex justify-between items-center font-bold">
                <span className="text-gray-700">{lang === 'mr' ? 'एकूण ठरलेला खर्च (Total Bill):' : 'Total Expense / Bill:'}</span>
                <span className="text-sm font-black text-gray-900">{formatCurrency(totalCalculated)}</span>
              </div>
              {remainingNum > 0 ? (
                <div className="mt-1 text-[10px] text-amber-800 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} className="text-amber-600 flex-shrink-0" />
                  <span>
                    {lang === 'mr' 
                      ? `दिलेले ₹${toMarathiDigits(advanceNum)} आणि बाकी ₹${toMarathiDigits(remainingNum)} हे "प्रलंबित (Pending)" मध्ये दिसेल.` 
                      : `Paid ₹${advanceNum} and remaining ₹${remainingNum} will be tracked under "Pending".`}
                  </span>
                </div>
              ) : (
                <div className="mt-1 text-[10px] text-green-700 flex items-center gap-1 font-medium">
                  <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
                  <span>{lang === 'mr' ? 'पूर्ण भरणा झाला आहे (No pending balance).' : 'Full payment done.'}</span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold block text-gray-600 mb-1">{t('notes', lang)}</label>
            <input 
              type="text" 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
              className="w-full border rounded-lg p-2 text-xs outline-none focus:border-[#800000]" 
              placeholder={lang === 'mr' ? 'उदा. मोबाईल नं, पावती क्र., संपर्क इत्यादी' : 'e.g. Mobile no, bill receipt number'} 
            />
          </div>
          
          <div className="pt-2 flex gap-2">
            <button type="button" onClick={onCancel} className="w-1/3 py-3 border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition">{t('cancel', lang)}</button>
            <button type="submit" className="w-2/3 bg-[#800000] text-white py-3 rounded-lg text-xs font-bold hover:bg-red-900 transition shadow-md">{t('saveExpense', lang)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReceiptView({ receipt, onBack, lang }: { receipt: Vargani, onBack: () => void, lang: Lang }) {
  const [isSharing, setIsSharing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const getReceiptImage = async (): Promise<string | null> => {
    const el = document.getElementById('receipt-card');
    if (!el) return null;
    return await toPng(el, { pixelRatio: 2, skipFonts: true, cacheBust: false });
  };

  const saveImage = async () => {
    try {
      const dataUrl = await getReceiptImage();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.download = `Receipt_${receipt.receiptNo}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Receipt image downloaded!');
    } catch (err) {
      console.error('Error saving image:', err);
    }
  };

  const prefixMap: Record<string, string> = { Shri: 'श्री.', Shrimati: 'श्रीमती', Kum: 'कु.', Ms: 'मेसर्स' };
  const displayPrefix = receipt.titlePrefix ? prefixMap[receipt.titlePrefix] : 'श्री.';

  let paymentModeText = 'रोख स्वरुपात मिळाले.';
  if (receipt.paymentMode === 'UPI') paymentModeText = 'युपीआय (UPI) द्वारे मिळाले.';
  if (receipt.paymentMode === 'Cheque') paymentModeText = 'चेक द्वारे मिळाले.';

  const shareWhatsApp = async () => {
    const el = document.getElementById('receipt-card');
    if (!el) return;
    setIsSharing(true);
    
    // Fallback WhatsApp message in Marathi as the Pavti is now purely Marathi
    const shareText = `*शिवज्योत मंडळ*\n*देणगी पावती*\n---------------------------------\n*पावती क्र:* ${receipt.receiptNo}\n*देणगीदार:* ${displayPrefix} ${receipt.donorName}\n*रक्कम:* ₹${receipt.amount} (${numberToMarathiWords(receipt.amount)} रुपये फक्त)\n*पेमेंट मोड:* ${receipt.paymentMode === 'Cash' ? 'रोख' : receipt.paymentMode === 'UPI' ? 'युपीआय' : 'चेक'}\n*दिनांक:* ${toMarathiDigits(receipt.date)}\n---------------------------------\n_देणगीबद्दल धन्यवाद! 🙏_\n*॥ गणपती बाप्पा मोरया ॥*`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

    try {
      const blob = await toBlob(el, { pixelRatio: 2, skipFonts: true, cacheBust: false });
      let sharedViaNavigator = false;

      if (blob && navigator.canShare) {
        const file = new File([blob], `Receipt_${receipt.receiptNo}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Donation Receipt - ${receipt.receiptNo}`,
              text: shareText
            });
            sharedViaNavigator = true;
          } catch (shareErr: any) {
            if (shareErr.name === 'AbortError') {
              setIsSharing(false);
              return;
            }
            console.warn('Native share failed or gesture lost, falling back to WhatsApp link:', shareErr);
          }
        }
      }

      if (!sharedViaNavigator) {
        await saveImage();
        showToast('Receipt saved! Opening WhatsApp...');
        window.open(waUrl, '_blank');
      }
    } catch (err) {
      console.error('Share process error:', err);
      window.open(waUrl, '_blank');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col bg-gray-50 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#800000] text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-1.5 z-50 animate-bounce">
          <Check size={14} className="text-[#FF9933]" />
          {toastMsg}
        </div>
      )}

      {/* 
        NEW TRADITIONAL MARATHI RECEIPT DESIGN 
        This part remains rigidly in Marathi regardless of `lang` 
      */}
      <div id="receipt-card" className="bg-[#FFF9F0] p-4 relative font-sans mx-auto w-full max-w-sm border-[3px] border-[#800000] rounded-sm" style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
        
        {/* Inner Decorative Border */}
        <div className="border border-[#FF9933] p-4 relative h-full">
            {/* Corner acccents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#800000]"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#800000]"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#800000]"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#800000]"></div>

            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none text-[#800000] text-[150px] font-black">ॐ</div>

            <div className="text-center text-[#800000] mb-5 relative z-10">
              <p className="text-[12px] font-black tracking-[0.2em] mb-3 opacity-90 flex justify-center items-center gap-2">
                <span className="text-[#FF9933] text-[14px]">❁</span> ॥ श्री गणेशाय नमः ॥ <span className="text-[#FF9933] text-[14px]">❁</span>
              </p>
              <h1 className="text-2xl font-black leading-tight tracking-tight mt-1" style={{ textShadow: '1px 1px 0px rgba(255,153,51,0.2)' }}>शिवज्योत गणेशोत्सव मंडळ, सातारा </h1>
              <h2 className="text-[11px] font-bold mt-1.5 opacity-80 uppercase tracking-widest text-[#FF9933]">सार्वजनिक गणेशोत्सव २०२६ • वर्ष २८</h2>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4 relative z-10">
              <div className="h-[1px] w-12 bg-[#FF9933] opacity-50"></div>
              <span className="font-bold text-xs tracking-widest text-[#800000] bg-white px-3 py-1 border border-[#FF9933] rounded-full shadow-sm">देणगी पावती</span>
              <div className="h-[1px] w-12 bg-[#FF9933] opacity-50"></div>
            </div>

            <div className="flex justify-between text-[11px] font-bold mb-5 text-[#800000] border-b border-dashed border-[#FF9933] pb-2 relative z-10">
              <p>पावती क्र. <span className="font-black text-xs ml-1">{receipt.receiptNo}</span></p>
              <p>दिनांक: <span className="ml-1">{toMarathiDigits(receipt.date)}</span></p>
            </div>

            <div className="text-left space-y-4 mb-6 text-sm text-[#800000] relative z-10">
              <p className="font-bold leading-relaxed flex flex-wrap items-end gap-1">
                {displayPrefix}
                <span className="flex-1 min-w-[150px] border-b-[1.5px] border-[#800000] border-dotted px-2 text-[13px] font-black italic">{receipt.donorName}</span>
                यांजकडून,
              </p>
              {receipt.address && (
                <p className="font-bold leading-relaxed flex flex-wrap items-end gap-1">
                  पत्ता:
                  <span className="flex-1 min-w-[150px] border-b-[1.5px] border-[#800000] border-dotted px-2 text-[13px] font-black italic">{receipt.address}</span>
                </p>
              )}
              <p className="font-bold leading-relaxed flex flex-wrap items-end gap-1">
                अक्षरी 
                <span className="flex-1 min-w-[150px] border-b-[1.5px] border-[#800000] border-dotted px-2 text-sm font-black italic">
                  {numberToMarathiWords(receipt.amount)} रुपये फक्त
                </span>
                {paymentModeText}
              </p>
            </div>

            <div className="flex justify-center items-end mt-8 mb-4 relative z-10">
                <div className="border-[3px] border-[#800000] bg-white px-6 py-3 shadow-[2px_2px_0px_#FF9933]">
                  <span className="text-3xl font-black text-[#800000]">₹ {toMarathiDigits(receipt.amount)} /-</span>
                </div>
            </div>
            
            <p className="text-[9px] font-medium text-center text-[#800000] opacity-70 mt-6 mb-1 relative z-10">
              (सदर देणगी {receipt.paymentMode === 'Cash' ? 'रोख' : receipt.paymentMode === 'UPI' ? 'युपीआय' : 'चेक'} स्वरुपात जमा झाली आहे.)
            </p>
        </div>
      </div>
      
      <div className="flex gap-3 mt-8 w-full max-w-sm mx-auto flex-none">
        <button onClick={saveImage} className="flex-1 bg-white border-2 border-gray-200 text-gray-800 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-sm text-xs font-bold">
          <Download size={16} /> Save
        </button>
        <button onClick={shareWhatsApp} disabled={isSharing} className={`flex-1 ${isSharing ? 'bg-gray-400' : 'bg-[#25D366] hover:bg-[#20bd5a]'} text-white py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg text-xs font-bold`}>
          <Share2 size={16} /> {isSharing ? 'Preparing...' : 'WhatsApp'}
        </button>
      </div>
    </div>
  );
}

function LoginView({ onLogin, lang, setLang }: { onLogin: () => Promise<void>, lang: Lang, setLang: (l: Lang) => void }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (id.toLowerCase() === 'shivjyot' && password === 'bappa') {
      setLoading(true);
      try {
        await onLogin();
      } catch (err: any) {
        if (err?.code === 'auth/admin-restricted-operation') {
          setError(lang === 'mr' ? 'Firebase मधील Anonymous Auth सुरु करा.' : 'Please enable Anonymous Auth in Firebase Console.');
        } else {
          setError(lang === 'mr' ? 'लॉगिन अयशस्वी. कृपया पुन्हा प्रयत्न करा.' : 'Login failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError(lang === 'mr' ? 'चुकीचा आयडी किंवा पासवर्ड' : 'Invalid ID or Password');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#FAF9F6] font-sans text-[#1A1A1A] justify-center items-center relative overflow-hidden">
      <div className="absolute top-0 w-full h-40 bg-[#800000] rounded-b-[50px] flex justify-center pt-8 border-b-4 border-[#FF9933] shadow-lg z-0">
        <div className="flex flex-col items-center">
          <div className="bg-[#FF9933] p-1.5 rounded-full mb-1">
             <div className="w-12 h-12 flex items-center justify-center font-bold text-[#800000] text-3xl">ॐ</div>
           </div>
           <p className="text-white text-[10px] tracking-widest opacity-90 uppercase">|| गणपती बाप्पा मोरया ||</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 z-10 w-11/12 max-w-sm mt-20 relative">
        <h2 className="text-xl font-black text-[#800000] mb-1 text-center">{t('loginTitle', lang)}</h2>
        <p className="text-center text-xs text-gray-500 mb-6">{t('mandalName', lang)}</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-[11px] p-2.5 rounded-lg mb-4 text-center font-bold flex flex-col items-center justify-center gap-1.5 border border-red-200">
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} />
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold block text-gray-700 mb-1">{t('loginId', lang)}</label>
            <input 
              type="text" 
              required
              value={id} 
              onChange={e => {setId(e.target.value); setError('');}} 
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#800000] transition bg-gray-50" 
              placeholder="e.g. shivjyot" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold block text-gray-700 mb-1">{t('password', lang)}</label>
            <input 
              type="password" 
              required
              value={password} 
              onChange={e => {setPassword(e.target.value); setError('');}} 
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#800000] transition bg-gray-50" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#800000] text-white py-3 rounded-xl text-sm font-bold hover:bg-red-900 transition shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (lang === 'mr' ? 'प्रतिक्षा करा...' : 'Loading...') : t('loginBtn', lang)}
          </button>
        </form>

        <p className="text-[9px] text-gray-400 text-center mt-6">
          Authorized personnel only. Not for public access.
        </p>
      </div>
    </div>
  );
}
