export interface Vargani {
  id: string;
  receiptNo: string;
  date: string;
  titlePrefix?: 'Shri' | 'Shrimati' | 'Kum' | 'Ms';
  donorName: string;
  mobile: string;
  address: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Cheque';
  volunteerName: string;
  isGoods?: boolean;
  isPending?: boolean;
}

export interface Expense {
  id: string;
  date: string;
  title: string;
  category: string;
  amount: number;
  notes: string;
  file?: string;
}

export interface DashboardStats {
  totalCollected: number;
  totalExpenses: number;
  netBalance: number;
}
