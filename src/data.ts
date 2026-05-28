/**
 * Natmus Zambia Loan Management & Financial Services System
 * Seed Data and Helper Utilities
 */

import { User, Loan, Transaction, PromoCode, SystemMessage, Notification } from './types';

// Company Details
export const COMPANY_CONTACT = {
  phone: "0972113028",
  email: "natmusbusiness@gmail.com",
  facebook: "Natmus Business Innovations",
  facebookUrl: "https://www.facebook.com/NatmusBusinessInnovations"
};

// Loan Preset Amounts (Zambian Kwacha)
export const LOAN_PRESETS = [100, 200, 500, 1000, 2000, 5000, 10000];

// Repayment Term Configurations
export const TERM_OPTIONS = {
  weekly: [
    { label: '2 Weeks', value: 2 },
    { label: '4 Weeks', value: 4 },
    { label: '6 Weeks', value: 6 },
    { label: '8 Weeks', value: 8 }
  ],
  monthly: [
    { label: '1 Month', value: 1 },
    { label: '2 Months', value: 2 },
    { label: '3 Months', value: 3 },
    { label: '6 Months', value: 6 }
  ]
};

// Default annual interest factor (let's do 15% per month or 5% per week base)
export const BASE_WEEKLY_INTEREST = 0.05; // 5% per week
export const BASE_MONTHLY_INTEREST = 0.15; // 15% per month

// Initial Users
export const INITIAL_USERS: User[] = [
  {
    id: 'usr_client1',
    name: 'Chansa Chilufya',
    email: 'chansa@natmus.demo',
    phone: '0971234567',
    registeredAt: '2026-01-10T08:30:00Z',
    role: 'client',
    status: 'active',
  },
  {
    id: 'usr_admin',
    name: 'Natmus Administrator',
    email: COMPANY_CONTACT.email,
    phone: COMPANY_CONTACT.phone,
    registeredAt: '2025-12-01T09:00:00Z',
    role: 'admin',
    status: 'active',
  }
];

// Initial Promo Codes
export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    code: 'WELCOME50',
    discountPercent: 50, // 50% off loan interest fee
    description: 'Get 50% discount on interest on your first loan!',
    active: true,
    expiryDate: '2026-12-31'
  },
  {
    code: 'ZAMBIA20',
    discountPercent: 20, // 20% off interest
    description: 'Special 20% interest discount for returning local clients.',
    active: true,
    expiryDate: '2026-09-30'
  },
  {
    code: 'ZEROFEES',
    discountPercent: 100, // 100% off interest (interest-free loan!)
    description: 'Promotional 100% interest exemption on short-term weekly loans.',
    active: true,
    expiryDate: '2026-06-30'
  }
];

// Initial Loans
export const INITIAL_LOANS: Loan[] = [
  {
    id: 'loan_completed_1',
    userId: 'usr_client1',
    amount: 500,
    interestRate: BASE_WEEKLY_INTEREST,
    interestAmount: 100, // (5% * 4 weeks) * 500 = 100
    totalRepayment: 600,
    termType: 'weekly',
    termLength: 4,
    status: 'Completed',
    appliedDate: '2026-02-01T10:15:00Z',
    approvedDate: '2026-02-01T14:30:00Z',
    dueDate: '2026-03-01T10:15:00Z',
    paidAmount: 600,
    outstandingAmount: 0
  },
  {
    id: 'loan_active_1',
    userId: 'usr_client1',
    amount: 1000,
    interestRate: BASE_MONTHLY_INTEREST,
    interestAmount: 300, // (15% * 2 months) * 1000 = 300
    totalRepayment: 1300,
    termType: 'monthly',
    termLength: 2,
    status: 'In Progress',
    appliedDate: '2026-04-10T11:00:00Z',
    approvedDate: '2026-04-10T12:00:00Z',
    dueDate: '2026-06-10T11:00:00Z',
    paidAmount: 300,
    outstandingAmount: 1000
  },
  {
    id: 'loan_pending_1',
    userId: 'usr_client1',
    amount: 2000,
    interestRate: BASE_MONTHLY_INTEREST,
    interestAmount: 900, // (15% * 3 months) * 2000 = 900
    totalRepayment: 2900,
    termType: 'monthly',
    termLength: 3,
    status: 'Pending',
    appliedDate: '2026-05-25T15:45:00Z',
    dueDate: '2026-08-25T15:45:00Z',
    paidAmount: 0,
    outstandingAmount: 2900
  }
];

// Initial Transactions
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_dsb_1',
    loanId: 'loan_completed_1',
    userId: 'usr_client1',
    amount: 500,
    type: 'disbursement',
    method: 'MTN Mobile Money',
    timestamp: '2026-02-01T14:45:00Z',
    status: 'Success',
    reference: 'REF-MTN-8829102'
  },
  {
    id: 'tx_pay_1',
    loanId: 'loan_completed_1',
    userId: 'usr_client1',
    amount: 300,
    type: 'payment',
    method: 'MTN Mobile Money',
    timestamp: '2026-02-15T09:12:00Z',
    status: 'Success',
    reference: 'REF-MTN-8841022'
  },
  {
    id: 'tx_pay_2',
    loanId: 'loan_completed_1',
    userId: 'usr_client1',
    amount: 300,
    type: 'payment',
    method: 'MTN Mobile Money',
    timestamp: '2026-02-28T16:05:00Z',
    status: 'Success',
    reference: 'REF-MTN-8850912'
  },
  {
    id: 'tx_dsb_2',
    loanId: 'loan_active_1',
    userId: 'usr_client1',
    amount: 1000,
    type: 'disbursement',
    method: 'Airtel Mobile Money',
    timestamp: '2026-04-10T12:15:00Z',
    status: 'Success',
    reference: 'REF-AIR-7740291'
  },
  {
    id: 'tx_pay_3',
    loanId: 'loan_active_1',
    userId: 'usr_client1',
    amount: 300,
    type: 'payment',
    method: 'Airtel Mobile Money',
    timestamp: '2026-05-10T14:30:00Z',
    status: 'Success',
    reference: 'REF-AIR-7751022'
  }
];

// Initial System Broadcast Messages
export const INITIAL_MESSAGES: SystemMessage[] = [
  {
    id: 'msg_1',
    title: 'Winter Fast Approvals Offer',
    body: 'Get instant approvals on micro-loans up to K500. Perfect for swift household needs. Apply now with low weekly terms!',
    channel: 'SMS',
    timestamp: '2026-05-01T08:00:00Z',
    recipientsCount: 45
  },
  {
    id: 'msg_2',
    title: 'Zero Interest Promo Code',
    body: 'Greetings from Natmus! Use promo code ZEROFEES of up to 100% off weekly interest. Valid on loans taken out before end of this month.',
    channel: 'WhatsApp',
    timestamp: '2026-05-15T12:30:00Z',
    recipientsCount: 120
  }
];

// Initial App Notifications
export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'usr_client1',
    title: 'Welcome to Natmus Zambia',
    body: 'Your account has been verified. You can now choose from our preset loan amounts!',
    timestamp: '2026-01-10T08:35:00Z',
    read: true,
    channel: 'Push'
  },
  {
    id: 'notif_2',
    userId: 'usr_client1',
    title: 'Loan Approved Successfully',
    body: 'Your K1,000 loan was approved by admin and disbursed to your account.',
    timestamp: '2026-04-10T12:00:00Z',
    read: true,
    channel: 'Push'
  },
  {
    id: 'notif_3',
    userId: 'usr_client1',
    title: 'Payment Received',
    body: 'We received your payment of K300 on MTN Mobile Money. Thank you!',
    timestamp: '2026-05-10T14:31:00Z',
    read: false,
    channel: 'Push'
  }
];

/**
 * Calculative Helpers
 */
export function calculateInterest(
  amount: number,
  termType: 'weekly' | 'monthly',
  termLength: number,
  promoDiscountFactor: number = 0 // e.g. 50 (50% off interest)
): { interest: number; total: number; baseRate: number; discountAmt: number } {
  const baseRate = termType === 'weekly' ? BASE_WEEKLY_INTEREST : BASE_MONTHLY_INTEREST;
  
  // Straight interest = amount * rate * length
  const rawInterest = amount * baseRate * termLength;
  
  // Apply discount
  const discountAmt = Math.round(rawInterest * (promoDiscountFactor / 100));
  const finalInterest = Math.round(rawInterest - discountAmt);
  const total = amount + finalInterest;

  return {
    interest: finalInterest,
    total,
    baseRate,
    discountAmt
  };
}

// Generate an 8-character unique Reference Code
export function generateReference(prefix: 'REF-MTN' | 'REF-AIR' | 'REF-CRD' | 'REF-NAT'): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 7; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${rand}`;
}
