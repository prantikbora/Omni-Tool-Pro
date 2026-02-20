"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode"; 
import { SCANNER_CONFIG, isURL } from "./scanner-utils";
import { saveToHistory } from "./history-utils";
import { ExternalLink, Copy, RefreshCw, Share2 } from "lucide-react";

export default function Scanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Logic: Initialization delay prevents race conditions on page refresh
    const initTimeout = setTimeout(() => {
      const container = document.getElementById("scanner-view");
      
      if (container && !scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner("scanner-view", SCANNER_CONFIG, false);
        
        scannerRef.current.render(
          (text) => {
            setScanResult(text);
            saveToHistory(text, "scan");
            if (navigator.vibrate) navigator.vibrate(100);
          },
          (error) => { /* Ignore frame-by-frame errors */ }
        );
      }
    }, 150); // 150ms is the "sweet spot" for React to finish painting the DOM

    return () => {
      clearTimeout(initTimeout);
      if (scannerRef.current) {
        scannerRef.current.clear()
          .then(() => {
            scannerRef.current = null;
          })
          .catch((err) => console.warn("Scanner cleanup failed:", err));
      }
    };
  }, []);

  const shareData = async () => {
    if (!scanResult) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Scanned Result",
          text: scanResult,
          url: isURL(scanResult) ? scanResult : undefined,
        });
      } catch (err) { console.error("Share failed:", err); }
    } else {
      navigator.clipboard.writeText(scanResult);
      alert("Result copied to clipboard.");
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto w-full">
      {/* We add a min-height to prevent layout collapse before the camera loads */}
      <div 
        id="scanner-view" 
        className="w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner min-h-[300px] bg-zinc-100 dark:bg-zinc-900" 
      />

      {scanResult && (
        <div className="mt-4 p-4 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl w-full shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Scan Result</span>
            {isURL(scanResult) && (
              <a href={scanResult} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1 hover:underline font-bold">
                Open Link <ExternalLink size={12} />
              </a>
            )}
          </div>

          <p className="font-mono text-sm break-all bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg mb-4 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-800">
            {scanResult}
          </p>
          
          <div className="flex gap-2">
            <button 
              onClick={() => { navigator.clipboard.writeText(scanResult); alert("Copied!"); }}
              className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition text-zinc-900 dark:text-zinc-100"
            >
              <Copy size={16} /> Copy
            </button>

            <button 
              onClick={shareData}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
            >
              <Share2 size={16} /> Share
            </button>

            <button 
              onClick={() => setScanResult(null)}
              className="p-2.5 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-lg hover:opacity-80 transition"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}