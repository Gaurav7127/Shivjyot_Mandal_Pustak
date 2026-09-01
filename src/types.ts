export interface Vargani {
  id: string;
  receiptNo: string;
  date: string;
  titlePrefix?: 'Shri' | 'Shrimati' | 'Kum' | 'Ms';
  donorName: string;
  mobile: string;
  address: string;
  isMemberVargani?: boolean;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Cheque';
  volunteerName: string;
  isGoods?: boolean;
  isPending?: boolean;
}

export interface ExpensePayment {
  id: string;
  amount: number;
  paidBy: string;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  title: string;
  category: string;
  amount: number; // actual amount paid/spent (advance)
  advanceAmount?: number;
  remainingAmount?: number;
  totalAmount?: number;
  notes: string;
  file?: string;
  payments?: ExpensePayment[];
}

export interface DashboardStats {
  totalCollected: number;
  totalExpenses: number;
  netBalance: number;
}
