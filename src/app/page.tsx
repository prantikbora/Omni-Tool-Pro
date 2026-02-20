"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Scan,
  FileText,
  Image as ImageIcon,
  Sun,
  Moon,
  Clock,
  Trash2,
  Languages,
} from "lucide-react";

// Feature Imports
import Scanner from "@/features/scanner/Scanner";
import PdfConverter from "@/features/pdf-tools/PdfConverter";
import ImageOptimizer from "@/features/image-tools/ImageOptimizer";
import OcrTool from "@/features/ocr/OcrTool";
import { getHistory, HistoryItem } from "@/features/scanner/history-utils";

type ToolId = "ocr" | "pdf" | "image" | "scanner";

export default function Home() {
  // Initialize with a default, but we'll update it in useEffect to avoid hydration errors
  const [activeTool, setActiveTool] = useState<ToolId>("scanner"); 
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 1. Initial Load Logic
  useEffect(() => {
    setMounted(true);
    
    // Load persisted tab preference
    const savedTab = localStorage.getItem("omnitool_active_tab") as ToolId;
    if (savedTab) {
      setActiveTool(savedTab);
    }
    
    // Load history
    setHistory(getHistory());
  }, []);

  // 2. Persistence Logic: Save tab whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("omnitool_active_tab", activeTool);
      setHistory(getHistory());
    }
  }, [activeTool, mounted]);

  const clearAllData = () => {
    if (confirm("This will clear your history and reset your preferences. Continue?")) {
      localStorage.removeItem("omnitool_history");
      localStorage.removeItem("omnitool_active_tab");
      setHistory([]);
      setActiveTool("scanner"); // Reset to default
    }
  };

  // Prevent rendering until mounted to ensure localStorage is accessible
  if (!mounted) return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 font-sans">
      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <header className="mb-12 flex items-start justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
              OmniTool<span className="text-blue-600">.</span>
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              Private, client-side tools. No data ever leaves your device.
            </p>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm transition-all hover:scale-110 active:scale-95"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Navigation Tabs */}
        <nav className="mb-8 grid grid-cols-4 gap-2 p-1 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-2xl">
          <TabButton
            active={activeTool === "ocr"}
            onClick={() => setActiveTool("ocr")}
            icon={<Languages size={18} />}
            label="OCR"
          />
          <TabButton
            active={activeTool === "pdf"}
            onClick={() => setActiveTool("pdf")}
            icon={<FileText size={18} />}
            label="PDF"
          />
          <TabButton
            active={activeTool === "image"}
            onClick={() => setActiveTool("image")}
            icon={<ImageIcon size={18} />}
            label="Image"
          />
          <TabButton
            active={activeTool === "scanner"}
            onClick={() => setActiveTool("scanner")}
            icon={<Scan size={18} />}
            label="Scanner"
          />
        </nav>

        {/* Tool Content Area */}
        <section className="min-h-[480px] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none transition-all">
          {activeTool === "ocr" && <OcrTool />}
          {activeTool === "pdf" && <PdfConverter />}
          {activeTool === "image" && <ImageOptimizer />}
          {activeTool === "scanner" && <Scanner />}
        </section>

        {/* Persistent History View */}
        <section className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">
              <Clock size={14} /> Recent Activity
            </h3>
            {(history.length > 0 || activeTool !== "scanner") && (
              <button
                onClick={clearAllData}
                className="text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">
                <p className="text-xs text-zinc-400 font-medium">
                  Your history will appear here.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs flex justify-between items-center group hover:border-blue-200 dark:hover:border-blue-900 transition-all"
                >
                  <div className="truncate pr-8 flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                        item.type === "scan"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {item.type.toUpperCase()}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[200px] sm:max-w-md">
                      {item.data}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="mt-16 text-center">
          <p className="text-[10px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
            Privately Processed in Browser &bull; Next.js 16 &bull; Webpack
            Engine
          </p>
        </footer>
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-xl py-3 px-1 transition-all ${
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
          : "text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
      }`}
    >
      {icon}
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">
        {label}
      </span>
    </button>
  );
}