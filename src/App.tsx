/**
 * Natmus Zambia Loan Management & Financial Services System
 * Main Application Orchestrator
 */

import React, { useState, useEffect } from 'react';
import MobileFrame from './components/MobileFrame';
import InstallPrompt from './components/InstallPrompt';
import AuthScreens from './components/AuthScreens';
import ClientDashboard from './components/ClientDashboard';
import AdminDashboard from './components/AdminDashboard';

import { User, Loan, Transaction, PromoCode, SystemMessage, Notification } from './types';
import { 
  INITIAL_USERS, 
  INITIAL_LOANS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_PROMO_CODES, 
  INITIAL_MESSAGES, 
  INITIAL_NOTIFICATIONS,
  calculateInterest,
  generateReference
} from './data';

export default function App() {
  // Current user / system role states
  const [activeRole, setActiveRole] = useState<'client' | 'admin'>('client');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core system database streams (simulating persistent server database)
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 1. Initial State Hydration with localStorage Sync
  useEffect(() => {
    // Load or initialize all users
    const localUsers = localStorage.getItem('natmus_users');
    if (localUsers) {
      setAllUsers(JSON.parse(localUsers));
    } else {
      setAllUsers(INITIAL_USERS);
      localStorage.setItem('natmus_users', JSON.stringify(INITIAL_USERS));
    }

    // Load or initialize loans
    const localLoans = localStorage.getItem('natmus_loans');
    if (localLoans) {
      setLoans(JSON.parse(localLoans));
    } else {
      setLoans(INITIAL_LOANS);
      localStorage.setItem('natmus_loans', JSON.stringify(INITIAL_LOANS));
    }

    // Load or initialize transactions
    const localTxs = localStorage.getItem('natmus_txs');
    if (localTxs) {
      setTransactions(JSON.parse(localTxs));
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('natmus_txs', JSON.stringify(INITIAL_TRANSACTIONS));
    }

    // Load or initialize promo codes
    const localPromos = localStorage.getItem('natmus_promos');
    if (localPromos) {
      setPromoCodes(JSON.parse(localPromos));
    } else {
      setPromoCodes(INITIAL_PROMO_CODES);
      localStorage.setItem('natmus_promos', JSON.stringify(INITIAL_PROMO_CODES));
    }

    // Load or initialize broadcast messages
    const localMsgs = localStorage.getItem('natmus_msgs');
    if (localMsgs) {
      setSystemMessages(JSON.parse(localMsgs));
    } else {
      setSystemMessages(INITIAL_MESSAGES);
      localStorage.setItem('natmus_msgs', JSON.stringify(INITIAL_MESSAGES));
    }

    // Load or initialize app notifications
    const localNotifs = localStorage.getItem('natmus_notifs');
    if (localNotifs) {
      setNotifications(JSON.parse(localNotifs));
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
      localStorage.setItem('natmus_notifs', JSON.stringify(INITIAL_NOTIFICATIONS));
    }

    // Default auto-login to first demo client to provide frictionless preview experience
    const hydratedUsers = localUsers ? JSON.parse(localUsers) : INITIAL_USERS;
    const demoClient = hydratedUsers.find((u: User) => u.role === 'client');
    if (demoClient) {
      setCurrentUser(demoClient);
    }
  }, []);

  // Sync utilities to save any states back to local storage
  const syncState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // 2. Action: Register New Customer Profile
  const handleRegisterUser = (newUser: User) => {
    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    syncState('natmus_users', updated);

    // Write primary welcoming inbox triggers
    const entryNotif: Notification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: newUser.id,
      title: 'Profile Created Successfully',
      body: 'Welcome to Natmus Zambia! Click "Request" below to select predefined micro-loans from K100 to K10,000.',
      timestamp: new Date().toISOString(),
      read: false,
      channel: 'Push'
    };
    const updatedNotifs = [entryNotif, ...notifications];
    setNotifications(updatedNotifs);
    syncState('natmus_notifs', updatedNotifs);
    
    setCurrentUser(newUser);
    setActiveRole('client');
  };

  // 3. Action: Login Success Handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveRole('admin');
    } else {
      setActiveRole('client');
    }
  };

  // 4. Action: Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // 5. Action: Request Loan Application (Client)
  const handleApplyForLoan = (
    amount: number, 
    termType: 'weekly' | 'monthly', 
    termLength: number, 
    promoApplied: string | undefined,
    additionalInfo?: {
      incomeSource?: string;
      employerName?: string;
      loanReason?: string;
      nextOfKinName?: string;
      nextOfKinPhone?: string;
    }
  ) => {
    if (!currentUser) return;

    // Check if user already has an active or pending loan to prevent multiple credit line abuses
    const hasUnfinishedLoan = loans.some(
      l => l.userId === currentUser.id && (l.status === 'Pending' || l.status === 'In Progress')
    );
    if (hasUnfinishedLoan) {
      alert('Application Rejected: You already hold an active credit line or pending request. Please clear existing balances first.');
      return;
    }

    // Determine interest discount factor based on promo code used
    let discountPercent = 0;
    if (promoApplied) {
      const match = promoCodes.find(p => p.code.toUpperCase() === promoApplied.toUpperCase());
      if (match) discountPercent = match.discountPercent;
    }

    const costDetails = calculateInterest(amount, termType, termLength, discountPercent);

    // Calculate due date
    const d = new Date();
    if (termType === 'weekly') {
      d.setDate(d.getDate() + (termLength * 7));
    } else {
      d.setMonth(d.getMonth() + termLength);
    }

    const newLoan: Loan = {
      id: `loan_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      amount,
      interestRate: costDetails.baseRate,
      interestAmount: costDetails.interest,
      totalRepayment: costDetails.total,
      termType,
      termLength,
      status: 'Pending',
      appliedDate: new Date().toISOString(),
      dueDate: d.toISOString(),
      promoCode: promoApplied,
      paidAmount: 0,
      outstandingAmount: costDetails.total,
      ...additionalInfo
    };

    const updatedLoans = [newLoan, ...loans];
    setLoans(updatedLoans);
    syncState('natmus_loans', updatedLoans);

    // Create Push Notification
    const notif: Notification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      title: 'Loan Application Submitted',
      body: `Your request for ZMW K${amount} is submitted. Ref: ${newLoan.id.slice(-6).toUpperCase()}. Waiting for admin review.`,
      timestamp: new Date().toISOString(),
      read: false,
      channel: 'Push'
    };
    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    syncState('natmus_notifs', updatedNotifs);
  };

  // 6. Action: Make Dynamic Repayment (Client)
  const handleMakeRepayment = (
    loanId: string, 
    amount: number, 
    paymentMethod: 'MTN Mobile Money' | 'Airtel Mobile Money' | 'Visa/Mastercard'
  ) => {
    if (!currentUser) return;

    const opLoans = loans.map(l => {
      if (l.id === loanId) {
        const remaining = l.outstandingAmount - amount;
        const totalPaid = l.paidAmount + amount;
        const status = remaining <= 0 ? 'Completed' : l.status;

        return {
          ...l,
          paidAmount: totalPaid,
          outstandingAmount: Math.max(0, remaining),
          status: status as any
        };
      }
      return l;
    });

    setLoans(opLoans);
    syncState('natmus_loans', opLoans);

    // Generate Transaction reference log
    const carrierPrefix = paymentMethod.includes('MTN') ? 'REF-MTN' : paymentMethod.includes('Airtel') ? 'REF-AIR' : 'REF-CRD';
    const tx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      loanId,
      userId: currentUser.id,
      amount,
      type: 'payment',
      method: paymentMethod,
      timestamp: new Date().toISOString(),
      status: 'Success',
      reference: generateReference(carrierPrefix as any)
    };

    const updatedTxs = [...transactions, tx];
    setTransactions(updatedTxs);
    syncState('natmus_txs', updatedTxs);

    // Push notification receipt alerts trigger
    const payNotif: Notification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      title: 'Mobile Repayment Received',
      body: `ZMW K${amount} credited. Ref: ${tx.reference}. Outstanding balance is now K${Math.max(0, (loans.find(l => l.id === loanId)?.outstandingAmount || 0) - amount)}.`,
      timestamp: new Date().toISOString(),
      read: false,
      channel: 'Push'
    };
    const updatedNotifs = [payNotif, ...notifications];
    setNotifications(updatedNotifs);
    syncState('natmus_notifs', updatedNotifs);
  };

  // --- ADMINISTRATOR OPERATIONS ---

  // A1. Suspend/Activate clients
  const handleToggleUserStatus = (userId: string) => {
    const updated = allUsers.map(u => {
      if (u.id === userId) {
        const toggle = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: toggle as any };
      }
      return u;
    });
    setAllUsers(updated);
    syncState('natmus_users', updated);
  };

  // A2. Admin Approve Pending Loan Request
  const handleApproveLoan = (loanId: string) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    const opLoans = loans.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'In Progress' as const,
          approvedDate: new Date().toISOString()
        };
      }
      return l;
    });
    setLoans(opLoans);
    syncState('natmus_loans', opLoans);

    // Generate direct disbursement capital transaction
    const dTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      loanId,
      userId: targetLoan.userId,
      amount: targetLoan.amount,
      type: 'disbursement',
      method: 'MTN Mobile Money', // default to MTN mobile money payout channel
      timestamp: new Date().toISOString(),
      status: 'Success',
      reference: generateReference('REF-NAT')
    };
    const updatedTxs = [...transactions, dTx];
    setTransactions(updatedTxs);
    syncState('natmus_txs', updatedTxs);

    // Inform applicant customer via targeted Push notify
    const appNotif: Notification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: targetLoan.userId,
      title: 'LOAN SUCCESSFUL & ADVANCED',
      body: `Congratulations, your K${targetLoan.amount} micro-credit was authorized by admin and disbursed immediately to your Mobile Wallet.`,
      timestamp: new Date().toISOString(),
      read: false,
      channel: 'Push'
    };
    const updatedNotifs = [appNotif, ...notifications];
    setNotifications(updatedNotifs);
    syncState('natmus_notifs', updatedNotifs);
  };

  // A3. Admin Reject Pending Loan Request
  const handleRejectLoan = (loanId: string) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    const opLoans = loans.map(l => {
      if (l.id === loanId) {
        return { ...l, status: 'Rejected' as const };
      }
      return l;
    });
    setLoans(opLoans);
    syncState('natmus_loans', opLoans);

    // Inform client
    const rejNotif: Notification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: targetLoan.userId,
      title: 'Loan Core Check Rejected',
      body: `We are sorry, your credit application for K${targetLoan.amount} did not satisfy our administrative metrics at this moment.`,
      timestamp: new Date().toISOString(),
      read: false,
      channel: 'Push'
    };
    const updatedNotifs = [rejNotif, ...notifications];
    setNotifications(updatedNotifs);
    syncState('natmus_notifs', updatedNotifs);
  };

  // A4. Admin force pay-off (Completed)
  const handleForceCompleteLoan = (loanId: string) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    const opLoans = loans.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          paidAmount: l.totalRepayment,
          outstandingAmount: 0,
          status: 'Completed' as const
        };
      }
      return l;
    });
    setLoans(opLoans);
    syncState('natmus_loans', opLoans);

    // Log settlement transaction
    const sTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      loanId,
      userId: targetLoan.userId,
      amount: targetLoan.outstandingAmount,
      type: 'payment',
      method: 'Visa/Mastercard', // assume settle office cash equivalents
      timestamp: new Date().toISOString(),
      status: 'Success',
      reference: generateReference('REF-NAT')
    };
    const updatedTxs = [...transactions, sTx];
    setTransactions(updatedTxs);
    syncState('natmus_txs', updatedTxs);

    // Inform client
    const setNotif: Notification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: targetLoan.userId,
      title: 'Manual Settle Balance complete',
      body: `Your loan of total repayment K${targetLoan.totalRepayment} was marked settled by admin offline audits. Thank you for choosing us!`,
      timestamp: new Date().toISOString(),
      read: false,
      channel: 'Push'
    };
    const updatedNotifs = [setNotif, ...notifications];
    setNotifications(updatedNotifs);
    syncState('natmus_notifs', updatedNotifs);
  };

  // A5. Promo Codes Management
  const handleAddPromoCode = (newPromo: PromoCode) => {
    const updated = [newPromo, ...promoCodes];
    setPromoCodes(updated);
    syncState('natmus_promos', updated);
  };

  const handleDeletePromoCode = (code: string) => {
    const updated = promoCodes.filter(p => p.code !== code);
    setPromoCodes(updated);
    syncState('natmus_promos', updated);
  };

  // A6. Broadcaster System: Bulk updates & adverts to all clients
  const handleSendBulkMessage = (
    title: string, 
    body: string, 
    channel: 'SMS' | 'Email' | 'WhatsApp' | 'Facebook'
  ) => {
    const clients = allUsers.filter(u => u.role === 'client');
    
    // Create broad message record
    const bulkMsg: SystemMessage = {
      id: `msg_${Math.random().toString(36).substr(2, 9)}`,
      title,
      body,
      channel,
      timestamp: new Date().toISOString(),
      recipientsCount: clients.length
    };
    const updatedMsgs = [bulkMsg, ...systemMessages];
    setSystemMessages(updatedMsgs);
    syncState('natmus_msgs', updatedMsgs);

    // Populate every client's private inbox notification stream instantly
    const generatedNotifs: Notification[] = clients.map(client => ({
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: client.id,
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      channel
    }));

    const updatedNotifs = [...generatedNotifs, ...notifications];
    setNotifications(updatedNotifs);
    syncState('natmus_notifs', updatedNotifs);
  };

  // D1. Reset Simulation for demo ease
  const handleResetData = () => {
    const resets = window.confirm('Are you sure you want to revert all custom transactions, loans, and promo edits to system defaults?');
    if (resets) {
      localStorage.removeItem('natmus_users');
      localStorage.removeItem('natmus_loans');
      localStorage.removeItem('natmus_txs');
      localStorage.removeItem('natmus_promos');
      localStorage.removeItem('natmus_msgs');
      localStorage.removeItem('natmus_notifs');
      
      setAllUsers(INITIAL_USERS);
      setLoans(INITIAL_LOANS);
      setTransactions(INITIAL_TRANSACTIONS);
      setPromoCodes(INITIAL_PROMO_CODES);
      setSystemMessages(INITIAL_MESSAGES);
      setNotifications(INITIAL_NOTIFICATIONS);

      const clientMatch = INITIAL_USERS.find(u => u.role === 'client');
      if (clientMatch) {
        setCurrentUser(clientMatch);
      }
      setActiveRole('client');
      alert('Natmus Zambia core dataset reset.');
    }
  };

  // Role custom proxy sync (if Admin dashboard switches back to client but no user signed in, auto sign-in)
  const handleRoleSwap = (role: 'client' | 'admin') => {
    if (role === 'admin') {
      const adminAcc = allUsers.find(u => u.role === 'admin') || INITIAL_USERS.find(u => u.role === 'admin')!;
      setCurrentUser(adminAcc);
      setActiveRole('admin');
    } else {
      const clientAcc = allUsers.find(u => u.role === 'client') || INITIAL_USERS.find(u => u.role === 'client')!;
      setCurrentUser(clientAcc);
      setActiveRole('client');
    }
  };

  return (
    <MobileFrame 
      activeRole={activeRole} 
      onChangeRole={handleRoleSwap}
      onResetData={handleResetData}
    >
      {/* Real PWA installation header instructions */}
      <InstallPrompt />

      {!currentUser ? (
        <AuthScreens 
          allUsers={allUsers}
          onLoginSuccess={handleLoginSuccess}
          onRegisterUser={handleRegisterUser}
        />
      ) : activeRole === 'admin' ? (
        <AdminDashboard 
          currentUser={currentUser}
          allUsers={allUsers}
          loans={loans}
          transactions={transactions}
          promoCodes={promoCodes}
          systemMessages={systemMessages}
          onToggleUserStatus={handleToggleUserStatus}
          onApproveLoan={handleApproveLoan}
          onRejectLoan={handleRejectLoan}
          onForceCompleteLoan={handleForceCompleteLoan}
          onAddPromoCode={handleAddPromoCode}
          onDeletePromoCode={handleDeletePromoCode}
          onSendBulkMessage={handleSendBulkMessage}
        />
      ) : (
        <ClientDashboard 
          currentUser={currentUser}
          onLogout={handleLogout}
          loans={loans}
          transactions={transactions}
          notifications={notifications}
          promoCodes={promoCodes}
          onApplyForLoan={handleApplyForLoan}
          onMakeRepayment={handleMakeRepayment}
        />
      )}
    </MobileFrame>
  );
}
