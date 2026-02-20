"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { 
  Upload, Download, Loader2, Maximize, 
  MoveDiagonal, Layers, FileType 
} from "lucide-react";

type ImageFormat = "image/jpeg" | "image/png" | "image/webp";

export default function ImageOptimizer() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Settings States
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [targetSizeMB, setTargetSizeMB] = useState<number>(1);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("image/webp");
  const [dpi, setDpi] = useState<number>(72);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalFile(file);
    processImage(file);
  };

  const processImage = async (file: File) => {
    setCompressedFile(null);
    setIsCompressing(true);

    const options = {
      maxSizeMB: targetSizeMB,
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      useWebWorker: true,
      fileType: targetFormat, // Logic: browser-image-compression handles the conversion
      initialQuality: 0.8,
    };

    try {
      const compressed = await imageCompression(file, options);
      setCompressedFile(compressed);
    } catch (error) {
      console.error("Processing failed:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadImage = () => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const link = document.createElement("a");
    
    // Get correct extension for the filename
    const ext = targetFormat.split("/")[1];
    const originalName = originalFile?.name.split(".")[0];
    
    link.href = url;
    link.download = `${originalName}-optimized.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Precision Settings Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <InputGroup label="Width" value={maxWidth} onChange={setMaxWidth} icon={<Maximize size={10}/>} />
        <InputGroup label="Height" value={maxHeight} onChange={setMaxHeight} icon={<Maximize size={10} className="rotate-90"/>} />
        <InputGroup label="Size (MB)" value={targetSizeMB} onChange={setTargetSizeMB} step={0.1} icon={<MoveDiagonal size={10}/>} />
        
        {/* New Format Selector */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter flex items-center gap-1">
            <FileType size={10} /> Format
          </label>
          <select 
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs font-bold focus:ring-2 ring-blue-500 outline-none cursor-pointer appearance-none"
          >
            <option value="image/webp">WEBP</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
          </select>
        </div>
      </div>

      {/* Upload, Preview, and Action Buttons logic remains consistent... */}
      {!originalFile ? (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group">
          <Upload className="text-zinc-300 group-hover:text-blue-500 mb-2 transition-colors" size={32} />
          <p className="text-xs font-bold text-zinc-500">Drop Image to Convert</p>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      ) : (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
             <img 
               src={URL.createObjectURL(originalFile)} 
               alt="Preview" 
               className="w-full max-h-48 object-contain" 
             />
          </div>

          <button
            onClick={() => originalFile && processImage(originalFile)}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg"
          >
            Convert & Apply Settings
          </button>

          {compressedFile && (
            <button
              onClick={downloadImage}
              disabled={isCompressing}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 text-white py-4 rounded-xl font-black hover:opacity-90 transition disabled:opacity-50"
            >
              {isCompressing ? <Loader2 className="animate-spin" /> : <><Download size={18} /> Export as {targetFormat.split("/")[1].toUpperCase()}</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function InputGroup({ label, value, onChange, icon, step = 1 }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter flex items-center gap-1">
        {icon} {label}
      </label>
      <input 
        type="number" 
        step={step}
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs font-mono focus:ring-2 ring-blue-500 outline-none"
      />
    </div>
  );
}