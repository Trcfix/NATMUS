import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check, HelpCircle, X, ExternalLink, RefreshCw } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Detect if running in standalone PWA mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      setShowPrompt(false);
    }

    // Capture standard install trigger
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) {
    if (isInstalled) {
      return (
        <div id="pwa-installed-banner" className="bg-emerald-50 border-b border-emerald-200 p-2.5 px-4 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="font-semibold">Standalone PWA Mode Enabled</span>
          </div>
          <span className="text-[10px] bg-emerald-650 px-1.5 py-0.5 rounded text-white font-extrabold uppercase font-mono">ONLINE</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div id="pwa-install-dialog" className="bg-slate-900 border-b border-slate-800 p-4 transition-all duration-300 relative">
      <button 
        onClick={() => setShowPrompt(false)} 
        className="absolute top-2 right-2 text-slate-400 hover:text-white cursor-pointer"
        title="Hide"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
          <Smartphone size={24} className="animate-bounce" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-bold text-sm text-white tracking-tight">
            Install Natmus Zambia App
          </h4>
          <p className="text-xs text-slate-300 leading-normal mt-0.5">
            Add to your Home Screen for offline access, fast load-times, and instant loan notification delivery!
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {deferredPrompt ? (
              <button
                onClick={handleNativeInstall}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                <Download size={13} />
                <span>Install Instantly</span>
              </button>
            ) : null}

            <div className="w-full mt-2 text-[11px] text-slate-400 bg-slate-950/90 rounded-lg p-2.5 border border-slate-800 leading-relaxed">
              {platform === 'ios' ? (
                <span>
                  <strong>For iOS Safari:</strong> Tap the <span className="font-bold text-slate-200">Share</span> icon (square with up arrow), scroll down, and tap <strong className="text-emerald-400">"Add to Home Screen"</strong>.
                </span>
              ) : platform === 'android' ? (
                <span>
                  <strong>For Android:</strong> Tap Chrome's <span className="font-bold text-slate-200 font-mono">menu (3 dots)</span> at top-right and select <strong className="text-emerald-400">"Install App"</strong> or <strong className="text-emerald-400">"Add to Home Screen"</strong>.
                </span>
              ) : (
                <span>
                  <strong>To Install:</strong> Use a supported mobile browser like Safari or Chrome, then tap <span className="text-emerald-400">"Install App"</span> or <span className="text-emerald-400">"Add to Home Screen"</span> to save KBs of storage!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
