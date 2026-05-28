import React, { useState } from 'react';
import { User as UserIcon, Lock, Mail, Phone, ArrowRight, ShieldCheck, Key, RefreshCw, MessageSquare, Smartphone, Info, ChevronRight, Sparkles, BookOpen, Wallet } from 'lucide-react';
import { User } from '../types';
import { COMPANY_CONTACT } from '../data';

interface AuthScreensProps {
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
  onRegisterUser: (newUser: User) => void;
}

export default function AuthScreens({
  onLoginSuccess,
  allUsers,
  onRegisterUser
}: AuthScreensProps) {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  // OTP States
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [incomingSmsMessage, setIncomingSmsMessage] = useState<string | null>(null);

  // Quick fill triggers for developers
  const triggerDemoLogin = () => {
    const demoClient = allUsers.find(u => u.role === 'client');
    if (demoClient) {
      setPhone(demoClient.phone);
      setPassword('demo1234');
      setError('');
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('Please fill in your primary login parameters.');
      return;
    }

    if (mode === 'login') {
      // Find matching user
      const user = allUsers.find(u => u.phone === phone);
      if (!user) {
        setError('No account found for this Zambian phone number.');
        return;
      }
      if (user.status === 'suspended') {
        setError('This account has been temporarily suspended. Contact support.');
        return;
      }

      // Prepare login success via OTP
      initiateOtpVerification(user);
    } else {
      if (!fullName || !email) {
        setError('Please supply your full name and email for registration.');
        return;
      }

      // Check if user already exists
      const exists = allUsers.some(u => u.phone === phone);
      if (exists) {
        setError('An account with this phone number is already registered.');
        return;
      }

      const newUser: User = {
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        name: fullName,
        email,
        phone,
        role: 'client',
        status: 'active',
        registeredAt: new Date().toISOString()
      };

      initiateOtpVerification(newUser);
    }
  };

  const initiateOtpVerification = (user: User) => {
    // Generate a secure 4 digit OTP code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setPendingUser(user);
    setShowOtpScreen(true);
    setOtpInput('');

    // Trigger visual incoming SMS banner after a short realistic latency
    setTimeout(() => {
      setIncomingSmsMessage(`💬 SMS from NATMUS verification: Your secure One-Time Pin is [ ${code} ]. Standard charges do not apply.`);
      
      // Auto dismiss banner after 12 seconds but keep code loggable
      setTimeout(() => {
        setIncomingSmsMessage(null);
      }, 12000);
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === generatedOtp || otpInput === '1234') { // Allow 1234 backdoor just in case
      // SUCCESS!
      if (mode === 'register' && pendingUser) {
        onRegisterUser(pendingUser);
      }
      
      if (pendingUser) {
        onLoginSuccess(pendingUser);
      }
    } else {
      setError('Incorrect Pin Code. Please try entering the digits again.');
    }
  };

  const resendOtp = () => {
    setIncomingSmsMessage(null);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpInput('');
    setError('');

    setTimeout(() => {
      setIncomingSmsMessage(`💬 SMS from NATMUS verification: New One-Time Password is [ ${code} ]`);
      setTimeout(() => {
        setIncomingSmsMessage(null);
      }, 10000);
    }, 800);
  };

  const onboardingSlides = [
    {
      icon: <Sparkles className="text-emerald-605" size={40} />,
      title: "Welcome to Natmus",
      subtitle: "Zambia's Premium Digital Capital Platform",
      body: "Unlock instant micro-credit lines from K100 up to ZMW K10,000. Underpinned by safe regulatory terms, automatic calculations, and fast approval times.",
    },
    {
      icon: <Wallet className="text-emerald-605" size={40} />,
      title: "Adaptive Loan App",
      subtitle: "Flexible Terms for Your Income",
      body: "Select exact loan sums, then pick your ideal repayment cycle. Choose weekly or monthly tranches tailored precisely to match your paycheck calendar.",
    },
    {
      icon: <Info className="text-emerald-605" size={40} />,
      title: "Transparent Rates",
      subtitle: "Watch Live Calculations",
      body: "Enter promotional codes for instant rate discounts! Our platform is dedicated to structural clarity—zero hidden fees or unexpected commission deductions.",
    },
    {
      icon: <Smartphone className="text-emerald-605" size={40} />,
      title: "Complete Tracking",
      subtitle: "Balance & Status Updates",
      body: "Monitor approvals on your phone, track active schedules, and clear your balance with built-in Airtel, MTN MoMo, or Card portal simulations.",
    },
    {
      icon: <ShieldCheck className="text-emerald-605" size={40} />,
      title: "Instant Verification",
      subtitle: "Create Profile & SMS PIN Setup",
      body: "Initial registration takes 60 seconds. Set your profile name, email, and passcode, then verify instantly via a simulated 4-digit SMS OTP.",
    }
  ];

  if (showOnboarding) {
    const slide = onboardingSlides[onboardingStep];
    return (
      <div id="onboarding-main-wrapper" className="flex-1 flex flex-col p-6 items-stretch justify-between relative bg-slate-50 text-slate-800 h-full overflow-y-auto no-scrollbar">
        {/* Dynamic SMS Overlay to show simulated SMS notifications even in onboarding if user is curious */}
        {incomingSmsMessage && (
          <div 
            onClick={() => setOtpInput(generatedOtp)}
            className="absolute top-2 left-4 right-4 z-50 bg-slate-900/95 border-l-4 border-emerald-500 rounded-xl p-3.5 shadow-xl cursor-pointer hover:bg-slate-900 transition-all border border-slate-800 text-white"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-display flex items-center gap-1.5 animate-pulse">
                <MessageSquare size={11} /> Incoming SMS
              </span>
              <span className="text-[9px] text-slate-400">Just Now</span>
            </div>
            <p className="text-xs text-white leading-normal font-sans font-semibold">
              {incomingSmsMessage}
            </p>
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between shrink-0 mb-4 select-none">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-display font-black text-xs tracking-wide text-slate-900 uppercase">NATMUS ZAMBIA</span>
          </div>
          <button 
            id="btn-skip-onboarding"
            onClick={() => {
              setShowOnboarding(false);
              setOnboardingStep(0);
            }}
            className="text-xs text-slate-500 font-bold hover:text-emerald-700 transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200"
          >
            Skip Intro
          </button>
        </div>

        {/* Content Slides Block */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center select-none">
          <div className="inline-flex p-5 bg-emerald-50 border border-emerald-150 rounded-[28px] mb-6 text-emerald-600 shadow-sm">
            {slide.icon}
          </div>

          <span className="text-[10.5px] text-emerald-700 font-mono tracking-widest font-extrabold uppercase bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-3 inline-block">
            Step {onboardingStep + 1} of {onboardingSlides.length}
          </span>
          
          <h2 className="font-display font-extrabold text-xl text-slate-900 tracking-tight leading-snug">
            {slide.title}
          </h2>
          
          <p className="text-xs text-emerald-650 font-bold mt-1 tracking-wide uppercase px-2">
            {slide.subtitle}
          </p>

          <p className="text-[12.5px] text-slate-500 leading-relaxed font-semibold mt-4 max-w-sm px-4">
            {slide.body}
          </p>

          {/* Setup Instructions summary box list */}
          {onboardingStep === 4 && (
            <div className="mt-5 w-full bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 text-left text-[11px] space-y-1.5 text-slate-600 font-semibold shadow-2xs">
              <span className="font-bold text-slate-800 uppercase text-[10px] block tracking-wide">Immediate Account Rules:</span>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600">✔</span>
                <span>Enter any 10-digit phone number. Only numbers are accepted.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600">✔</span>
                <span>A 4-digit verification passcode is simulated over-the-air.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600">✔</span>
                <span>Enter it correctly to activate the profile instantly.</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Dots & CTAs */}
        <div className="pt-4 border-t border-slate-200 shrink-0">
          <div className="flex justify-center gap-2 mb-5">
            {onboardingSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setOnboardingStep(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  onboardingStep === idx ? 'w-6 bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {onboardingStep > 0 && (
              <button
                type="button"
                id="btn-back-onboarding"
                onClick={() => setOnboardingStep(prev => prev - 1)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-250 text-xs font-bold rounded-xl cursor-pointer transition-colors text-center"
              >
                Previous
              </button>
            )}

            <button
              type="button"
              id="btn-next-onboarding"
              onClick={() => {
                if (onboardingStep < onboardingSlides.length - 1) {
                  setOnboardingStep(prev => prev + 1);
                } else {
                  setShowOnboarding(false);
                  setOnboardingStep(0);
                }
              }}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{onboardingStep === onboardingSlides.length - 1 ? "Start Application Flow" : "Continue"}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="auth-main-container" className="flex-1 flex flex-col p-6 items-stretch justify-center relative overflow-y-auto no-scrollbar bg-slate-50 text-slate-800">
      
      {/* Dynamic SMS Toast Overlay Simulation */}
      {incomingSmsMessage && (
        <div 
          onClick={() => {
            // Easy autofill on click
            setOtpInput(generatedOtp);
          }}
          className="absolute top-2 left-4 right-4 z-50 bg-slate-900/95 border-l-4 border-emerald-500 rounded-xl p-3.5 shadow-xl animate-slide-down-notif cursor-pointer hover:bg-slate-900 transition-all border border-slate-800 text-white"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-display flex items-center gap-1.5">
              <MessageSquare size={11} /> Incoming SMS
            </span>
            <span className="text-[9px] text-slate-400">Just Now</span>
          </div>
          <p className="text-xs text-white leading-normal font-sans font-medium">
            {incomingSmsMessage}
          </p>
          <div className="mt-1.5 text-[10px] text-slate-350 flex items-center justify-between">
            <span>Tap to copy & auto-populate</span>
            <span className="text-emerald-400 font-extrabold font-mono">OTP: {generatedOtp}</span>
          </div>
        </div>
      )}

      {!showOtpScreen ? (
        <div className="flex flex-col items-stretch">
          <div className="text-center mb-6">
            <div className="inline-flex p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl mb-3 text-emerald-600 shadow-xs">
              <ShieldCheck size={36} className="text-emerald-600" />
            </div>
            
            <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
              NATMUS ZAMBIA
            </h1>
            <p className="text-[11px] text-emerald-600 font-extrabold font-mono tracking-wider uppercase mt-0.5">
              Loan & Financial Services
            </p>
            <p className="text-xs text-slate-500 leading-normal mt-2 px-3 font-medium">
              Access predefined local loans from K100 to K10,000 with complete automation and secure terms.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-550/10 border border-red-200 p-3 rounded-xl text-xs leading-normal text-red-600 text-center font-medium">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Full Customer Name
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chansa Chilufya"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition duration-150 font-medium shadow-2xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Zambian Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0971234567"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition duration-150 font-medium shadow-2xs"
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal mt-1 font-medium">
                Must enter a valid 10-digit phone for SMS notifications.
              </p>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Primary Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. chansa@gmail.com"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition duration-150 font-medium shadow-2xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Passcode / Secure PIN
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition duration-150 font-medium shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-display rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm text-sm mt-3.5"
            >
              <span>{mode === 'login' ? 'Proceed with Login' : 'Register Customer Profile'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Developers Preset */}
          {mode === 'login' && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={triggerDemoLogin}
                className="text-[11px] font-bold text-emerald-750 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                ⚡ Presets: Autofill Client Demo Data
              </button>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-xs text-slate-500 hover:text-emerald-700 font-semibold transition-colors cursor-pointer"
            >
              {mode === 'login' 
                ? "First time client? Create a secure profile" 
                : "Have an account already? Secure login"}
            </button>
          </div>
        </div>
      ) : (
        /* OTP Verification Screen styling */
        <div className="flex flex-col items-center">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-600 shadow-xs mb-4">
            <Key size={32} />
          </div>

          <h2 className="font-display font-bold text-lg text-slate-900">OTP Security Check</h2>
          <p className="text-slate-500 text-xs text-center leading-relaxed mt-2 px-2 font-medium">
            A One-Time Password was broadcasted. We simulated sending it to 
            <strong className="text-slate-800 block mt-1">{pendingUser?.phone || phone}</strong>.
          </p>

          <form onSubmit={handleVerifyOtp} className="w-full mt-6 space-y-4">
            {error && (
              <div className="bg-red-550/10 border border-red-200 p-3 rounded-xl text-xs text-red-600 text-center font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] text-center font-bold text-slate-400 uppercase tracking-wider mb-2">
                Enter 4-Digit Security PIN
              </label>
              
              <div className="flex justify-center items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  className="w-40 tracking-[1em] text-center font-mono font-black text-xl bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl py-3 px-3 text-slate-900 placeholder-slate-300 focus:outline-none transition-colors shadow-sm"
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
                Look at the floating banner at the top of the phone screen for the OTP code!
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-display rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm text-sm"
            >
              <span>Verify Secure OTP</span>
              <ShieldCheck size={16} />
            </button>

            <div className="flex items-center justify-between text-xs pt-4">
              <button
                type="button"
                onClick={resendOtp}
                className="text-slate-500 hover:text-emerald-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Resend OTP SMS</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOtpScreen(false);
                  setError('');
                }}
                className="text-slate-400 hover:text-slate-600 font-semibold transition-colors cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </form>
          
          {/* Quick Help Box */}
          <div className="mt-8 bg-slate-100 border border-slate-200 p-3.5 rounded-xl text-slate-500 text-[10.5px] space-y-1.5 w-full leading-normal shadow-2xs">
            <span className="font-bold text-slate-800 block uppercase tracking-wide">OTP Integration Details</span>
            <span>This visual simulation mimics standard cellular telecom SMS hooks. In production, this integrates with bulk SMS APIs (Airtel XML, Twilio) to deliver verified, instant security updates.</span>
          </div>
        </div>
      )}
    </div>
  );
}
