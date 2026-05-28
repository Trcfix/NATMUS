import React, { useState } from 'react';
import { 
  Shield, Users, CheckCircle2, XCircle, RefreshCw, AlertCircle, TrendingUp, 
  Sparkles, FileClock, Phone, Megaphone, Trash2, Check, X, Tag, Plus, MessageSquare, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';
import { User, Loan, Transaction, PromoCode, SystemMessage, Notification } from '../types';
import { calculateInterest, generateReference, INITIAL_PROMO_CODES } from '../data';

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  loans: Loan[];
  transactions: Transaction[];
  promoCodes: PromoCode[];
  systemMessages: SystemMessage[];
  onToggleUserStatus: (userId: string) => void;
  onApproveLoan: (loanId: string) => void;
  onRejectLoan: (loanId: string) => void;
  onForceCompleteLoan: (loanId: string) => void;
  onAddPromoCode: (newPromo: PromoCode) => void;
  onDeletePromoCode: (code: string) => void;
  onSendBulkMessage: (title: string, body: string, channel: 'SMS' | 'Email' | 'WhatsApp' | 'Facebook') => void;
}

export default function AdminDashboard({
  currentUser,
  allUsers,
  loans,
  transactions,
  promoCodes,
  systemMessages,
  onToggleUserStatus,
  onApproveLoan,
  onRejectLoan,
  onForceCompleteLoan,
  onAddPromoCode,
  onDeletePromoCode,
  onSendBulkMessage
}: AdminDashboardProps) {
  // Navigation Tabs: 'approvals' | 'users' | 'transactions' | 'promos' | 'broadcasts'
  const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'transactions' | 'promos' | 'broadcasts'>('approvals');

  // New Promo Form State
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('20');
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [newPromoExpiry, setNewPromoExpiry] = useState('2026-12-31');
  const [promoFormSuccess, setPromoFormSuccess] = useState('');

  // Bulk Message State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastChannel, setBroadcastChannel] = useState<'SMS' | 'Email' | 'WhatsApp' | 'Facebook'>('SMS');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Stats Counters
  const pendingCount = loans.filter(l => l.status === 'Pending').length;
  const portfolioSum = loans.filter(l => l.status === 'In Progress').reduce((sum, curr) => sum + curr.outstandingAmount, 0);
  const totalCollected = transactions.filter(t => t.type === 'payment').reduce((sum, curr) => sum + curr.amount, 0);
  
  // Submit handlers
  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoFormSuccess('');
    
    if (!newPromoCode) return;

    const codeExists = promoCodes.some(p => p.code.toUpperCase() === newPromoCode.toUpperCase());
    if (codeExists) {
      alert('This promo code is already created.');
      return;
    }

    const created: PromoCode = {
      code: newPromoCode.toUpperCase().replace(/\s+/g, ''),
      discountPercent: parseInt(newPromoDiscount),
      description: newPromoDesc || `Get ${newPromoDiscount}% off loan interest fees.`,
      active: true,
      expiryDate: newPromoExpiry
    };

    onAddPromoCode(created);
    setNewPromoCode('');
    setNewPromoDesc('');
    setPromoFormSuccess(`Promo Code ${created.code} successfully deployed.`);
    setTimeout(() => setPromoFormSuccess(''), 4000);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) return;

    onSendBulkMessage(broadcastTitle, broadcastBody, broadcastChannel);
    setBroadcastTitle('');
    setBroadcastBody('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  return (
    <div id="admin-screen-wrapper" className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 text-slate-800">
      
      {/* Admin Title Head */}
      <header className="px-5 py-3.5 bg-slate-900 border-b border-slate-850 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1 px-1.5 bg-slate-800 border border-slate-750 text-slate-200 rounded-lg shadow-2xs">
            <Shield size={15} />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xs tracking-wide text-white uppercase">NATMUS ADMINISTRATOR</h2>
            <span className="text-[9px] text-slate-400 font-bold font-mono block">Terminal Console v2.0</span>
          </div>
        </div>

        <span className="text-[10px] bg-slate-800 text-slate-200 font-bold font-mono px-2.5 py-1 rounded-lg border border-slate-700 shadow-sm uppercase tracking-wider">
          Admin Authorized
        </span>
      </header>

      {/* Admin stats dashboard strip banner */}
      <section className="bg-slate-900/95 border-b border-slate-850 px-4 py-3 shrink-0 grid grid-cols-3 gap-2 text-center text-slate-350">
        <div>
          <span className="text-[8px] text-slate-400 font-bold uppercase block">Pending Approvals</span>
          <span className={`text-sm font-bold font-mono block ${pendingCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
            {pendingCount} Loans
          </span>
        </div>
        <div>
          <span className="text-[8px] text-slate-400 font-bold uppercase block">Active Portfolio</span>
          <span className="text-sm font-bold text-emerald-400 font-mono block">
            K{portfolioSum} ZMW
          </span>
        </div>
        <div>
          <span className="text-[8px] text-slate-400 font-bold uppercase block">Repay Collections</span>
          <span className="text-sm font-bold text-sky-400 font-mono block">
            K{totalCollected} ZMW
          </span>
        </div>
      </section>

      {/* Primary Application Body */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">

        {/* Tab 1: Approvals management of applications */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            
            {/* List of pending loan approvals */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-500 block">
                Required Loan Authorizations ({loans.filter(l => l.status === 'Pending').length})
              </span>

              {loans.filter(l => l.status === 'Pending').length === 0 ? (
                <div className="bg-stone-900/60 border border-stone-850 p-6 rounded-2xl text-center space-y-2 text-stone-500">
                  <CheckCircle2 size={24} className="mx-auto text-stone-600" />
                  <p className="text-xs">No pending micro credit applications present.</p>
                  <p className="text-[10px] text-stone-600">All customer submissions are evaluated.</p>
                </div>
              ) : (
                loans.filter(l => l.status === 'Pending').map(loan => {
                  const loanUser = allUsers.find(u => u.id === loan.userId) || { name: 'Unknown Client', phone: '097XXXXXXX' };
                  return (
                    <div key={loan.id} className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3 shadow-md">
                      
                      {/* Customer Summary header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-stone-200 text-xs block">{loanUser.name}</strong>
                          <span className="text-[10px] text-stone-500 font-mono block">{loanUser.phone}</span>
                        </div>
                        <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                          PENDING
                        </span>
                      </div>

                      {/* Loan Request statistics details */}
                      <div className="grid grid-cols-2 gap-2 bg-stone-950/50 p-2.5 rounded-xl text-[11px] font-mono border border-stone-900">
                        <div>
                          <span className="text-stone-500 block">Principal Amount:</span>
                          <span className="text-stone-200 font-bold text-sm">K{loan.amount}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Total Repayment:</span>
                          <span className="text-emerald-400 font-bold text-sm">K{loan.totalRepayment}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Terms duration:</span>
                          <span className="text-stone-300 capitalize">{loan.termLength} {loan.termType}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Interest Weight:</span>
                          <span className="text-amber-500">K{loan.interestAmount} (+{loan.interestRate * 100}%)</span>
                        </div>
                      </div>

                      {/* Client KYC & Reference Declaration Verification */}
                      <div className="bg-stone-950/60 border border-stone-850 p-3 rounded-xl space-y-2 text-xs leading-relaxed">
                        <span className="block text-[9px] font-bold text-amber-500 uppercase tracking-widest pb-1 border-b border-stone-850">
                          Employment & reference coordinates
                        </span>
                        
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10.5px]">
                          <div>
                            <span className="text-stone-500 block text-[9.3px] uppercase font-bold">Revenue Source:</span>
                            <span className="text-stone-300 font-semibold font-sans">
                              {loan.incomeSource === 'salaried' ? '💼 Salaried Job' : 
                               loan.incomeSource === 'business' ? '🏪 Own Enterprise' : 
                               loan.incomeSource === 'informal' ? '🔨 Informal / Trade' : loan.incomeSource || 'Unspecified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[9.3px] uppercase font-bold">Workplace / Shop:</span>
                            <span className="text-stone-300 font-semibold font-sans truncate block">
                              {loan.employerName || 'Not Declared'}
                            </span>
                          </div>
                          <div className="col-span-2 mt-1">
                            <span className="text-stone-500 block text-[9.3px] uppercase font-bold">Loan Purpose Reason:</span>
                            <span className="text-stone-300 font-semibold font-sans">
                              {loan.loanReason === 'business' ? '💼 Business Capital Expansion' :
                               loan.loanReason === 'education' ? '🎓 School / College Fees' :
                               loan.loanReason === 'medical' ? '🩺 Urgent Medical Care' :
                               loan.loanReason === 'agriculture' ? '🌱 Farm & Agri Inputs' : loan.loanReason || 'General Personal assistance'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-850/65 grid grid-cols-2 gap-x-2 text-[10.5px]">
                          <div className="col-span-2 text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                            Emergency Kin reference
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[8.5px] uppercase">Declared Name:</span>
                            <span className="text-stone-300 font-semibold font-sans">{loan.nextOfKinName || 'Not Provided'}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[8.5px] uppercase">Direct Cell Line:</span>
                            <span className="text-stone-400 font-mono font-semibold">{loan.nextOfKinPhone || 'Not Provided'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Approval triggers */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onRejectLoan(loan.id)}
                          className="flex-1 py-2.5 bg-stone-850 hover:bg-stone-800 hover:text-red-400 border border-stone-800 text-xs font-semibold text-stone-400 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
                        >
                          <XCircle size={13} />
                          <span>Reject Application</span>
                        </button>

                        <button
                          onClick={() => onApproveLoan(loan.id)}
                          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold font-display rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-md"
                        >
                          <CheckCircle2 size={13} />
                          <span>Approve & Disburse</span>
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Active Portfolios Override state management */}
            <div className="space-y-3 pt-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-stone-500 block">
                Active Client Portfolios ({loans.filter(l => l.status === 'In Progress').length})
              </span>

              {loans.filter(l => l.status === 'In Progress').length === 0 ? (
                <div className="bg-stone-900/30 border border-stone-850/60 p-5 rounded-2xl text-center text-xs text-stone-600">
                  No active loan agreements are currently running.
                </div>
              ) : (
                loans.filter(l => l.status === 'In Progress').map(loan => {
                  const loanUser = allUsers.find(u => u.id === loan.userId) || { name: 'Unknown client' };
                  return (
                    <div key={loan.id} className="bg-stone-900/70 border border-stone-850 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-stone-200">{loanUser.name}</strong>
                          <span className="text-[9px] bg-teal-950 text-emerald-400 px-1 py-0.2 rounded font-mono font-bold uppercase">Active</span>
                        </div>
                        <span className="text-[10px] text-stone-550 block font-mono">
                          Liability: K{loan.outstandingAmount} outstanding (ZMW K{loan.totalRepayment} max)
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const conf = window.confirm(`Mark loan #${loan.id.slice(-5)} as Completed (Paid Fully)? This generates a forced completion receipt transaction.`);
                          if (conf) onForceCompleteLoan(loan.id);
                        }}
                        className="py-1.5 px-3 bg-emerald-600/10 hover:bg-emerald-500 hover:text-stone-950 border border-emerald-500/20 text-emerald-400 font-bold rounded-lg text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer"
                      >
                        Force Pay-off
                      </button>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* Tab 2: User management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-500 block">
              Registered Clients Database ({allUsers.filter(u => u.role === 'client').length})
            </span>

            <div className="space-y-2.5">
              {allUsers.filter(u => u.role === 'client').map(user => {
                const userActiveLoan = loans.find(l => l.userId === user.id && l.status === 'In Progress');
                const userPendingLoan = loans.find(l => l.userId === user.id && l.status === 'Pending');
                
                return (
                  <div key={user.id} className="bg-stone-900 border border-stone-800 p-3.5 rounded-2xl space-y-3 text-xs shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <strong className="text-stone-200 text-sm block">{user.name}</strong>
                        <span className="text-[10px] text-stone-500 font-mono">{user.phone} &middot; {user.email}</span>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          user.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                        }`}>
                          {user.status === 'active' ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                        <span className="text-[9px] text-stone-600 font-mono">Reg: {new Date(user.registeredAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Quick activity tag */}
                    <div className="bg-stone-950/40 p-2 rounded-xl text-[10px] text-stone-400 flex items-center justify-between">
                      <span>Recent Activities:</span>
                      <span className="font-mono text-stone-300 font-semibold">
                        {userActiveLoan ? `Active Loan (Outstanding K${userActiveLoan.outstandingAmount})` : 
                         userPendingLoan ? 'Awaiting Loan approval request' : 'No liability current'}
                      </span>
                    </div>

                    {/* Suspended toggle actions */}
                    <div className="flex justify-end gap-2 text-[10px]">
                      <button
                        onClick={() => onToggleUserStatus(user.id)}
                        className={`px-3 py-1.5 rounded-lg border font-mono uppercase font-bold tracking-wider cursor-pointer transition-colors ${
                          user.status === 'active' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-stone-950' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-stone-950'
                        }`}
                      >
                        {user.status === 'active' ? 'Suspend Customer' : 'Activate Customer'}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Transactions logger ledger */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-500 block">
              Core Financial Transaction Stream
            </span>

            <div className="space-y-2.5">
              {transactions.length === 0 ? (
                <div className="text-center py-10 bg-stone-900/10 border border-stone-850 rounded-2xl text-stone-600 text-xs">
                  No automated transaction logs registered yet.
                </div>
              ) : (
                [...transactions].reverse().map(tx => {
                  const txUser = allUsers.find(u => u.id === tx.userId) || { name: 'Unknown Customer' };
                  return (
                    <div key={tx.id} className="bg-stone-900 border border-stone-850 p-3 rounded-xl flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.type === 'disbursement' ? 'bg-indigo-950 text-indigo-400' : 'bg-emerald-950 text-emerald-400'}`}>
                          {tx.type === 'disbursement' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-stone-200">{txUser.name}</strong>
                            <span className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wide ${
                              tx.type === 'disbursement' ? 'bg-indigo-950 text-indigo-400' : 'bg-emerald-950 text-emerald-400'
                            }`}>
                              {tx.type === 'disbursement' ? 'DISBURSE' : 'COLLECTION'}
                            </span>
                          </div>

                          <span className="text-[10px] text-stone-500 block font-mono">
                            {tx.method} &bull; {new Date(tx.timestamp).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-stone-600 font-mono">Ref: {tx.reference}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-bold block ${tx.type === 'disbursement' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                          {tx.type === 'disbursement' ? '+' : '-'}K{tx.amount}
                        </span>
                        <span className="text-[8px] text-emerald-400 font-bold block font-mono">Success</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Promo Codes manager */}
        {activeTab === 'promos' && (
          <div className="space-y-4 animate-fade-in">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-500 block">
              Coupons & Promo Codes Management
            </span>

            {/* Create Promo Code form */}
            <form onSubmit={handleCreatePromo} className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3.5 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block pb-1 border-b border-stone-850">
                Deploy New Promo Code
              </span>

              {promoFormSuccess && (
                <div className="bg-emerald-950/40 border border-emerald-900/50 p-2 text-center text-xs text-emerald-400 rounded-lg">
                  {promoFormSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-500 uppercase mb-1">Promo Code Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SPECIAL30"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-stone-500 uppercase mb-1">Discount % on Interest</label>
                  <select
                    value={newPromoDiscount}
                    onChange={(e) => setNewPromoDiscount(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:outline-none"
                  >
                    <option value="10">10% Off</option>
                    <option value="20">20% Off</option>
                    <option value="30">30% Off</option>
                    <option value="50">50% Off</option>
                    <option value="100">100% Interest Free</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 uppercase mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Save 30% interest fee on monthly term loans"
                  value={newPromoDesc}
                  onChange={(e) => setNewPromoDesc(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Create & Deploy Voucher
                </button>
              </div>
            </form>

            {/* List of current promo codes */}
            <div className="space-y-2">
              <span className="text-[11px] text-stone-500 uppercase block">Active Promos Desk</span>
              {promoCodes.map(promo => (
                <div key={promo.code} className="bg-stone-900/80 border border-stone-850 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                      <Tag size={14} />
                    </div>
                    <div>
                      <strong className="text-emerald-400 font-mono font-bold">{promo.code}</strong>
                      <span className="text-stone-500 text-[10px] block">{promo.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-stone-200 font-bold font-mono bg-stone-950 px-2 py-0.5 rounded">
                      -{promo.discountPercent}%
                    </span>

                    <button
                      onClick={() => {
                        const conf = window.confirm(`Permanently expire the promotional coupon ${promo.code}?`);
                        if (conf) onDeletePromoCode(promo.code);
                      }}
                      className="p-1.5 text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete code"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Bulk announcement broadcast center */}
        {activeTab === 'broadcasts' && (
          <div className="space-y-4 animate-fade-in">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-500 block">
              Bulk Broadcast Notification Center
            </span>

            {/* Broadcast Creation form */}
            <form onSubmit={handleBroadcast} className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-4 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block pb-1 border-b border-stone-850">
                Trigger Campaign Broadcast
              </span>

              {broadcastSuccess && (
                <div className="bg-emerald-950/40 border border-emerald-950/50 p-2 text-center text-xs text-emerald-400 rounded-lg">
                  Announcements successfully pushed to all clients!
                </div>
              )}

              <div>
                <label className="block text-[10px] text-stone-500 uppercase mb-1">Broadcast Media / Channel</label>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-[9px] text-stone-300">
                  {[
                    { label: 'SMS Carrier', value: 'SMS' },
                    { label: 'WhatsApp', value: 'WhatsApp' },
                    { label: 'Email Box', value: 'Email' },
                    { label: 'Facebook', value: 'Facebook' }
                  ].map((chan) => (
                    <button
                      key={chan.value}
                      type="button"
                      onClick={() => setBroadcastChannel(chan.value as any)}
                      className={`py-1.5 text-center border rounded-lg cursor-pointer transition-colors ${
                        broadcastChannel === chan.value 
                          ? 'bg-amber-600 border-amber-500 text-stone-950 font-bold' 
                          : 'border-stone-800 text-stone-450 bg-stone-950'
                      }`}
                    >
                      {chan.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 uppercase mb-1">Campaign Header Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lower Monthly Term Interest Rate!"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 uppercase mb-1">Message Body Text</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Natmus Zambia is dropping monthly interest rate fees! Apply now for cash advance liquidity. Offer expires in 48 hours."
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:outline-none resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Megaphone size={13} />
                <span>Publish Bulk Broadcaster Campaign</span>
              </button>
            </form>

            {/* Broadcast logs history */}
            <div className="space-y-2.5">
              <span className="text-[11px] text-stone-500 uppercase block">Historical Campaigns broadcasted</span>
              {systemMessages.map(msg => (
                <div key={msg.id} className="bg-stone-900 border border-stone-850 p-3.5 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-stone-200">{msg.title}</strong>
                    <span className="text-[9px] bg-stone-950 px-2 py-0.5 rounded font-mono text-stone-500">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-stone-400 font-sans leading-normal">
                    {msg.body}
                  </p>

                  <div className="flex justify-between items-center text-[9px] text-stone-500 font-mono pt-1.5 border-t border-stone-850">
                    <span>Channel: <strong className="text-emerald-400 uppercase">{msg.channel}</strong></span>
                    <span>Broadcasting dispatch count: {msg.recipientsCount} customers</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* Admin navigation bar Footer */}
      <footer className="h-16 bg-slate-900 border-t border-slate-850 grid grid-cols-5 text-center shrink-0 select-none pb-1 pb-safe">
        
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'approvals' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 size={18} />
          <span className="text-[9px] tracking-tight">Approvals</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'users' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users size={18} />
          <span className="text-[9px] tracking-tight">Customers</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'transactions' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileClock size={18} />
          <span className="text-[9px] tracking-tight">Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('promos')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'promos' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tag size={18} />
          <span className="text-[9px] tracking-tight truncate font-bold">Promo</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'broadcasts' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone size={18} />
          <span className="text-[9px] tracking-tight text-center">Broadcast</span>
        </button>

      </footer>

    </div>
  );
}
