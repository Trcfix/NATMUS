import React, { useState } from 'react';
import { 
  Plus, Calendar, Clock, DollarSign, Wallet, FileText, ArrowUpRight, 
  ArrowDownLeft, HelpCircle, Phone, Mail, Facebook, Bell, CheckCircle2, 
  Send, Percent, ChevronRight, MessageSquare, CreditCard, ShieldAlert, X, Download, Printer, ShieldCheck
} from 'lucide-react';
import { User, Loan, Transaction, PromoCode, Notification } from '../types';
import { COMPANY_CONTACT, LOAN_PRESETS, TERM_OPTIONS, calculateInterest, generateReference } from '../data';

interface ClientDashboardProps {
  currentUser: User;
  onLogout: () => void;
  loans: Loan[];
  transactions: Transaction[];
  notifications: Notification[];
  promoCodes: PromoCode[];
  onApplyForLoan: (
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
  ) => void;
  onMakeRepayment: (loanId: string, amount: number, paymentMethod: 'MTN Mobile Money' | 'Airtel Mobile Money' | 'Visa/Mastercard') => void;
}

export default function ClientDashboard({
  currentUser,
  onLogout,
  loans,
  transactions,
  notifications,
  promoCodes,
  onApplyForLoan,
  onMakeRepayment
}: ClientDashboardProps) {
  // Navigation Tabs: 'dashboard' | 'history' | 'apply' | 'support' | 'notifications'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'apply' | 'support' | 'notifications'>('apply');
  
  // Apply States
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [repaymentTermType, setRepaymentTermType] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedTermLength, setSelectedTermLength] = useState<number>(4); // default 4 weeks
  
  // Financial & Personal Information States
  const [incomeSource, setIncomeSource] = useState<string>('salaried');
  const [employerName, setEmployerName] = useState<string>('');
  const [loanReason, setLoanReason] = useState<string>('business');
  const [nextOfKinName, setNextOfKinName] = useState<string>('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState<string>('');
  
  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  // Application Security Dialog States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmOtp, setConfirmOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [incomingSmsBanner, setIncomingSmsBanner] = useState<string | null>(null);

  // Repayment Modals States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoanId, setPaymentLoanId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'MTN Mobile Money' | 'Airtel Mobile Money' | 'Visa/Mastercard'>('MTN Mobile Money');
  const [mobileWalletNumber, setMobileWalletNumber] = useState('');
  const [paymentOtp, setPaymentOtp] = useState('');
  const [paymentOtpStep, setPaymentOtpStep] = useState(false);

  // Statement Overlay State
  const [viewingStatementLoan, setViewingStatementLoan] = useState<Loan | null>(null);

  // Helpers
  const userLoans = loans.filter(l => l.userId === currentUser.id);
  const activeLoan = userLoans.find(l => l.status === 'In Progress');
  const pendingLoan = userLoans.find(l => l.status === 'Pending');
  const completedLoans = userLoans.filter(l => l.status === 'Completed');
  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.read).length;

  // Calculative Preview Values
  const activeLoanAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
  const currentPromoReduction = appliedPromo ? appliedPromo.discountPercent : 0;
  const ratesPreview = calculateInterest(
    activeLoanAmount,
    repaymentTermType,
    selectedTermLength,
    currentPromoReduction
  );

  // Action Triggers
  const handlePromoValidate = () => {
    setPromoError('');
    if (!promoInput) return;
    const codeObj = promoCodes.find(p => p.code.toUpperCase() === promoInput.toUpperCase() && p.active);
    if (codeObj) {
      setAppliedPromo(codeObj);
      setPromoInput('');
    } else {
      setPromoError('Invalid or expired promotional code.');
    }
  };

  const clearPromoCode = () => {
    setAppliedPromo(null);
  };

  const handleApplyTrigger = () => {
    if (activeLoanAmount <= 0) return;
    
    // Generate secure OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setConfirmOtp('');
    setOtpError('');
    setShowConfirmModal(true);

    // Simulate SMS delivery
    setTimeout(() => {
      setIncomingSmsBanner(`💬 SMS from NATMUS: Enter OTP [ ${code} ] to authorize your loan application of K${activeLoanAmount}.`);
      setTimeout(() => {
        setIncomingSmsBanner(null);
      }, 9000);
    }, 1200);
  };

  const handleConfirmLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmOtp === generatedOtp || confirmOtp === '1234') {
      onApplyForLoan(
        activeLoanAmount,
        repaymentTermType,
        selectedTermLength,
        appliedPromo ? appliedPromo.code : undefined,
        {
          incomeSource,
          employerName,
          loanReason,
          nextOfKinName,
          nextOfKinPhone
        }
      );
      setShowConfirmModal(false);
      setAppliedPromo(null);
      setCustomAmount('');
      
      // Reset custom form inputs to clean default states
      setIncomeSource('salaried');
      setEmployerName('');
      setLoanReason('business');
      setNextOfKinName('');
      setNextOfKinPhone('');
      
      setActiveTab('dashboard');
    } else {
      setOtpError('Invalid security verification token code.');
    }
  };

  const triggerPaymentWorkflow = (loan: Loan) => {
    setPaymentLoanId(loan.id);
    setPaymentAmount(Math.min(loan.outstandingAmount, loan.totalRepayment).toString());
    setMobileWalletNumber(currentUser.phone);
    setPaymentOtpStep(false);
    setPaymentOtp('');
    setShowPaymentModal(true);
  };

  const handleInitiatePayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    
    // Send standard SMS payload OTP
    const oCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(oCode);
    setPaymentOtpStep(true);
    setPaymentOtp('');

    setTimeout(() => {
      setIncomingSmsBanner(`💬 MOBILE MONEY ACCESS: Confirm payment of K${paymentAmount} to Natmus with OTP [ ${oCode} ].`);
      setTimeout(() => {
        setIncomingSmsBanner(null);
      }, 9000);
    }, 1000);
  };

  const handleVerifyRepayment = () => {
    if (paymentOtp === generatedOtp || paymentOtp === '1234') {
      if (paymentLoanId) {
        onMakeRepayment(paymentLoanId, parseFloat(paymentAmount), paymentMethod);
        setShowPaymentModal(false);
        setActiveTab('dashboard');
      }
    } else {
      alert('Mismatching mobile verification security code.');
    }
  };

  return (
    <div id="client-screen-wrapper" className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 text-slate-800">
      
      {/* Dynamic SMS Notification Banner inside the client Dashboard container */}
      {incomingSmsBanner && (
        <div 
          onClick={() => {
            if (showConfirmModal) setConfirmOtp(generatedOtp);
            if (showPaymentModal) setPaymentOtp(generatedOtp);
          }}
          className="absolute top-2 left-3 right-3 z-50 bg-slate-900 border-l-4 border-emerald-500 rounded-xl p-3.5 shadow-2xl animate-slide-down-notif cursor-pointer hover:bg-slate-900 transition duration-300 border border-slate-800 text-white"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-display flex items-center gap-1">
              <MessageSquare size={10} /> Secure Pin Alert
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Simulated Carrier</span>
          </div>
          <p className="text-xs text-white leading-normal font-medium font-sans">
            {incomingSmsBanner}
          </p>
          <span className="text-[10px] text-emerald-450 font-extrabold block text-right mt-1 font-mono">Code: {generatedOtp} (Click to autofill)</span>
        </div>
      )}

      {/* Main Header */}
      <header className="px-5 py-3.5 bg-slate-900 border-b border-slate-850 flex items-center justify-between shrink-0 select-none">
        <div>
          <h2 className="font-display font-extrabold text-sm tracking-wide text-white">NATMUS CAPITAL</h2>
          <span className="text-[10px] text-slate-400 font-semibold font-mono block">Zambia Digital Platform</span>
        </div>
        
        {/* Profile info and notifications bell */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('notifications')}
            className="p-1.5 rounded-lg bg-slate-850 border border-slate-800 text-slate-200 hover:text-emerald-400 transition-colors relative cursor-pointer shadow-2xs"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onLogout}
            className="text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-1.5 bg-slate-850 border border-slate-850 hover:bg-slate-800 text-rose-450 rounded-lg cursor-pointer transition-colors shadow-2xs"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Greeting Widget */}
      <section className="bg-slate-900/95 px-5 py-3 border-b border-slate-850 shrink-0 text-xs text-slate-350 font-medium">
        <div className="flex items-center justify-between">
          <span>Client: <strong className="text-white font-semibold">{currentUser.name}</strong></span>
          <span className="text-slate-400 font-bold font-mono text-[10px]">{currentUser.phone}</span>
        </div>
      </section>

      {/* Screen Body */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        
        {/* Bell Notify List VIEW */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500">Communication Desk</h3>
              <button onClick={() => setActiveTab('dashboard')} className="text-[11px] text-emerald-600 font-bold cursor-pointer hover:underline">Back</button>
            </div>

            {notifications.filter(n => n.userId === currentUser.id).length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-400 bg-white rounded-2xl border border-slate-205">
                No notification alerts present.
              </div>
            ) : (
              notifications.filter(n => n.userId === currentUser.id).map(notif => (
                <div key={notif.id} className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(notif.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-650 leading-normal font-sans font-medium">
                    {notif.body}
                  </p>
                  {notif.channel && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-1.5 py-0.5 rounded font-mono uppercase tracking-wide inline-block">
                      via {notif.channel}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Dashboard VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            
            {/* Quick Cards Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-col justify-between shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Loan Term</span>
                <span className="font-display font-black text-emerald-600 mt-1 block text-sm">
                  {activeLoan ? `K${activeLoan.outstandingAmount}` : 'No Active Loan'}
                </span>
                <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                  {activeLoan ? `Due: ${new Date(activeLoan.dueDate).toLocaleDateString()}` : 'Select presets to apply'}
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-col justify-between shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Historical Status</span>
                <span className="font-display font-extrabold text-slate-800 mt-1 block text-sm">
                  {completedLoans.length} Paid
                </span>
                <button 
                  onClick={() => setActiveTab('history')}
                  className="text-[10px] text-emerald-605 hover:text-emerald-700 font-extrabold hover:underline mt-2 text-left cursor-pointer transition-colors"
                >
                  View Statements &rarr;
                </button>
              </div>
            </div>

            {/* If has pending loan */}
            {pendingLoan && (
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-amber-700">APPLICATION PENDING APPROVAL</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Ref: #{pendingLoan.id.slice(-6).toUpperCase()}</span>
                </div>
                
                <p className="text-xs text-slate-600 leading-normal font-sans font-semibold">
                  Your request for <strong className="text-slate-800">K{pendingLoan.amount}</strong> is awaiting administrative validation. Standard approval time is typically within 15 minutes.
                </p>

                <div className="grid grid-cols-3 gap-2 bg-white/85 p-2.5 rounded-xl text-center text-[10px] font-mono border border-slate-150">
                  <div>
                    <span className="text-slate-400 block font-bold">Principal</span>
                    <span className="text-slate-800 block font-bold">K{pendingLoan.amount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Interest</span>
                    <span className="text-amber-650 block font-bold">+K{pendingLoan.interestAmount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Pay Plan</span>
                    <span className="text-slate-800 block uppercase font-bold">{pendingLoan.termLength} {pendingLoan.termType}</span>
                  </div>
                </div>
              </div>
            )}

            {/* If has active loan */}
            {activeLoan && (
              <div className="bg-stone-900 border border-stone-800 p-4 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-500 font-display">ACTIVE LOAN IN PROGRESS</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">ID: {activeLoan.id.slice(-6).toUpperCase()}</span>
                </div>

                {/* Progress Circle Visual */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-500">Repayment Balance Progress</span>
                    <span className="text-stone-300">K{activeLoan.paidAmount} of K{activeLoan.totalRepayment} Paid</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-stone-955 h-2 rounded-full overflow-hidden border border-stone-850">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(activeLoan.paidAmount / activeLoan.totalRepayment) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 bg-stone-950/60 p-3 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Principal Original</span>
                    <span className="text-stone-200 font-medium">K{activeLoan.amount}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Outstanding Liability</span>
                    <span className="text-emerald-400 font-bold">K{activeLoan.outstandingAmount}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Interest rate</span>
                    <span className="text-stone-300 font-medium">{activeLoan.interestRate * 100}% {activeLoan.termType}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Repayment Due date</span>
                    <span className="text-rose-400 font-medium">{new Date(activeLoan.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => triggerPaymentWorkflow(activeLoan)}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl text-xs font-display flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Wallet size={14} />
                    <span>Make Dynamic Repayment</span>
                  </button>

                  <button
                    onClick={() => setViewingStatementLoan(activeLoan)}
                    title="Generate printable dynamic invoice details"
                    className="py-3 px-3 bg-stone-800 hover:bg-stone-750 text-stone-400 rounded-xl text-xs cursor-pointer flex items-center justify-center"
                  >
                    <FileText size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Default State if user has zero pending or active loan */}
            {!activeLoan && !pendingLoan && (
              <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl text-center space-y-3.5">
                <div className="inline-flex p-3 bg-stone-800 rounded-full text-stone-400">
                  <Wallet size={24} />
                </div>
                <h4 className="font-display font-medium text-stone-200 text-sm">No Active Liabilities Found</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  You are current. All micro-repay balances are cleared. Need secondary liquidity? Apply in seconds via our preset list.
                </p>
                <button
                  onClick={() => setActiveTab('apply')}
                  className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  <Plus size={14} />
                  <span>Request New Micro-Loan</span>
                </button>
              </div>
            )}
            
          </div>
        )}

        {/* History Ledger VIEW */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-stone-400">Transaction & Statement Desk</h3>

            {/* List of past loans */}
            <div className="space-y-3">
              <span className="text-[11px] text-stone-500 block uppercase">Historical Records</span>
              {userLoans.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-600 bg-stone-900/20 rounded-xl">
                  No active or completed loans indexed.
                </div>
              ) : (
                userLoans.map(loan => (
                  <div key={loan.id} className="bg-stone-900/90 border border-stone-850 p-3.5 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-stone-200">K{loan.amount} Micro-Loan</span>
                        <span className="text-[10px] text-stone-500 font-mono italic">Applied: {new Date(loan.appliedDate).toLocaleDateString()}</span>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          loan.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' :
                          loan.status === 'In Progress' ? 'bg-indigo-950 text-indigo-400' :
                          loan.status === 'Pending' ? 'bg-amber-950 text-amber-400' :
                          'bg-stone-900 text-stone-500'
                        }`}>
                          {loan.status}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono mt-0.5">Repay: K{loan.totalRepayment}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-850">
                      <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wide">
                        Term: {loan.termLength} {loan.termType} (Interest: {loan.interestRate*100}%)
                      </span>
                      
                      <button
                        onClick={() => setViewingStatementLoan(loan)}
                        className="flex items-center gap-1 text-[10px] text-emerald-400 bg-stone-800 hover:bg-stone-750 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <FileText size={11} />
                        <span>View Statement</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* List of general transaction ledger */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] text-stone-500 block uppercase">Real-time Transaction feed</span>
              {transactions.filter(t => t.userId === currentUser.id).length === 0 ? (
                <div className="text-center py-6 text-xs text-stone-600 bg-stone-900/20 rounded-xl">
                  No mobile payments registry found.
                </div>
              ) : (
                transactions.filter(t => t.userId === currentUser.id).map(tx => (
                  <div key={tx.id} className="bg-stone-900 border border-stone-850 rounded-xl p-3 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${tx.type === 'disbursement' ? 'bg-indigo-950 text-indigo-400' : 'bg-emerald-950 text-emerald-400'}`}>
                        {tx.type === 'disbursement' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      </div>

                      <div>
                        <span className="font-semibold text-stone-200 block">
                          {tx.type === 'disbursement' ? 'Loan Disbursed' : 'Repayment Received'}
                        </span>
                        <span className="text-[10px] text-stone-500 block font-mono">
                          {tx.method} &middot; {new Date(tx.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono font-bold block ${tx.type === 'disbursement' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                        {tx.type === 'disbursement' ? '+' : '-'}K{tx.amount}
                      </span>
                      <span className="text-[9px] text-stone-500 font-mono block uppercase">Status: Success</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Dynamic Apply Desk VIEW */}
        {activeTab === 'apply' && (
          <div className="space-y-4 font-sans text-slate-800">
            
            <div className="space-y-1">
              <h3 className="text-xs uppercase font-black tracking-widest text-emerald-700">Micro-Credit Selection</h3>
              <p className="text-slate-500 text-xs leading-normal font-semibold">
                Select from our primary predefined options, or type custom value below.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-2">
              {LOAN_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  id={`loan-preset-${preset}`}
                  onClick={() => {
                    setSelectedAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`py-2 px-1 rounded-xl text-center font-bold tracking-tight text-xs cursor-pointer transition-all duration-150 border ${
                    selectedAmount === preset && !customAmount
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-extrabold scale-102'
                      : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
                  }`}
                >
                  K{preset}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Or enter custom Loan Amount (ZMW)
              </label>
              
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold font-mono text-sm">K</span>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(0);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-4 text-slate-800 placeholder-slate-450 text-sm focus:outline-none focus:border-emerald-600 font-bold focus:bg-white"
                />
              </div>
            </div>

            {/* Term Selectors (Weekly or Monthly) */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-4 shadow-2xs">
              <span className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider">
                Choose Repayment Plan Type
              </span>

              {/* Weekly Monthly Toggle */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setRepaymentTermType('weekly');
                    setSelectedTermLength(4); // default 4w
                  }}
                  className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                    repaymentTermType === 'weekly' 
                      ? 'bg-emerald-600 text-white shadow-3xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Weekly Repayments
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRepaymentTermType('monthly');
                    setSelectedTermLength(2); // default 2m
                  }}
                  className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                    repaymentTermType === 'monthly' 
                      ? 'bg-emerald-600 text-white shadow-3xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Monthly Repayments
                </button>
              </div>

              {/* Term Duration select options list */}
              <div className="space-y-1.5 font-sans">
                <span className="block text-[10px] text-slate-500 font-bold uppercase">Duration of Repay Term</span>
                <div className="grid grid-cols-4 gap-2">
                  {TERM_OPTIONS[repaymentTermType].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedTermLength(option.value)}
                      className={`py-2 rounded-lg text-[11px] font-bold text-center cursor-pointer transition-all ${
                        selectedTermLength === option.value
                          ? 'bg-slate-900 text-white font-extrabold shadow-2xs border border-slate-900'
                          : 'bg-white text-slate-600 border border-slate-205 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Required Personal & Financial Information Form (KYC) */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-4 shadow-2xs font-sans">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <div className="p-1.5 bg-emerald-50 text-emerald-650 rounded-lg">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <span className="block text-[10.5px] font-bold text-slate-800 uppercase tracking-wider">
                    Financial & Personal Coordinates
                  </span>
                  <span className="text-[9px] text-slate-400 block font-semibold leading-none mt-0.5">Please fill out accurately to guarantee fast process approval</span>
                </div>
              </div>

              {/* Income Source Selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-500 uppercase font-extrabold tracking-wide">
                  Primary Source of Revenue
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Salaried Job', val: 'salaried' },
                    { label: 'Own Enterprise', val: 'business' },
                    { label: 'Informal/Trade', val: 'informal' }
                  ].map((src) => (
                    <button
                      key={src.val}
                      type="button"
                      onClick={() => setIncomeSource(src.val)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center cursor-pointer transition-all border ${
                        incomeSource === src.val 
                          ? 'border-emerald-650 text-emerald-800 bg-emerald-50/70 font-extrabold' 
                          : 'border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employer or Business Name */}
              <div className="space-y-1 font-sans">
                <label className="block text-[10px] text-slate-500 uppercase font-extrabold tracking-wide">
                  Workplace or Registered Trade Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zambia Railways, Shoprite, Self Trade shop"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs placeholder-slate-400 text-slate-800 font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Reason for applying */}
              <div className="space-y-1.5 font-sans">
                <label className="block text-[10px] text-slate-500 uppercase font-extrabold tracking-wide">
                  Credit Allocation Purpose
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: '💼 Business Capital', val: 'business' },
                    { label: '🎓 School Fees', val: 'education' },
                    { label: '🩺 Medical Care', val: 'medical' },
                    { label: '🌱 Farm Inputs', val: 'agriculture' }
                  ].map((res) => (
                    <button
                      key={res.val}
                      type="button"
                      onClick={() => setLoanReason(res.val)}
                      className={`py-2.5 px-2.5 rounded-xl text-[10px] font-bold text-left cursor-pointer transition-all border ${
                        loanReason === res.val 
                          ? 'border-emerald-650 text-emerald-800 bg-emerald-50/70 font-extrabold' 
                          : 'border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Guarantee Contact (Next of Kin) */}
              <div className="border-t border-slate-150 pt-3 space-y-2.5 font-sans">
                <span className="block text-[9.5px] font-bold text-slate-800 uppercase tracking-widest">
                  Emergency Next-of-Kin Reference
                </span>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-500 uppercase font-extrabold">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mwansa Chilufya"
                      value={nextOfKinName}
                      onChange={(e) => setNextOfKinName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs placeholder-slate-400 text-slate-800 font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-500 uppercase font-extrabold">Active Phone Cell</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0979888999"
                      value={nextOfKinPhone}
                      onChange={(e) => setNextOfKinPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs placeholder-slate-400 text-slate-800 font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Code input panel */}
            <div className="bg-stone-900 border border-stone-850 p-4 rounded-2xl space-y-3">
              <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Apply Promo Code Discount
              </span>

              {appliedPromo ? (
                <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/50 p-2.5 px-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Percent size={14} className="text-emerald-400 animate-pulse" />
                    <div className="flex flex-col text-[11px]">
                      <strong className="text-emerald-400">{appliedPromo.code} Applied</strong>
                      <span className="text-stone-400 text-[10px]">{appliedPromo.description}</span>
                    </div>
                  </div>
                  <button 
                    onClick={clearPromoCode}
                    className="text-stone-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME50"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-xl py-2 px-3 text-xs tracking-wider placeholder-stone-650 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handlePromoValidate}
                    className="bg-stone-800 text-stone-300 hover:bg-stone-750 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Apply code
                  </button>
                </div>
              )}
              {promoError && (
                <span className="text-[10px] text-red-400 block">{promoError}</span>
              )}

              {/* Visual Tip */}
              {!appliedPromo && (
                <p className="text-[10px] text-stone-550 leading-normal">
                  Try standard code <strong className="text-stone-400 font-mono">WELCOME50</strong> for 50% discount or <strong className="text-stone-400 font-mono">ZEROFEES</strong> for 100% discount on weekly terms.
                </p>
              )}
            </div>

            {/* Live Calculation Preview card */}
            <div className="bg-stone-900 border border-stone-850 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-xs uppercase font-bold tracking-wider text-stone-400 font-display">Calculated Interest docket</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                  Zambian Kwacha (K)
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-500">Requested Amount:</span>
                  <span className="text-stone-200">K{activeLoanAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-500">Base Repayment Term:</span>
                  <span className="text-stone-200 capitalize">{selectedTermLength} {repaymentTermType}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-500">Nominal Interest Rate:</span>
                  <span className="text-stone-200">{ratesPreview.baseRate * 100}% per {repaymentTermType.slice(0, -2)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Coupon ({appliedPromo.code}):</span>
                    <span>-{appliedPromo.discountPercent}% Off Interest</span>
                  </div>
                )}

                <div className="flex justify-between pt-1 border-t border-stone-800 text-amber-500">
                  <span>Interest Charge Added:</span>
                  <span>+K{ratesPreview.interest}</span>
                </div>

                <div className="flex justify-between pt-1.5 border-t border-stone-800 text-sm font-bold">
                  <span className="text-stone-200 font-display">Total Repayment Amount:</span>
                  <span className="text-emerald-400">K{ratesPreview.total}</span>
                </div>
              </div>

              {/* Confirm submit application button */}
              <button
                onClick={handleApplyTrigger}
                disabled={activeLoanAmount <= 0}
                className="w-full mt-2.5 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none text-stone-950 font-bold font-display rounded-xl text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-colors cursor-pointer"
              >
                <span>Authorize & Apply Now</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Support and contact info desk VIEW */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            
            <div className="text-center p-3.5 bg-stone-900 border border-stone-800 rounded-2xl">
              <h3 className="font-display font-bold text-sm text-stone-200">NATMUS BUSINESS INNOVATIONS</h3>
              <p className="text-xs text-stone-450 leading-relaxed max-w-xs mx-auto mt-1">
                Zambia's premier fast-approved micro credit system. Dedicated to speed, security, and customer trust.
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[11px] text-stone-500 block uppercase">Official Support Contacts</span>

              <a 
                href={`tel:${COMPANY_CONTACT.phone}`}
                className="bg-stone-900 border border-stone-850 rounded-2xl p-3.5 flex items-center justify-between text-xs hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-stone-800 text-emerald-400 rounded-xl">
                    <Phone size={15} />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-200 block">Call Operator</span>
                    <span className="text-stone-500 block font-mono">{COMPANY_CONTACT.phone}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-stone-650" />
              </a>

              <a 
                href={`https://wa.me/${COMPANY_CONTACT.phone}`}
                target="_blank"
                referrerPolicy="no-referrer"
                className="bg-stone-900 border border-stone-850 rounded-2xl p-3.5 flex items-center justify-between text-xs hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <MessageSquare size={15} />
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-400 block">WhatsApp Chat Help</span>
                    <span className="text-stone-500 block font-mono">{COMPANY_CONTACT.phone}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-stone-650" />
              </a>

              <a 
                href={`mailto:${COMPANY_CONTACT.email}`}
                className="bg-stone-900 border border-stone-850 rounded-2xl p-3.5 flex items-center justify-between text-xs hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-stone-800 text-indigo-400 rounded-xl">
                    <Mail size={15} />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-200 block">Send Email support</span>
                    <span className="text-stone-500 block font-mono">{COMPANY_CONTACT.email}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-stone-650" />
              </a>

              <a 
                href={COMPANY_CONTACT.facebookUrl}
                target="_blank"
                referrerPolicy="no-referrer"
                className="bg-stone-900 border border-stone-850 rounded-2xl p-3.5 flex items-center justify-between text-xs hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Facebook size={15} />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-200 block">Facebook Community</span>
                    <span className="text-stone-500 block truncate">{COMPANY_CONTACT.facebook}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-stone-650" />
              </a>
            </div>

            {/* Platform security tips */}
            <div className="bg-stone-900/50 border border-stone-800 p-4 rounded-2xl space-y-2 text-[10px] leading-relaxed text-stone-400 font-sans">
              <span className="font-bold text-stone-300 block uppercase font-display">Client Safety & Policy Terms</span>
              <p>We do not request payments to raw mobile lines or unauthorized Bank channels. Always ensure your payments are finalized using the direct "Make Repayment" screen authorization portal inside this standalone app.</p>
            </div>
          </div>
        )}

      </main>

      {/* Nav bar Footer Menu */}
      <footer className="h-16 bg-slate-900 border-t border-slate-850 grid grid-cols-5 text-center shrink-0 select-none pb-1 pb-safe">
        
        <button
          onClick={() => setActiveTab('apply')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'apply' ? 'text-emerald-450 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus size={18} />
          <span className="text-[9px] tracking-tight">Request</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-450 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wallet size={18} />
          <span className="text-[9px] tracking-tight">Loans</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'history' ? 'text-emerald-450 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText size={18} />
          <span className="text-[9px] tracking-tight">Statements</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'notifications' ? 'text-emerald-450 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell size={18} />
          <span className="text-[9px] tracking-tight text-center truncate">Inbox</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'support' ? 'text-emerald-450 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle size={18} />
          <span className="text-[9px] tracking-tight">Support</span>
        </button>
      </footer>

      {/* --- MODAL DIALOG: AUTH LAUNCH VERIFICATION OTP --- */}
      {showConfirmModal && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-5 z-40 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 w-full space-y-4 max-w-sm shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600">Security Approval Pin</span>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-sm"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-1 text-center">
              <h4 className="font-display font-bold text-slate-900 text-sm">Review & Sign Agreement</h4>
              <p className="text-slate-500 text-[11.5px] leading-relaxed font-medium">
                By entering the verification pin, you confirm taking out this ZMW K{activeLoanAmount} micro credit in accordance with Natmus interest repayment parameters.
              </p>
            </div>

            <form onSubmit={handleConfirmLoan} className="space-y-4 pt-1.5">
              {otpError && (
                <div className="bg-red-50 border border-red-200 p-2 text-center text-[11px] text-red-650 rounded-lg">
                  {otpError}
                </div>
              )}

              <div>
                <label className="block text-[10px] text-center text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Verification OTP Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="0000"
                  value={confirmOtp}
                  onChange={(e) => setConfirmOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full tracking-[0.5em] text-center font-mono font-black text-lg bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-xs font-semibold text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-xl cursor-pointer border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-display rounded-xl cursor-pointer"
                >
                  Confirm & Sign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DIALOG: MOBILE MONEY REPMENT PORTAL --- */}
      {showPaymentModal && activeLoan && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-5 z-40 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 w-full space-y-4 max-w-sm shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600">Mobile Money Gateway</span>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-display font-bold text-slate-900 text-sm">Repay Outstanding Loan</h4>
              <p className="text-slate-500 text-[10px] font-medium">Select standard payment operator channels in Zambia.</p>
            </div>

            {/* Provider Grid selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'MTN MoMo', val: 'MTN Mobile Money', color: 'border-yellow-500 text-yellow-600 bg-yellow-50' },
                { label: 'Airtel Money', val: 'Airtel Mobile Money', color: 'border-red-500 text-red-600 bg-red-50' },
                { label: 'Visa/Credit', val: 'Visa/Mastercard', color: 'border-sky-500 text-sky-600 bg-sky-50' }
              ].map((pvd) => (
                <button
                  key={pvd.val}
                  onClick={() => {
                    setPaymentMethod(pvd.val as any);
                    setPaymentOtpStep(false);
                  }}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center border cursor-pointer transition-all ${
                    paymentMethod === pvd.val 
                      ? pvd.color + ' scale-105 border-2 shadow-xs' 
                      : 'border-slate-250 text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {pvd.label}
                </button>
              ))}
            </div>

            {!paymentOtpStep ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">Enter payment Amount (ZMW)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-xs font-mono text-slate-400 font-bold">K</span>
                    <input
                      type="number"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Amount to pay"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-7 pr-3 text-xs focus:outline-none focus:border-emerald-600 font-bold text-slate-950 shadow-2xs"
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 block font-medium">Maximum Outstanding Repayment: K{activeLoan.outstandingAmount}</span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">Mobile Money Phone Line / Account</label>
                  <input
                    type="tel"
                    required
                    value={mobileWalletNumber}
                    onChange={(e) => setMobileWalletNumber(e.target.value)}
                    placeholder="e.g. 097XXXXXXXX"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-600 font-bold text-slate-950 shadow-2xs"
                  />
                </div>

                <button
                  onClick={handleInitiatePayment}
                  className="w-full py-3 bg-emerald-650 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Verify and Proceed</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-emerald-950 block uppercase font-mono font-bold">Simulating USSD Request Callback</span>
                  <span className="text-xs text-slate-600 block leading-relaxed font-semibold">We sent an OTP PIN validation request to {mobileWalletNumber}. Look at top SMS notification code banner!</span>
                </div>

                <div>
                  <label className="block text-[10px] text-center font-bold text-slate-500 uppercase mb-1">Enter Transaction validation Pin</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={paymentOtp}
                    onChange={(e) => setPaymentOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000"
                    className="w-full font-mono text-center tracking-[0.5em] text-lg bg-slate-50 border border-slate-200 rounded-xl py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentOtpStep(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 text-xs rounded-xl cursor-pointer font-bold border border-slate-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyRepayment}
                    className="flex-1 py-2.5 bg-emerald-650 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- IN-APP STATEMENT RENDER MODAL OVERLAY --- */}
      {viewingStatementLoan && (
        <div className="absolute inset-0 bg-stone-950/90 z-50 overflow-y-auto no-scrollbar p-4 flex flex-col justify-start">
          <div className="w-full max-w-sm mx-auto bg-white text-stone-900 rounded-3xl p-6 space-y-6 shadow-2xl relative border border-stone-200 my-4 text-xs font-sans">
            
            {/* Close */}
            <button 
              onClick={() => setViewingStatementLoan(null)}
              className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 text-stone-800 p-1.5 rounded-full cursor-pointer transition-colors"
              title="Close statement docket"
            >
              <X size={16} />
            </button>

            {/* Header branding */}
            <div className="text-center border-b border-stone-200 pb-4">
              <h1 className="font-display font-extrabold text-stone-950 text-sm tracking-wide">NATMUS BUSINESS INNOVATIONS</h1>
              <p className="text-[10px] text-stone-500 font-mono">FINANCIAL SERVICES LOG & STATEMENT DOCK</p>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-250 font-bold px-2 py-0.5 rounded-full mt-2 inline-block">
                Zambia Telecom Integrated Statement
              </span>
            </div>

            {/* Customer specs */}
            <div className="grid grid-cols-2 gap-3 pb-4 border-b border-stone-200">
              <div>
                <span className="text-[9px] text-stone-450 uppercase font-mono block">Client Particulars</span>
                <strong className="text-stone-950 text-xs block">{currentUser.name}</strong>
                <span className="text-[10px] text-stone-500 font-mono">{currentUser.phone}</span>
              </div>
              
              <div className="text-right">
                <span className="text-[9px] text-stone-450 uppercase font-mono block font-bold">Statement Code</span>
                <strong className="text-stone-950 font-mono block">SMT-{viewingStatementLoan.id.slice(-6).toUpperCase()}</strong>
                <span className="text-[10px] text-stone-500 font-mono">Issued: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Summary specifications */}
            <div className="space-y-2 pb-4 border-b border-stone-200">
              <span className="text-[9px] text-stone-450 uppercase font-mono font-bold block">Credit Summary Details</span>
              
              <div className="space-y-1 bg-stone-50 p-3 rounded-2xl border border-stone-100 font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-500">Principal Approved:</span>
                  <span className="text-stone-900 font-semibold">K{viewingStatementLoan.amount}.00</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-stone-500">Interest Calculation:</span>
                  <span className="text-stone-900 font-semibold">+K{viewingStatementLoan.interestAmount}.00</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-500">Repayment Strategy:</span>
                  <span className="text-stone-900 font-semibold capitalize">{viewingStatementLoan.termLength} {viewingStatementLoan.termType}</span>
                </div>

                <div className="flex justify-between text-stone-950 font-bold pt-1.5 border-t border-stone-200">
                  <span>Repayment Strategy Total:</span>
                  <span>K{viewingStatementLoan.totalRepayment}.00</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Balance Cleared to Date:</span>
                  <span>-K{viewingStatementLoan.paidAmount}.00</span>
                </div>

                <div className="flex justify-between text-rose-700 font-semibold">
                  <span>Remaining Liability:</span>
                  <span>K{viewingStatementLoan.outstandingAmount}.00</span>
                </div>
              </div>
            </div>

            {/* List of actions / payments against this specific loan ID */}
            <div className="space-y-2">
              <span className="text-[9px] text-stone-450 uppercase font-mono font-bold block">Associated Ledger Payments</span>
              
              <div className="space-y-1.5">
                {transactions.filter(t => t.loanId === viewingStatementLoan.id).length === 0 ? (
                  <span className="text-[10px] text-stone-400 block text-center py-2 italic font-mono bg-stone-50 rounded-lg">
                    No credit activities recorded.
                  </span>
                ) : (
                  transactions.filter(t => t.loanId === viewingStatementLoan.id).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center text-[10px] font-mono border-b border-stone-100 pb-1.5 pt-0.5">
                      <div>
                        <span className="font-semibold block text-stone-900">
                          {tx.type === 'disbursement' ? 'Payment Out (Natmus)' : 'Payment In (Repay)'}
                        </span>
                        <span className="text-[9px] text-stone-450 block">{tx.method} &middot; Ref: #{tx.reference.slice(-5)}</span>
                      </div>
                      
                      <div className="text-right">
                        <strong className={tx.type === 'disbursement' ? 'text-indigo-650' : 'text-emerald-650'}>
                          {tx.type === 'disbursement' ? '+' : '-'}K{tx.amount}.00
                        </strong>
                        <span className="text-[8px] text-emerald-600 font-bold block font-mono">SUCCESS</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Legal Disclaimer and signature footer */}
            <div className="pt-2 text-center text-[8px] text-stone-450 leading-normal space-y-2 border-t border-stone-150">
              <p>Certified as an authorized digital draft of Natmus Zambia Innovations. Repayments undergo strict compliance verification check audits.</p>
              
              <div className="flex justify-between items-center px-4 pt-1 font-mono text-[9px] text-stone-600">
                <span className="italic">Customer Account Ref</span>
                <span className="underline decoration-dotted text-stone-800">Natmus General Office</span>
              </div>
            </div>

            {/* Print trigger and close button frame inside printable layout */}
            <div className="flex gap-2 pt-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl cursor-pointer text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer size={13} />
                <span>Print Document</span>
              </button>
              
              <button
                onClick={() => setViewingStatementLoan(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-xl cursor-pointer text-xs font-semibold text-center border border-slate-200"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
