import { useState, useEffect } from "react";
import { registerSW } from "virtual:pwa-register";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, RefreshCw, X } from "lucide-react";

/**
 * Premium PWA Update Prompt
 * Handles service worker updates with a high-end UI
 */
export const PWAPrompt = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  const updateServiceWorker = registerSW({
    onNeedRefresh() {
      setNeedRefresh(true);
    },
    onOfflineReady() {
      setOfflineReady(true);
      setTimeout(() => setOfflineReady(false), 5000);
    },
  });

  const close = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 duration-500">
      <Card className="border-2 border-primary/20 shadow-2xl bg-white/95 backdrop-blur-xl w-[320px] overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <div className="bg-primary/10 p-4 flex items-center justify-between border-b border-primary/5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">System Pulse</p>
            </div>
            <button onClick={close} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {offlineReady ? (
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                <span className="text-emerald-600">Sync Complete!</span> KrushiRath is now available offline for mission-critical operations.
              </p>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-600 leading-relaxed">
                  <span className="text-primary">New Intelligence Update.</span> New features and performance protocols are ready for initialization.
                </p>
                <Button 
                  onClick={() => updateServiceWorker(true)}
                  className="w-full h-12 font-black rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                >
                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  Initialize Reload
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
