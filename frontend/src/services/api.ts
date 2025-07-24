import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Borrower {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Lender {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Loan {
  id: number;
  borrower_id: number;
  lender_id: number;
  principal: number;
  interest_rate: number;
  term_months: number;
  start_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  borrower?: Borrower;
  lender?: Lender;
}

export interface Payment {
  id: number;
  loan_id: number;
  amount: number;
  payment_date: string;
  notes: string;
  created_at: string;
}

export interface LoanReport {
  loan: Loan;
  total_paid: number;
  remaining_balance: number;
  monthly_payment: number;
  payments_count: number;
  last_payment_date?: string;
}

export const loanAPI = {
  // Borrowers
  async getBorrowers(): Promise<Borrower[]> {
    const response = await api.get('/borrowers');
    return response.data;
  },

  async createBorrower(borrower: Omit<Borrower, 'id'>): Promise<Borrower> {
    const response = await api.post('/borrowers', borrower);
    return response.data;
  },

  // Lenders
  async getLenders(): Promise<Lender[]> {
    const response = await api.get('/lenders');
    return response.data;
  },

  async createLender(lender: Omit<Lender, 'id'>): Promise<Lender> {
    const response = await api.post('/lenders', lender);
    return response.data;
  },

  // Loans
  async getLoans(): Promise<Loan[]> {
    const response = await api.get('/loans');
    return response.data;
  },

  async getLoan(id: number): Promise<Loan> {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  async createLoan(loan: Omit<Loan, 'id' | 'created_at' | 'updated_at' | 'status' | 'borrower' | 'lender'>): Promise<Loan> {
    const response = await api.post('/loans', loan);
    return response.data;
  },

  // Payments
  async getPayments(loanId: number): Promise<Payment[]> {
    const response = await api.get(`/loans/${loanId}/payments`);
    return response.data;
  },

  async createPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const response = await api.post('/payments', payment);
    return response.data;
  },

  // Reports
  async getLoanReport(loanId: number): Promise<LoanReport> {
    const response = await api.get(`/loans/${loanId}/report`);
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get('/health');
    return response.data;
  },
};

export default loanAPI;