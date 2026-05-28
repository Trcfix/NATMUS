/**
 * Natmus Zambia Loan Management & Financial Services System
 * Type Definitions
 */

export type LoanStatus = 'Pending' | 'In Progress' | 'Completed' | 'Rejected';

export type RepaymentTerm = 'weekly' | 'monthly';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  role: 'client' | 'admin';
  status: 'active' | 'suspended';
  avatarUrl?: string;
}

export interface Loan {
  id: string;
  userId: string;
  amount: number;
  interestRate: number; // e.g. 0.15 (15%)
  interestAmount: number;
  totalRepayment: number;
  termType: RepaymentTerm;
  termLength: number; // number of weeks or months
  status: LoanStatus;
  appliedDate: string;
  approvedDate?: string;
  dueDate: string;
  promoCode?: string;
  paidAmount: number;
  outstandingAmount: number;
  incomeSource?: string;
  employerName?: string;
  loanReason?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
}

export interface Transaction {
  id: string;
  loanId: string;
  userId: string;
  amount: number;
  type: 'disbursement' | 'payment';
  method: 'MTN Mobile Money' | 'Airtel Mobile Money' | 'Visa/Mastercard';
  timestamp: string;
  status: 'Success' | 'Pending' | 'Failed';
  reference: string;
}

export interface PromoCode {
  code: string;
  discountPercent: number; // percentage reduction on interest (e.g., 20 means 20% off interest)
  description: string;
  active: boolean;
  expiryDate: string;
}

export interface SystemMessage {
  id: string;
  title: string;
  body: string;
  channel: 'SMS' | 'Email' | 'WhatsApp' | 'Facebook';
  timestamp: string;
  recipientsCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  channel?: 'SMS' | 'Email' | 'WhatsApp' | 'Facebook' | 'Push';
}
