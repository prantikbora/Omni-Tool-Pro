"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import { saveToHistory } from "../scanner/history-utils"; // Import history logic
import { Loader2, Copy, ImagePlus, Type, X } from "lucide-react";

export default function OcrTool() {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleOcr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview and reset states
    setImagePreview(URL.createObjectURL(file));
    setLoading(true);
    setText("");
    setProgress(0);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      const extractedText = result.data.text;
      setText(extractedText);
      
      // Persist to LocalStorage History
      saveToHistory(extractedText, "ocr");
      
    } catch (err) {
      console.error(err);
      alert("Failed to extract text. Ensure the image is clear and contains readable characters.");
    } finally {
      setLoading(false);
    }
  };

  const clearTool = () => {
    setText("");
    setImagePreview(null);
    setProgress(0);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Upload & Preview Zone */}
      {!imagePreview ? (
        <label className="w-full h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all group">
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="text-zinc-400 group-hover:text-blue-500 transition-colors" size={28} />
            <span className="text-sm font-medium text-zinc-500">Upload image to extract text</span>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleOcr} />
        </label>
      ) : (
        <div className="relative w-full aspect-video max-h-48 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
          <img src={imagePreview} alt="OCR Preview" className="w-full h-full object-contain" />
          <button 
            onClick={clearTool}
            className="absolute top-2 right-2 p-1.5 bg-zinc-900/50 hover:bg-zinc-900 text-white rounded-full backdrop-blur-sm transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {loading && (
        <div className="w-full space-y-3 animate-in fade-in">
          <div className="flex justify-between text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest">
            <span>Analyzing Image...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300 shadow-[0_0_8px_rgba(37,99,235,0.5)]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="flex justify-center">
             <Loader2 className="animate-spin text-blue-600" size={20} />
          </div>
        </div>
      )}

      {/* Result Display */}
      {text && !loading && (
        <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-zinc-400">
              <Type size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Extracted Content</span>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(text);
                alert("Text copied!");
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <Copy size={12} /> Copy All
            </button>
          </div>
          <textarea 
            className="w-full h-48 p-4 text-sm font-sans bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 ring-blue-500 outline-none resize-none leading-relaxed text-zinc-800 dark:text-zinc-200 shadow-inner"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}