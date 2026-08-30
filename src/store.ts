import { Vargani, Expense } from './types';

const VARGANI_KEY = 'mandalbook_vargani';
const EXPENSE_KEY = 'mandalbook_expense';

export const getVarganis = (): Vargani[] => {
  const data = localStorage.getItem(VARGANI_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveVargani = (v: Vargani) => {
  const data = getVarganis();
  data.push(v);
  localStorage.setItem(VARGANI_KEY, JSON.stringify(data));
};

export const deleteVargani = (id: string) => {
  const data = getVarganis().filter(v => v.id !== id);
  localStorage.setItem(VARGANI_KEY, JSON.stringify(data));
};

export const getExpenses = (): Expense[] => {
  const data = localStorage.getItem(EXPENSE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveExpense = (e: Expense) => {
  const data = getExpenses();
  data.push(e);
  localStorage.setItem(EXPENSE_KEY, JSON.stringify(data));
};

export const deleteExpense = (id: string) => {
  const data = getExpenses().filter(e => e.id !== id);
  localStorage.setItem(EXPENSE_KEY, JSON.stringify(data));
};

export const getNextReceiptNo = (): string => {
  const year = new Date().getFullYear();
  const varganis = getVarganis();
  const currentYearVarganis = varganis.filter(v => v.receiptNo.startsWith(`MB-1-`));
  const count = currentYearVarganis.length + 1;
  return `MB-1-${count.toString().padStart(4, '0')}`;
};

const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

export function numberToEnglishWords(num: number): string {
    if (num === 0) return "Zero";
    
    let result = "";
    if (num >= 10000000) {
        result += numberToEnglishWords(Math.floor(num / 10000000)) + " Crore ";
        num %= 10000000;
    }
    if (num >= 100000) {
        result += numberToEnglishWords(Math.floor(num / 100000)) + " Lakh ";
        num %= 100000;
    }
    if (num >= 1000) {
        result += numberToEnglishWords(Math.floor(num / 1000)) + " Thousand ";
        num %= 1000;
    }
    if (num >= 100) {
        result += numberToEnglishWords(Math.floor(num / 100)) + " Hundred ";
        num %= 100;
    }
    if (num > 0) {
        if (num < 20) {
            result += ones[num];
        } else {
            result += tens[Math.floor(num / 10)];
            if (num % 10 > 0) {
                result += " " + ones[num % 10];
            }
        }
    }
    return result.trim();
}

const marathiNumbers = [
  "शून्य", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ", "दहा",
  "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा", "अठरा", "एकोणीस", "वीस",
  "एकवीस", "बावीस", "तेवीस", "चोवीस", "पंचवीस", "सव्वीस", "सत्तावीस", "अठ्ठावीस", "एकोणतीस", "तीस",
  "एकतीस", "बत्तीस", "तेहतीस", "चौतीस", "पस्तीस", "छत्तीस", "सदतीस", "अडतीस", "एकोणचाळीस", "चाळीस",
  "एकेचाळीस", "बेचाळीस", "त्रेचाळीस", "चव्वेचाळीस", "पंचेचाळीस", "शेहेचाळीस", "सत्तेचाळीस", "अठ्ठेचाळीस", "एकोणपन्नास", "पन्नास",
  "एक्कावन्न", "बावन्न", "त्रेपन्न", "चोपन्न", "पंचावन्न", "छप्पन्न", "सत्तावन्न", "अठ्ठावन्न", "एकोणसाठ", "साठ",
  "एकसष्ट", "बासष्ट", "त्रेसष्ट", "चौसष्ट", "पासष्ट", "सहासष्ट", "सदुसष्ट", "अडसष्ट", "एकोणसत्तर", "सत्तर",
  "एक्काहत्तर", "बाहत्तर", "त्र्याहत्तर", "चौऱ्याहत्तर", "पंच्याहत्तर", "शहात्तर", "सत्त्याहत्तर", "अठ्ठ्याहत्तर", "एकोणऐंशी", "ऐंशी",
  "एक्क्याऐंशी", "ब्याऐंशी", "त्र्याऐंशी", "चौऱ्याऐंशी", "पंच्याऐंशी", "शहाऐंशी", "सत्त्याऐंशी", "अठ्ठ्याऐंशी", "एकोणनव्वद", "नव्वद",
  "एक्क्याण्णव", "ब्याण्णव", "त्र्याण्णव", "चौऱ्याण्णव", "पंच्याण्णव", "शहाण्णव", "सत्त्याण्णव", "अठ्ठ्याण्णव", "नव्व्याण्णव", "शंभर"
];

export function numberToMarathiWords(num: number): string {
    if (num === 0) return "शून्य";
    if (num <= 100) return marathiNumbers[num];
    
    let result = "";
    if (num >= 10000000) {
        result += numberToMarathiWords(Math.floor(num / 10000000)) + " कोटी ";
        num %= 10000000;
    }
    if (num >= 100000) {
        result += numberToMarathiWords(Math.floor(num / 100000)) + " लाख ";
        num %= 100000;
    }
    if (num >= 1000) {
        result += numberToMarathiWords(Math.floor(num / 1000)) + " हजार ";
        num %= 1000;
    }
    if (num >= 100) {
        const hundreds = Math.floor(num / 100);
        result += (hundreds === 1 ? "एकशे" : marathiNumbers[hundreds] + "शे") + " ";
        num %= 100;
    }
    if (num > 0) {
        result += marathiNumbers[num];
    }
    return result.trim();
}

export function toMarathiDigits(numStr: string | number): string {
  const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return numStr.toString().replace(/[0-9]/g, (match) => marathiDigits[parseInt(match)]);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
