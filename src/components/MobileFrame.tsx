import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, User, RefreshCw, Smartphone, Laptop } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  activeRole: 'client' | 'admin';
  onChangeRole: (role: 'client' | 'admin') => void;
  onResetData: () => void;
}

export default function MobileFrame({
  children,
  activeRole,
  onChangeRole,
  onResetData
}: MobileFrameProps) {
  const [deviceTime, setDeviceTime] = useState('12:00');
  const [isMobileView, setIsMobileView] = useState(false);

  // Sync simulated phone clock with actual hours and minutes
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setDeviceTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start p-2 sm:p-6 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Dev Control Bar */}
      <div id="dev-controller" className="w-full max-w-sm mb-4 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-display font-bold text-xs tracking-wide text-slate-900 uppercase">NATMUS SYSTEM CONTROLS</span>
          </div>
          <button
            id="reset-simulation-data"
            onClick={onResetData}
            title="Reset Simulation Data to Defaults"
            className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-red-600 transition-colors bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md border border-slate-200"
          >
            <RefreshCw size={10} />
            <span className="font-semibold">Reset Demo Dataset</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            id="switch-client-persona"
            onClick={() => onChangeRole('client')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 ${
              activeRole === 'client'
                ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <User size={13} />
            <span>Client Platform</span>
          </button>
          
          <button
            id="switch-admin-persona"
            onClick={() => onChangeRole('admin')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 ${
              activeRole === 'admin'
                ? 'bg-slate-950 text-white font-extrabold shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Shield size={13} />
            <span>Administrator View</span>
          </button>
        </div>

        <p className="text-[10.5px] text-center text-slate-500 leading-normal border-t border-slate-100 pt-2 font-medium">
          Testing Persona: <strong className={activeRole === 'admin' ? 'text-slate-900 font-extrabold' : 'text-emerald-700 font-extrabold'}>
            {activeRole === 'admin' ? 'System Administrator Console' : 'Premium Client (Chansa Chilufya)'}
          </strong>
        </p>
      </div>

      {/* Main Body Frame */}
      <div 
        id="phone-device-container"
        className={`w-full max-w-md bg-white border-[10px] border-slate-950 rounded-[50px] shadow-[0_20px_50px_rgba(15,23,42,0.12)] flex flex-col overflow-hidden relative ${
          isMobileView ? 'md:max-w-full md:border-0 md:rounded-none h-screen' : 'h-[812px]'
        } transition-all duration-500`}
      >
        
        {/* Dynamic Mobile Bezel & Notch */}
        <div id="phone-notch-header" className="h-6 bg-slate-950 flex items-center justify-between px-6 text-[11px] font-bold tracking-wide text-slate-400 shrink-0 select-none relative">
          <span className="font-sans font-extrabold text-white">{deviceTime}</span>
          
          {/* Dynamic Speaker Notch */}
          <div className="w-20 h-4 bg-slate-950 border border-slate-900 rounded-b-xl absolute left-1/2 transform -translate-x-1/2 top-0 flex items-center justify-center gap-1 z-50">
            <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-850 rounded-full"></div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Cellular Service Icon */}
            <div className="flex items-end gap-[1px] h-2">
              <span className="w-[1.5px] h-[3px] bg-emerald-400 rounded-sm"></span>
              <span className="w-[1.5px] h-[4px] bg-emerald-400 rounded-sm"></span>
              <span className="w-[1.5px] h-[6px] bg-emerald-400 rounded-sm"></span>
              <span className="w-[1.5px] h-[7px] bg-emerald-400 rounded-sm"></span>
              <span className="w-[1.5px] h-[8px] bg-emerald-400 rounded-sm"></span>
            </div>
            <span className="text-[10px] text-emerald-400 font-extrabold">5G</span>
            
            {/* Battery Indicator */}
            <div className="w-5 h-2.5 border border-slate-600 rounded-sm p-[1px] flex items-center relative">
              <div className="h-full bg-emerald-400 w-4/5 rounded-sm"></div>
              <div className="w-[1px] h-1 bg-slate-600 rounded-r absolute -right-[2px] top-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Scrollable app screen container */}
        <div id="phone-app-screen" className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
          {children}
        </div>
        
        {/* PWA Home Gestural Line indicator */}
        <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0 w-full select-none pb-1">
          <div className="w-24 h-1 bg-slate-700 rounded-full"></div>
        </div>
      </div>

      {/* Developer viewport resizing switcher */}
      <div className="mt-4 hidden md:flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1 font-medium bg-white/60 border border-slate-200/60 px-3 py-1.5 rounded-full shadow-sm">
          <Smartphone size={14} className="text-emerald-600" /> High-Density simulated smart phone platform
        </span>
      </div>
    </div>
  );
}
