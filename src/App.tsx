import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Download, Share2, ArrowLeft, Home, List, PieChart, Trash2, X, Check, Globe } from 'lucide-react';
import { getVarganis, getExpenses, saveVargani, saveExpense, deleteVargani, deleteExpense, getNextReceiptNo, formatCurrency, numberToEnglishWords, numberToMarathiWords, toMarathiDigits } from './store';
import { Vargani, Expense } from './types';
import { format } from 'date-fns';
import { toBlob, toPng } from 'html-to-image';

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
  totalCollected: { en: 'Total Collected', mr: 'एकूण जमा' },
  totalSpent: { en: 'Total Spent', mr: 'एकूण खर्च' },
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
  newExpense: { en: 'New Expense', mr: 'नवीन खर्च' },
  expenseTitle: { en: 'Expense Title *', mr: 'खर्चाचे नाव *' },
  category: { en: 'Category', mr: 'वर्ग' },
  notes: { en: 'Notes', mr: 'नोंदी' },
  saveExpense: { en: 'Add Expense', mr: 'खर्च जोडा' },
  deleteTitle: { en: 'Delete Entry', mr: 'नोंद हटवा' },
  deleteConfirm: { en: 'Are you sure? This will be permanently deleted and cannot be undone.', mr: 'तुम्हाला खात्री आहे का? हा डेटा कायमचा हटवला जाईल.' },
  yesDelete: { en: 'Yes, Delete', mr: 'होय, हटवा' },
};

const t = (key: keyof typeof translations, lang: Lang) => translations[key][lang];

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [varganis, setVarganis] = useState<Vargani[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Vargani | null>(null);
  const [lang, setLang] = useState<Lang>('mr');
  
  // Custom Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'vargani' | 'expense', id: string } | null>(null);

  useEffect(() => {
    setVarganis(getVarganis());
    setExpenses(getExpenses());
  }, []);

  const navigateTo = (view: View) => setCurrentView(view);

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'vargani') {
      deleteVargani(deleteConfirm.id);
      setVarganis(getVarganis());
    } else {
      deleteExpense(deleteConfirm.id);
      setExpenses(getExpenses());
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAF9F6] font-sans text-[#1A1A1A] overflow-hidden relative">
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
             onClick={() => setLang(lang === 'mr' ? 'en' : 'mr')}
             className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition text-xs font-bold border border-white/20"
           >
             <Globe size={14} />
             {lang === 'mr' ? 'EN' : 'मराठी'}
           </button>
        </div>
      </header>

      {/* Main Container - Mobile Centric Layout */}
      <main className="flex-1 overflow-hidden flex flex-col relative w-full max-w-md mx-auto bg-white shadow-xl border-x border-gray-100">
        <div className="flex-1 overflow-y-auto relative">
          {currentView === 'home' && <HomeView navigateTo={navigateTo} lang={lang} />}
          {currentView === 'entries' && <EntriesView varganis={varganis} expenses={expenses} onDelete={(type, id) => setDeleteConfirm({ type, id })} onViewReceipt={(v) => { setSelectedReceipt(v); navigateTo('receipt'); }} lang={lang} />}
          {currentView === 'reports' && <ReportsView varganis={varganis} expenses={expenses} lang={lang} />}
          {currentView === 'vargani_form' && (
            <VarganiForm 
              onSave={(v) => { saveVargani(v); setVarganis(getVarganis()); setSelectedReceipt(v); navigateTo('receipt'); }}
              onCancel={() => navigateTo('home')}
              lang={lang}
            />
          )}
          {currentView === 'expense_form' && (
            <ExpenseForm 
              onSave={(e) => { saveExpense(e); setExpenses(getExpenses()); navigateTo('home'); }}
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
          <nav className="flex-none bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-20">
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

function EntriesView({ varganis, expenses, onDelete, onViewReceipt, lang }: { varganis: Vargani[], expenses: Expense[], onDelete: (type: 'vargani'|'expense', id: string)=>void, onViewReceipt: (v: Vargani)=>void, lang: Lang }) {
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
  else if (activeTab === 'Pending') displayItems = allItems.filter(i => i._type === 'vargani' && i.isPending);

  return (
    <div className="flex flex-col h-full bg-gray-50">
       {/* Tabs Horizontal Scroll */}
       <div className="flex overflow-x-auto gap-2 p-3 bg-white border-b flex-none no-scrollbar shadow-sm">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors border ${activeTab === tab ? 'bg-[#800000] text-white border-[#800000]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {t(tabKeys[tab], lang)}
            </button>
          ))}
       </div>
       {/* List */}
       <div className="flex-1 overflow-y-auto p-3 space-y-2">
         {displayItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 opacity-50">
               <List size={40} className="mb-2 text-gray-400" />
               <p className="text-center text-gray-500 text-xs">{t('noEntries', lang)}</p>
            </div>
         )}
         {displayItems.map(item => (
           <div key={item.id} onClick={() => item._type === 'vargani' && onViewReceipt(item as any)} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center cursor-pointer hover:border-[#FF9933] transition">
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{item._type === 'vargani' ? (item as Vargani).donorName : (item as Expense).title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {item.date} • {item._type === 'vargani' ? `MB ${((item as Vargani).receiptNo || '').split('-').pop()}` : (item as Expense).category} 
                  {(item as Vargani).isGoods && <span className="ml-1 text-[#FF9933] font-bold bg-orange-50 px-1 py-0.5 rounded">{t('goods', lang)}</span>}
                  {(item as Vargani).isPending && <span className="ml-1 text-red-500 font-bold bg-red-50 px-1 py-0.5 rounded">{t('pending', lang)}</span>}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-2">
                <span className={`text-sm font-black tracking-tight ${item._type === 'vargani' ? 'text-green-600' : 'text-red-600'}`}>
                  {item._type === 'vargani' ? '+' : '-'}{formatCurrency(item.amount)}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onDelete(item._type, item.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                   <Trash2 size={16} />
                </button>
              </div>
           </div>
         ))}
       </div>
    </div>
  )
}

function ReportsView({ varganis, expenses, lang }: { varganis: Vargani[], expenses: Expense[], lang: Lang }) {
  const totalCollected = varganis.filter(v => !v.isGoods && !v.isPending).reduce((sum, v) => sum + v.amount, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const inHand = totalCollected - totalSpent;

  const volunteerTotals = varganis.filter(v => !v.isPending).reduce((acc, v) => {
    acc[v.volunteerName] = (acc[v.volunteerName] || 0) + v.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const leaderboard = Object.entries(volunteerTotals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto bg-gray-50">
       <div className="grid grid-cols-2 gap-3">
         <div className="col-span-2 bg-[#800000] p-6 rounded-xl border border-red-900 shadow-md text-white text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
           <p className="text-[10px] opacity-80 mb-1 uppercase tracking-wider">{t('netBalance', lang)}</p>
           <p className="text-4xl font-black">{formatCurrency(inHand)}</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
           <p className="text-[10px] text-green-800 font-bold mb-1 uppercase">{t('totalCollected', lang)}</p>
           <p className="text-lg font-black text-green-600">{formatCurrency(totalCollected)}</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
           <p className="text-[10px] text-red-800 font-bold mb-1 uppercase">{t('totalSpent', lang)}</p>
           <p className="text-lg font-black text-red-600">{formatCurrency(totalSpent)}</p>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.donorName || !formData.amount || !formData.volunteerName) return;
    onSave({
      id: Date.now().toString(),
      receiptNo: getNextReceiptNo(),
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
  const categories = ["Idol", "Mandap & Lighting", "Sound", "Prasad", "Procession", "Other"];
  const translatedCategories: Record<string, string> = {
    "Idol": "मूर्ती", "Mandap & Lighting": "मंडप आणि रोषणाई", "Sound": "ध्वनी / डीजे", "Prasad": "प्रसाद", "Procession": "मिरवणूक", "Other": "इतर"
  };
  const [formData, setFormData] = useState({ title: '', category: categories[0], amount: '', notes: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    onSave({
      id: Date.now().toString(),
      date: format(new Date(), 'dd/MM/yyyy'),
      ...formData,
      amount: Number(formData.amount)
    });
  };

  return (
    <div className="p-4">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-sm font-black text-[#800000] uppercase mb-4 border-b pb-2">{t('newExpense', lang)}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold block text-gray-600 mb-1">{t('expenseTitle', lang)}</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded p-2 text-xs outline-none focus:border-[#800000]" placeholder="" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold block text-gray-600 mb-1">{t('category', lang)}</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded p-2 text-xs outline-none focus:border-[#800000]">
                {categories.map(c => <option key={c} value={c}>{lang === 'mr' ? translatedCategories[c] : c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold block text-gray-600 mb-1">{t('amount', lang)}</label>
              <input required type="number" min="1" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border rounded p-2 text-xs font-bold text-red-600 outline-none focus:border-[#800000]" placeholder="5000" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold block text-gray-600 mb-1">{t('notes', lang)}</label>
            <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border rounded p-2 text-xs outline-none focus:border-[#800000]" placeholder="" />
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
