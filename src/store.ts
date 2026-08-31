import { Vargani, Expense } from './types';
import { db } from './lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, runTransaction } from 'firebase/firestore';

export const subscribeToVarganis = (callback: (data: Vargani[]) => void) => {
  return onSnapshot(collection(db, 'varganis'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vargani));
    callback(data);
  });
};

export const subscribeToExpenses = (callback: (data: Expense[]) => void) => {
  return onSnapshot(collection(db, 'expenses'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    callback(data);
  });
};

export const saveVargani = async (v: Vargani) => {
  await setDoc(doc(db, 'varganis', v.id), v);
};

export const updateVargani = async (v: Vargani) => {
  await updateDoc(doc(db, 'varganis', v.id), { ...v });
};

export const deleteVargani = async (id: string) => {
  await deleteDoc(doc(db, 'varganis', id));
};

export const saveExpense = async (e: Expense) => {
  await setDoc(doc(db, 'expenses', e.id), e);
};

export const updateExpense = async (e: Expense) => {
  await updateDoc(doc(db, 'expenses', e.id), { ...e });
};

export const deleteExpense = async (id: string) => {
  await deleteDoc(doc(db, 'expenses', id));
};

export const getNextReceiptNo = async (): Promise<string> => {
  const counterRef = doc(db, 'metadata', 'counter');
  let newNo = 1;
  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(counterRef);
      if (!sfDoc.exists()) {
        transaction.set(counterRef, { receiptNo: 1 });
        newNo = 1;
      } else {
        newNo = sfDoc.data().receiptNo + 1;
        transaction.update(counterRef, { receiptNo: newNo });
      }
    });
  } catch (e) {
    console.error("Transaction failed: ", e);
    newNo = Math.floor(Math.random() * 10000);
  }
  return `MB-1-${newNo.toString().padStart(4, '0')}`;
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
