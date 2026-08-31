const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace imports from store
code = code.replace(
  "import { getVarganis, getExpenses, saveVargani, saveExpense, updateVargani, updateExpense, deleteVargani, deleteExpense, getNextReceiptNo, formatCurrency, numberToEnglishWords, numberToMarathiWords, toMarathiDigits } from './store';",
  "import { subscribeToVarganis, subscribeToExpenses, saveVargani, saveExpense, updateVargani, updateExpense, deleteVargani, deleteExpense, getNextReceiptNo, formatCurrency, numberToEnglishWords, numberToMarathiWords, toMarathiDigits } from './store';\nimport { signInAnonymously } from 'firebase/auth';\nimport { auth } from './lib/firebase';"
);

// Add useEffect for subscribing
const useEffectPattern = /const \[deleteConfirm, setDeleteConfirm\] = useState[^\n]+;\n/;
code = code.replace(
  useEffectPattern,
  `const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'vargani' | 'expense', id: string } | null>(null);\n\n  useEffect(() => {\n    if (!isAuthenticated) return;\n    const unsubV = subscribeToVarganis(setVarganis);\n    const unsubE = subscribeToExpenses(setExpenses);\n    return () => {\n      unsubV();\n      unsubE();\n    };\n  }, [isAuthenticated]);\n\n`
);

// Remove explicit setVarganis(getVarganis())
code = code.replace(/setVarganis\(getVarganis\(\)\);/g, '');
code = code.replace(/setExpenses\(getExpenses\(\)\);/g, '');

// Update authentication logic
code = code.replace(
  /<LoginView onLogin=\{\(\) => \{ setIsAuthenticated\(true\); sessionStorage\.setItem\('mandal_auth', 'true'\); \}\} lang=\{lang\} setLang=\{handleSetLang\} \/>/,
  `<LoginView onLogin={async () => { await signInAnonymously(auth); setIsAuthenticated(true); sessionStorage.setItem('mandal_auth', 'true'); }} lang={lang} setLang={handleSetLang} />`
);

// In case the session is already active but Firebase isn't authenticated yet
const sessionCheck = `const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('mandal_auth') === 'true');`;
code = code.replace(
  sessionCheck,
  `const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('mandal_auth') === 'true');\n  useEffect(() => { if (isAuthenticated && !auth.currentUser) { signInAnonymously(auth).catch(console.error); } }, [isAuthenticated]);`
);

fs.writeFileSync('src/App.tsx', code);
